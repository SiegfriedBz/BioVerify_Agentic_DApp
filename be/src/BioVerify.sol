// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

struct BioVerifyConfig {
    address aiAgent;
    address treasury;
    uint256 pubMinFee;
    uint256 pubMinStake;
    uint256 revMinStake;
    uint32 minReviewsCount;
    uint256 vrfSubId;
    bytes32 vrfKeyHash;
    uint32 vrfGasLimit;
    uint16 vrfConfirmations;
    uint32 vrfNumWords;
    address vrfCoordinator;
}

// --- Errors ---
error BioVerify_MustPayToPublish();
error BioVerify_InsufficientPublisherStake();
error BioVerify_InsufficientPublisherFee();
error BioVerify_InsufficientReviewerStake();
error BioVerify_AlreadyReviewer();
error BioVerify_OnlyAgent();
error BioVerify_InvalidPublicationId(uint256 publicationId);
error BioVerify_AlreadySlashed(uint256 publicationId);
error BioVerify_AlreadyInReview(uint256 publicationId);
error BioVerify_InsufficientReviewerPool(uint256 poolSize);
error BioVerify_ZeroValueToTransfer();
error BioVerify_FailedToTransferTo(address to);

// --- Events ---
event BioVerify_JoinReviewerPool(address reviewer);
event BioVerify_SubmittedPublication(address indexed publisher, uint256 indexed publicationId, string cid);
event BioVerify_SlashedPublisher(uint256 publicationId, address publisher);
event BioVerify_Agent_TransferTotalSlashed(address to, uint256 value);
event BioVerify_Agent_SetMemberReputationScore(address member, uint256 score);
event BioVerify_Agent_RequestedVRF(uint256 publicationId, uint256 requestId);
event BioVerify_Agent_PickedReviewers(
    uint256 indexed publicationId,
    string rootCid,
    address[] reviewers,
    address seniorReviewer,
    uint256 minValidReviewsCount
);

/**
 * @title BioVerify Protocol
 * @notice A decentralized research validation protocol using AI agents and staked peer review.
 */
contract BioVerify is VRFConsumerBaseV2Plus, ReentrancyGuard {
    enum PublicationStatus {
        SUBMITTED,
        IN_REVIEW,
        PUBLISHED,
        ESCALATED,
        SLASHED
    }

    struct Publication {
        uint256 id;
        address publisher;
        address[] reviewers;
        string[] cids;
        PublicationStatus status;
        uint256 paidSubmissionFee;
    }

    // --- State Variables ---
    uint256 public nextPublicationId;
    uint256 public totalSubmissionFees; // Pool for VRF operational costs
    uint256 public totalSlashed; // Pending treasury transfers

    mapping(address => uint256[]) public publisherToPublicationIds;
    mapping(uint256 => string) public publicationCurrentCid;
    mapping(uint256 => mapping(address => uint256)) public publicationStakes;
    mapping(uint256 => uint256) public publicationTotalStake;

    mapping(address => bool) public isReviewer;
    mapping(address => uint256) public reviewerTotalStake;
    mapping(address => uint256) internal memberReputationScore;
    mapping(uint256 => uint256) internal vrfRequestIdToPublicationId;

    address[] public reviewerPool;
    Publication[] public publications;

    // --- Immutables ---
    address public immutable I_AI_AGENT_ADDRESS;
    address public immutable I_TREASURY_ADDRESS;
    uint256 public immutable I_PUBLISHER_MIN_FEE;
    uint256 public immutable I_PUBLISHER_MIN_STAKE;
    uint256 public immutable I_REVIEWER_MIN_STAKE;
    uint256 public immutable I_VRF_SUBSCRIPTION_ID;
    bytes32 public immutable I_VRF_KEY_HASH;
    uint32 public immutable I_VRF_CALLBACK_GAS_LIMIT;
    uint16 public immutable I_VRF_REQUEST_CONFIRMATIONS;
    uint32 public immutable I_VRF_NUM_WORDS;
    uint32 public immutable I_MIN_REVIEWS_COUNT;

    modifier onlyAgent() {
        _onlyAgent();
        _;
    }

    constructor(BioVerifyConfig memory config) VRFConsumerBaseV2Plus(config.vrfCoordinator) {
        I_AI_AGENT_ADDRESS = config.aiAgent;
        I_TREASURY_ADDRESS = config.treasury;
        I_PUBLISHER_MIN_FEE = config.pubMinFee;
        I_PUBLISHER_MIN_STAKE = config.pubMinStake;
        I_REVIEWER_MIN_STAKE = config.revMinStake;
        I_MIN_REVIEWS_COUNT = config.minReviewsCount;
        I_VRF_SUBSCRIPTION_ID = config.vrfSubId;
        I_VRF_KEY_HASH = config.vrfKeyHash;
        I_VRF_CALLBACK_GAS_LIMIT = config.vrfGasLimit;
        I_VRF_REQUEST_CONFIRMATIONS = config.vrfConfirmations;
        I_VRF_NUM_WORDS = config.vrfNumWords;
    }

    /**
     * @notice Registers a new research paper.
     * @param _cid The IPFS root CID containing the manifest and files.
     * @param _paidSubmissionFee The portion of msg.value allocated for VRF gas costs.
     */
    function submitPublication(string calldata _cid, uint256 _paidSubmissionFee) external payable {
        // Check
        if (msg.value < I_PUBLISHER_MIN_STAKE + I_PUBLISHER_MIN_FEE) revert BioVerify_MustPayToPublish();

        uint256 publicationId = nextPublicationId;
        uint256 stake = msg.value - _paidSubmissionFee;

        if (stake < I_PUBLISHER_MIN_STAKE) revert BioVerify_InsufficientPublisherStake();
        if (_paidSubmissionFee < I_PUBLISHER_MIN_FEE) revert BioVerify_InsufficientPublisherFee();

        // Effect
        totalSubmissionFees += _paidSubmissionFee;

        Publication storage newPublication = publications.push();
        newPublication.id = publicationId;
        newPublication.publisher = msg.sender;
        newPublication.cids.push(_cid);
        newPublication.status = PublicationStatus.SUBMITTED;
        newPublication.paidSubmissionFee = _paidSubmissionFee;

        publicationCurrentCid[publicationId] = _cid;
        publisherToPublicationIds[msg.sender].push(publicationId);
        publicationStakes[publicationId][msg.sender] = stake;
        publicationTotalStake[publicationId] = stake;

        nextPublicationId++;
        emit BioVerify_SubmittedPublication(msg.sender, publicationId, _cid);
    }

    /**
     * @notice Allows a user to join the reviewer pool by staking ETH.
     */
    function joinReviewerPool() public payable {
        // Check
        if (msg.value < I_REVIEWER_MIN_STAKE) revert BioVerify_InsufficientReviewerStake();
        if (isReviewer[msg.sender]) revert BioVerify_AlreadyReviewer();

        // Effect
        isReviewer[msg.sender] = true;
        reviewerPool.push(msg.sender);
        reviewerTotalStake[msg.sender] = msg.value;

        emit BioVerify_JoinReviewerPool(msg.sender);
    }

    /**
     * @notice Slashes a publisher's stake. Restricted to AI Agent.
     * @param _publicationId The ID of the fraudulent publication.
     */
    function slashPublisher(uint256 _publicationId) external onlyAgent {
        // Check
        if (_publicationId >= nextPublicationId) revert BioVerify_InvalidPublicationId(_publicationId);

        Publication storage publication = publications[_publicationId];
        if (publication.status == PublicationStatus.SLASHED) revert BioVerify_AlreadySlashed(_publicationId);

        // Effect
        address publisher = publication.publisher;
        uint256 publisherStake = publicationStakes[_publicationId][publisher];

        publicationStakes[_publicationId][publisher] = 0;
        publicationTotalStake[_publicationId] -= publisherStake;
        totalSlashed += publisherStake;
        publication.status = PublicationStatus.SLASHED;
        memberReputationScore[publisher] = 0;

        emit BioVerify_SlashedPublisher(_publicationId, publisher);
    }

    /**
     * @notice Triggers Chainlink VRF to select reviewers. Restricted to AI Agent.
     * @param _publicationId The ID of the publication ready for review.
     */
    function pickReviewers(uint256 _publicationId) external onlyAgent returns (uint256 requestId) {
        // Check
        if (_publicationId >= nextPublicationId) revert BioVerify_InvalidPublicationId(_publicationId);
        if (reviewerPool.length < I_VRF_NUM_WORDS + 1) revert BioVerify_InsufficientReviewerPool(reviewerPool.length);

        Publication storage publication = publications[_publicationId];
        if (publication.status == PublicationStatus.IN_REVIEW) revert BioVerify_AlreadyInReview(_publicationId);

        // Effect
        totalSubmissionFees -= publication.paidSubmissionFee;
        publication.status = PublicationStatus.IN_REVIEW;

        // Interaction
        s_vrfCoordinator.fundSubscriptionWithNative{value: publication.paidSubmissionFee}(I_VRF_SUBSCRIPTION_ID);

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: I_VRF_KEY_HASH,
                subId: I_VRF_SUBSCRIPTION_ID,
                requestConfirmations: I_VRF_REQUEST_CONFIRMATIONS,
                callbackGasLimit: I_VRF_CALLBACK_GAS_LIMIT,
                numWords: I_VRF_NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}))
            })
        );

        vrfRequestIdToPublicationId[requestId] = _publicationId;

        emit BioVerify_Agent_RequestedVRF(_publicationId, requestId);
    }

    /**
     * @notice Internal callback for Chainlink VRF.
     * Picks I_VRF_NUM_WORDS candidates, promotes the one with highest reputation
     * to Senior Reviewer, and assigns the rest as Peer Reviewers.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 publicationId = vrfRequestIdToPublicationId[requestId];
        Publication storage publication = publications[publicationId];

        uint256 poolSize = reviewerPool.length;
        address publisher = publication.publisher;

        // 1. Pick I_VRF_NUM_WORDS unique candidates from the reviewer pool
        address[] memory candidates = new address[](I_VRF_NUM_WORDS);

        for (uint32 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            uint256 index = randomWords[i] % poolSize;
            address candidate = reviewerPool[index];

            while (_isAlreadySelected(candidates, candidate, i) || candidate == publisher) {
                index = (index + 1) % poolSize;
                candidate = reviewerPool[index];
            }
            candidates[i] = candidate;
        }

        // 2. Identify the most reputable one as Senior
        uint256 seniorIndex = 0;
        uint256 highestRep = memberReputationScore[candidates[0]];

        for (uint32 i = 1; i < I_VRF_NUM_WORDS; i++) {
            uint256 reviewerRep = memberReputationScore[candidates[i]];
            if (reviewerRep > highestRep) {
                seniorIndex = i;
                highestRep = reviewerRep;
            }
        }

        address senior = candidates[seniorIndex];

        // 3. The others become the peer reviewers
        for (uint256 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            if (i != seniorIndex) {
                publication.reviewers.push(candidates[i]);
            }
        }

        string memory cid = publicationCurrentCid[publicationId];

        emit BioVerify_Agent_PickedReviewers(publicationId, cid, publication.reviewers, senior, I_MIN_REVIEWS_COUNT);
    }

    /**
     * @notice Sweeps slashed funds to the treasury. Restricted to AI Agent.
     */
    function transferTotalSlashed() external onlyAgent nonReentrant {
        uint256 value = totalSlashed;

        // Check
        if (value == 0) revert BioVerify_ZeroValueToTransfer();

        // Effect
        totalSlashed = 0;

        // Interaction
        (bool sent,) = I_TREASURY_ADDRESS.call{value: value}("");
        if (!sent) revert BioVerify_FailedToTransferTo(I_TREASURY_ADDRESS);

        emit BioVerify_Agent_TransferTotalSlashed(I_TREASURY_ADDRESS, value);
    }

    /**
     * @notice Updates a member's reputation. Restricted to AI Agent.
     */
    function setMemberReputationScore(address _member, uint256 _score) external onlyAgent {
        memberReputationScore[_member] = _score;
        emit BioVerify_Agent_SetMemberReputationScore(_member, _score);
    }

    function getMemberReputationScore(address _member) public view returns (uint256) {
        return memberReputationScore[_member];
    }

    function getFullPublication(uint256 _id) external view returns (Publication memory) {
        return publications[_id];
    }

    function _onlyAgent() internal view {
        if (msg.sender != I_AI_AGENT_ADDRESS) revert BioVerify_OnlyAgent();
    }

    function _isAlreadySelected(address[] memory selected, address candidate, uint32 limit)
        internal
        pure
        returns (bool)
    {
        for (uint32 i = 0; i < limit; i++) {
            // Only check up to 'limit' so we don't compare against the 0x0 padding
            if (selected[i] == candidate) return true;
        }
        return false;
    }
}


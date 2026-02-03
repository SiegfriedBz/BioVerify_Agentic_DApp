// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

// errors
error BioVerify_MustPayToSubmit();
error BioVerify_InsufficientReviewerStake();
error BioVerify_AlreadyReviewer();
error BioVerify_OnlyAgent();
error BioVerify_InvalidPublicationId(uint256 publicationId);
error BioVerify_AlreadySlashed(uint256 publicationId);
error BioVerify_AlreadyInReview(uint256 publicationId);
error BioVerify_InsufficientReviewerPool(uint256 poolSize);
error BioVerify_ZeroValueToTransfer();
error BioVerify_FailedToTransferTo(address to);

// events
event BioVerify_JoinReviewerPool(address reviewer);
event BioVerify_SubmittedPublication(address publisher, uint256 id, string cid);
event BioVerify_SlashedPublisher(uint256 publicationId, address publisher);
event BioVerify_AgentTransferTotalSlashed(address to, uint256 value);
event BioVerify_AgentSetMemberReputationScore(address member, uint256 score);
event BioVerify_RequestedVRF(uint256 publicationId, uint256 requestId);
event BioVerify_PickedReviewers(uint256 publicationId, address[] reviewers, uint256 requestId);

contract BioVerify is VRFConsumerBaseV2Plus, ReentrancyGuard {
    // storage
    uint256 public nextPublicationId;
    uint256 public totalSlashed;
    mapping(address publisher => uint256[] publicationIds) public publisherToPublicationIds;
    mapping(uint256 publicationId => string cid) public publicationCurrentCid;
    mapping(uint256 publicationId => mapping(address staker => uint256 stake)) public publicationStakes;
    mapping(uint256 publicationId => uint256 totalStake) public publicationTotalStake;
    mapping(address reviewer => bool) public isReviewer;
    mapping(address reviewer => uint256 stake) public reviewerTotalStake;
    mapping(address member => uint256 score) internal memberReputationScore;
    mapping(uint256 vrfRequestId => uint256 publicationId) internal vrfRequestIdToPublicationId;
    address[] public reviewerPool;
    Publication[] public publications;

    // immutable
    address public immutable I_AI_AGENT_ADDRESS;
    address public immutable I_TREASURY_ADDRESS;
    uint256 public immutable I_SUBMISSION_FEE;
    uint256 public immutable I_PUBLISHER_MIN_STAKE;
    uint256 public immutable I_REVIEWER_MIN_STAKE;
    uint256 public immutable I_VRF_SUBSCRIPTION_ID;
    bytes32 public immutable I_VRF_KEY_HASH;
    uint32 public immutable I_VRF_CALLBACK_GAS_LIMIT;
    uint16 public immutable I_VRF_REQUEST_CONFIRMATIONS;
    uint32 public immutable I_VRF_NUM_WORDS;

    // custom types
    struct Publication {
        uint256 id;
        address publisher;
        address[] reviewers;
        string[] cids;
        PublicationStatus status;
    }

    // enums
    enum PublicationStatus {
        SUBMITTED,
        IN_REVIEW,
        PUBLISHED,
        ESCALATED,
        SLASHED
    }

    // modifiers
    modifier onlyAgent() {
        _onlyAgent();
        _;
    }

    // functions
    constructor(
        address _aiAgentAddress,
        address _treasuryAddress,
        uint256 _submissionFee,
        uint256 _publisherMinStake,
        uint256 _reviewerMinStake,
        uint256 _vrfSubscriptionId,
        bytes32 _vrfKeyHash,
        uint32 _vrfCallbackGasLimit,
        uint16 _vrfRequestConfirmations,
        uint32 _vrfNumWords,
        address _vrfCoordinator
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        I_AI_AGENT_ADDRESS = _aiAgentAddress;
        I_TREASURY_ADDRESS = _treasuryAddress;
        I_SUBMISSION_FEE = _submissionFee;
        I_PUBLISHER_MIN_STAKE = _publisherMinStake;
        I_REVIEWER_MIN_STAKE = _reviewerMinStake;
        I_VRF_SUBSCRIPTION_ID = _vrfSubscriptionId;
        I_VRF_KEY_HASH = _vrfKeyHash;
        I_VRF_CALLBACK_GAS_LIMIT = _vrfCallbackGasLimit;
        I_VRF_REQUEST_CONFIRMATIONS = _vrfRequestConfirmations;
        I_VRF_NUM_WORDS = _vrfNumWords;
    }

    function submitPublication(string memory _cid) external payable {
        // 1. Check
        if (msg.value < I_SUBMISSION_FEE + I_PUBLISHER_MIN_STAKE) {
            revert BioVerify_MustPayToSubmit();
        }
        // 2. Effect
        uint256 publicationId = nextPublicationId;
        uint256 stake = msg.value - I_SUBMISSION_FEE;

        Publication storage newPublication = publications.push();
        newPublication.id = publicationId;
        newPublication.publisher = msg.sender;
        newPublication.cids.push(_cid);
        newPublication.status = PublicationStatus.SUBMITTED;

        publicationCurrentCid[publicationId] = _cid;
        publisherToPublicationIds[msg.sender].push(publicationId);
        publicationStakes[publicationId][msg.sender] = stake;
        publicationTotalStake[publicationId] = stake;

        nextPublicationId++;

        emit BioVerify_SubmittedPublication(msg.sender, publicationId, _cid);
    }

    function joinReviewerPool() public payable {
        // 1. Check
        if (msg.value < I_REVIEWER_MIN_STAKE) {
            revert BioVerify_InsufficientReviewerStake();
        }
        if (isReviewer[msg.sender]) {
            revert BioVerify_AlreadyReviewer();
        }

        // 2. Effect
        isReviewer[msg.sender] = true;
        reviewerPool.push(msg.sender);
        reviewerTotalStake[msg.sender] = msg.value;

        emit BioVerify_JoinReviewerPool(msg.sender);
    }

    function slashPublisher(uint256 _publicationId) external onlyAgent {
        // 1. Check
        if (_publicationId >= nextPublicationId) {
            revert BioVerify_InvalidPublicationId(_publicationId);
        }

        Publication storage publication = publications[_publicationId];
        if (publication.status == PublicationStatus.SLASHED) {
            revert BioVerify_AlreadySlashed(_publicationId);
        }

        // 2. Effect
        address publisher = publication.publisher;
        uint256 publisherStake = publicationStakes[_publicationId][publisher];
        publicationStakes[_publicationId][publisher] = 0;
        publicationTotalStake[_publicationId] -= publisherStake;
        totalSlashed += publisherStake;
        publication.status = PublicationStatus.SLASHED;
        memberReputationScore[publisher] = 0;

        emit BioVerify_SlashedPublisher(_publicationId, publisher);
    }

    function pickReviewers(uint256 _publicationId) external onlyAgent returns (uint256 requestId) {
        // 1. Checks
        if (_publicationId >= nextPublicationId) {
            revert BioVerify_InvalidPublicationId(_publicationId);
        }

        // Ensure we have enough reviewers to actually pick unique ones
        if (reviewerPool.length < I_VRF_NUM_WORDS + 1) {
            // + 1 accounts for the fact that the Publisher might be in the pool and must be excluded.
            revert BioVerify_InsufficientReviewerPool(reviewerPool.length);
        }

        Publication storage publication = publications[_publicationId];
        if (publication.status == PublicationStatus.IN_REVIEW) {
            revert BioVerify_AlreadyInReview(_publicationId);
        }

        // 2. Effect
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: I_VRF_KEY_HASH,
                subId: I_VRF_SUBSCRIPTION_ID,
                requestConfirmations: I_VRF_REQUEST_CONFIRMATIONS,
                callbackGasLimit: I_VRF_CALLBACK_GAS_LIMIT,
                numWords: I_VRF_NUM_WORDS,
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );

        vrfRequestIdToPublicationId[requestId] = _publicationId;

        emit BioVerify_RequestedVRF(_publicationId, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 publicationId = vrfRequestIdToPublicationId[requestId];
        Publication storage publication = publications[publicationId];

        // 1. Check
        if (publication.status == PublicationStatus.IN_REVIEW) {
            revert BioVerify_AlreadyInReview(publicationId);
        }

        // 2. Effects
        uint256 poolSize = reviewerPool.length;
        address publisher = publication.publisher;

        for (uint32 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            uint256 index = randomWords[i] % poolSize;
            address candidate = reviewerPool[index];

            // Ensure uniqueness and that the publisher isn't reviewing their own work
            while (_isAlreadySelected(publication.reviewers, candidate) || candidate == publisher) {
                index = (index + 1) % poolSize;
                candidate = reviewerPool[index];
            }

            publication.reviewers.push(candidate);
        }

        publication.status = PublicationStatus.IN_REVIEW;

        emit BioVerify_PickedReviewers(publicationId, publication.reviewers, requestId);
    }

    function transferTotalSlashed() external onlyAgent nonReentrant {
        // 1. Check
        uint256 value = totalSlashed;
        if (value == 0) {
            revert BioVerify_ZeroValueToTransfer();
        }

        // 2. Effect
        totalSlashed = 0;

        // 3. Interactions
        (bool sent,) = I_TREASURY_ADDRESS.call{value: value}("");
        if (!sent) {
            revert BioVerify_FailedToTransferTo(I_TREASURY_ADDRESS);
        }

        emit BioVerify_AgentTransferTotalSlashed(I_TREASURY_ADDRESS, value);
    }

    function setMemberReputationScore(address _member, uint256 _score) external onlyAgent nonReentrant {
        memberReputationScore[_member] = _score;

        emit BioVerify_AgentSetMemberReputationScore(_member, _score);
    }

    // view
    function getMemberReputationScore(address _member) public view returns (uint256) {
        return memberReputationScore[_member];
    }

    function getFullPublication(uint256 _id) external view returns (Publication memory) {
        return publications[_id];
    }

    // internal
    function _onlyAgent() internal view {
        if (msg.sender != I_AI_AGENT_ADDRESS) {
            revert BioVerify_OnlyAgent();
        }
    }

    // Helper to check for duplicates when picking reviewers
    function _isAlreadySelected(address[] memory selected, address candidate) internal pure returns (bool) {
        for (uint256 i = 0; i < selected.length; i++) {
            if (selected[i] == candidate) return true;
        }
        return false;
    }
}

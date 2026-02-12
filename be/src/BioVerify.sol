// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title BioVerifyConfig
 * @notice Configuration struct for protocol deployment parameters.
 */
struct BioVerifyConfig {
    uint256 reputationBoost;
    address aiAgent;
    address treasury;
    // publisher
    uint256 pubMinFee;
    uint256 pubMinStake;
    // reviewer
    uint256 revMinStake;
    uint256 revReward;
    // min reviews count in reviewing process
    uint32 minReviewsCount;
    // vrf
    uint256 vrfSubId;
    bytes32 vrfKeyHash;
    uint32 vrfGasLimit;
    uint16 vrfConfirmations;
    uint32 vrfNumWords;
    address vrfCoordinator;
}

// --- Errors ---
error BioVerify_OnlyAgent();
error BioVerify_MustPayToPublish();
error BioVerify_InsufficientPublisherFee();
error BioVerify_InsufficientPublisherStake();
error BioVerify_MustPayReviewerMinStake();
error BioVerify_InvalidPublicationId(uint256 pubId);
error BioVerify_AlreadySlashed(uint256 pubId);
error BioVerify_AlreadyInReview(uint256 pubId);
error BioVerify_InsufficientReviewersPool(uint256 poolSize);
error BioVerify_InsufficientRewardPool(uint256 rewardPool);
error BioVerify_FailedToTransferTo(address to);
error BioVerify_MustBeInReviewToSettle(uint256 pubId);
error BioVerify_PublicationStatusNotFinalized(uint256 pubId);
error BioVerify_ZeroValueToTransfer();
error BioVerify_InSufficientContractBalance(uint256 balance);

// --- Events ---
event BioVerify_SubmitPublication(address indexed publisher, uint256 indexed pubId, string indexed cid);
event BioVerify_PayReviewerMinStake(address indexed reviewer);
event BioVerify_Claimed(address indexed member, uint256 indexed pubId, uint256 indexed amount);
event BioVerify_Agent_TransferTotalSlashed(address indexed to, uint256 indexed value);
event BioVerify_Agent_RequestVRF(uint256 indexed pubId, uint256 indexed requestId);
event BioVerify_Agent_PickReviewers(
    uint256 indexed pubId,
    address[] reviewers,
    address indexed seniorReviewer,
    string rootCid,
    uint256 minValidReviewsCount
);
event BioVerify_Agent_RewardReviewer(address indexed member, uint256 indexed newReputation, uint256 indexed pubId);
event BioVerify_Agent_SlashMember(address indexed member, uint256 indexed newReputation, uint256 indexed pubId);
event BioVerify_Agent_PublishPublication(uint256 indexed pubId);
event BioVerify_Agent_SlashPublication(uint256 indexed pubId);

/**
 * @title BioVerify Protocol
 * @author Siegfried Bozza
 * @notice A decentralized research validation protocol using AI agents and meritocratic peer review.
 */
contract BioVerify is VRFConsumerBaseV2Plus, ReentrancyGuard {
    // --- Types ---
    enum PublicationStatus {
        SUBMITTED,
        IN_REVIEW,
        SLASHED,
        PUBLISHED
    }

    struct Publication {
        uint256 id;
        uint256 stakes;
        uint256 paidSubmissionFee;
        address publisher;
        address[] reviewers;
        address seniorReviewer;
        string[] cids;
        PublicationStatus status;
    }

    struct Member {
        address memberAddress;
        uint256 stakes;
        uint256[] publishedPublicationsIds;
        bool isReviewer;
        uint256 reputation;
    }

    // --- State Variables ---
    uint256 public rewardPool;
    uint256 public slashedPool;
    uint256 public nextPubId;
    address[] public memberAddresses;

    mapping(uint256 => Publication) public idToPublication;
    mapping(address => Member) public addressToMember;
    mapping(address => mapping(uint256 => uint256)) public memberStakeOnPubId;
    mapping(uint256 => uint256) internal vrfRequestToPubId;

    // --- Immutable Protocol Constants ---
    address public immutable I_AI_AGENT_ADDRESS;
    address public immutable I_TREASURY_ADDRESS;
    bytes32 public immutable I_VRF_KEY_HASH;
    uint256 public immutable I_REPUTATION_BOOST;
    uint256 public immutable I_PUBLISHER_MIN_FEE;
    uint256 public immutable I_PUBLISHER_MIN_STAKE;
    uint256 public immutable I_REVIEWER_MIN_STAKE;
    uint256 public immutable I_REVIEWER_REWARD;
    uint256 public immutable I_VRF_SUBSCRIPTION_ID;
    uint32 public immutable I_VRF_CALLBACK_GAS_LIMIT;
    uint32 public immutable I_VRF_NUM_WORDS;
    uint32 public immutable I_MIN_REVIEWS_COUNT;
    uint16 public immutable I_VRF_REQUEST_CONFIRMATIONS;

    // --- Modifiers ---
    modifier onlyValidPubId(uint256 _pubId) {
        _onlyValidPubId(_pubId);
        _;
    }

    modifier onlyAgent() {
        _onlyAgent();
        _;
    }

    /**
     * @notice Initializes the BioVerify protocol with necessary configurations and reward pool funding.
     * @param config The struct containing all protocol parameters (reputation, fees, VRF settings).
     */
    constructor(BioVerifyConfig memory config) payable VRFConsumerBaseV2Plus(config.vrfCoordinator) {
        rewardPool = msg.value;
        I_AI_AGENT_ADDRESS = config.aiAgent;
        I_TREASURY_ADDRESS = config.treasury;
        I_REPUTATION_BOOST = config.reputationBoost;
        I_PUBLISHER_MIN_FEE = config.pubMinFee;
        I_PUBLISHER_MIN_STAKE = config.pubMinStake;
        I_REVIEWER_MIN_STAKE = config.revMinStake;
        I_REVIEWER_REWARD = config.revReward;
        I_MIN_REVIEWS_COUNT = config.minReviewsCount;
        I_VRF_SUBSCRIPTION_ID = config.vrfSubId;
        I_VRF_KEY_HASH = config.vrfKeyHash;
        I_VRF_CALLBACK_GAS_LIMIT = config.vrfGasLimit;
        I_VRF_REQUEST_CONFIRMATIONS = config.vrfConfirmations;
        I_VRF_NUM_WORDS = config.vrfNumWords;
    }

    /**
     * @notice Fallback function to allow funding of the reward pool.
     */
    receive() external payable {
        rewardPool += msg.value;
    }

    /**
     * @notice Allows a member to claim their original stake plus rewards after a publication is finalized.
     * @param _pubId The unique ID of the publication to claim from.
     */
    function claimStakeOnPublication(uint256 _pubId) external onlyValidPubId(_pubId) nonReentrant {
        Publication storage pub = idToPublication[_pubId];
        // Check
        if (pub.status != PublicationStatus.PUBLISHED && pub.status != PublicationStatus.SLASHED) {
            revert BioVerify_PublicationStatusNotFinalized(_pubId);
        }

        uint256 amountToClaim = memberStakeOnPubId[msg.sender][_pubId];
        if (amountToClaim == 0) revert BioVerify_ZeroValueToTransfer();

        uint256 bal = address(this).balance;
        if (bal < amountToClaim) revert BioVerify_InSufficientContractBalance(bal);

        // Effect
        memberStakeOnPubId[msg.sender][_pubId] = 0;
        addressToMember[msg.sender].stakes -= amountToClaim;
        pub.stakes -= amountToClaim;

        // Interaction
        (bool sent,) = msg.sender.call{value: amountToClaim}("");
        if (!sent) revert BioVerify_FailedToTransferTo(msg.sender);

        emit BioVerify_Claimed(msg.sender, _pubId, amountToClaim);
    }

    /**
     * @notice Starts a new publication registration with the protocol.
     * @param _cid The IPFS content identifier for the research manifest.
     * @param _paidSubmissionFee The portion of msg.value used for infrastructure and VRF costs.
     */
    function submitPublication(string calldata _cid, uint256 _paidSubmissionFee) external payable {
        // Check
        if (msg.value < I_PUBLISHER_MIN_STAKE + I_PUBLISHER_MIN_FEE) revert BioVerify_MustPayToPublish();

        uint256 stake = msg.value - _paidSubmissionFee;
        if (stake < I_PUBLISHER_MIN_STAKE) revert BioVerify_InsufficientPublisherStake();
        if (_paidSubmissionFee < I_PUBLISHER_MIN_FEE) revert BioVerify_InsufficientPublisherFee();

        // Effect
        uint256 pubId = nextPubId++;

        Member storage member = addressToMember[msg.sender];
        if (member.memberAddress == address(0)) {
            member.memberAddress = msg.sender;
            memberAddresses.push(msg.sender);
        }
        member.publishedPublicationsIds.push(pubId);
        member.stakes += stake;
        memberStakeOnPubId[msg.sender][pubId] = stake;

        Publication storage pub = idToPublication[pubId];
        pub.id = pubId;
        pub.publisher = msg.sender;
        pub.cids.push(_cid);
        pub.status = PublicationStatus.SUBMITTED;
        pub.paidSubmissionFee = _paidSubmissionFee;
        pub.stakes = stake;

        emit BioVerify_SubmitPublication(msg.sender, pubId, _cid);
    }

    /**
     * @notice Allows a user to register as a potential reviewer by depositing the required minimum stake.
     */
    function payReviewerMinStake() public payable {
        // Check
        if (msg.value != I_REVIEWER_MIN_STAKE) revert BioVerify_MustPayReviewerMinStake();

        // Effect
        Member storage member = addressToMember[msg.sender];
        if (member.memberAddress == address(0)) {
            member.memberAddress = msg.sender;
            memberAddresses.push(msg.sender);
        }

        member.isReviewer = true;
        member.stakes += msg.value;

        emit BioVerify_PayReviewerMinStake(msg.sender);
    }

    /**
     * @notice Initiates the reviewer selection process using Chainlink VRF.
     * @dev Restricted to the AI Agent.
     * @param _pubId The publication awaiting review.
     * @return requestId The unique identifier for the VRF request.
     */
    function pickReviewers(uint256 _pubId) external onlyAgent onlyValidPubId(_pubId) returns (uint256 requestId) {
        address[] memory solventReviewersAddresses = _getSolventReviewersAddresses();

        // Check if enough solvent reviewers (need I_VRF_NUM_WORDS peer reviewers + 1 senior reviewer)
        uint256 poolSize = solventReviewersAddresses.length;
        if (poolSize < I_VRF_NUM_WORDS + 1) revert BioVerify_InsufficientReviewersPool(poolSize);

        // Check if contract holds enough rewards
        uint256 cashOutForRewards = I_REVIEWER_REWARD * I_VRF_NUM_WORDS;
        if (rewardPool < cashOutForRewards) revert BioVerify_InsufficientRewardPool(rewardPool);

        Publication storage pub = idToPublication[_pubId];
        if (pub.status == PublicationStatus.IN_REVIEW) revert BioVerify_AlreadyInReview(_pubId);

        // Effect
        pub.status = PublicationStatus.IN_REVIEW;

        // fund vrf with publisher paid submission fee
        s_vrfCoordinator.fundSubscriptionWithNative{value: pub.paidSubmissionFee}(I_VRF_SUBSCRIPTION_ID);

        // request random words
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

        vrfRequestToPubId[requestId] = _pubId;

        emit BioVerify_Agent_RequestVRF(_pubId, requestId);
    }

    /**
     * @notice Finalizes a publication as successful.
     * @dev Restricted to the AI Agent.
     * Rewards publisher (reputation boost only) and honest reviewers.
     * Slashes negligent reviewers.
     * @param _pubId The ID of the publication to publish.
     * @param _honest Array of reviewer addresses who voted correctly.
     * @param _negligent Array of reviewer addresses who voted incorrectly.
     */
    function publishPublication(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
        external
        onlyAgent
        onlyValidPubId(_pubId)
    {
        Publication storage pub = idToPublication[_pubId];
        // Check
        if (pub.status != PublicationStatus.IN_REVIEW) revert BioVerify_MustBeInReviewToSettle(_pubId);

        // Effect
        pub.status = PublicationStatus.PUBLISHED;
        addressToMember[pub.publisher].reputation += I_REPUTATION_BOOST;

        for (uint256 i = 0; i < _honest.length; ++i) {
            _rewardReviewer(_honest[i], _pubId);
        }
        for (uint256 i = 0; i < _negligent.length; ++i) {
            _slashMember(_negligent[i], _pubId);
        }

        uint256 totalRewardsAdded = I_REVIEWER_REWARD * _honest.length;
        uint256 totalSlashed = I_REVIEWER_MIN_STAKE * _negligent.length;

        pub.stakes = pub.stakes + totalRewardsAdded - totalSlashed;
        slashedPool += totalSlashed;

        emit BioVerify_Agent_PublishPublication(_pubId);
    }

    /**
     * @notice Finalizes a publication as fraudulent.
     * Rewards honest reviewers.
     * Slashes the publisher and negligent reviewers.
     * @dev Restricted to the AI Agent.
     * @param _pubId The ID of the publication to slash.
     * @param _honest Array of reviewer addresses who correctly flagged issues.
     * @param _negligent Array of reviewer addresses who failed to flag issues.
     */
    function slashPublication(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
        external
        onlyAgent
        onlyValidPubId(_pubId)
    {
        Publication storage pub = idToPublication[_pubId];
        // Check
        if (pub.status != PublicationStatus.IN_REVIEW) revert BioVerify_MustBeInReviewToSettle(_pubId);

        // Effect
        pub.status = PublicationStatus.SLASHED;
        _slashMember(pub.publisher, _pubId);

        for (uint256 i = 0; i < _honest.length; ++i) {
            _rewardReviewer(_honest[i], _pubId);
        }
        for (uint256 i = 0; i < _negligent.length; ++i) {
            _slashMember(_negligent[i], _pubId);
        }

        uint256 totalRewardsAdded = I_REVIEWER_REWARD * _honest.length;
        uint256 totalSlashedFromReviewers = I_REVIEWER_MIN_STAKE * _negligent.length;

        pub.stakes = pub.stakes + totalRewardsAdded - totalSlashedFromReviewers;
        slashedPool += totalSlashedFromReviewers;

        emit BioVerify_Agent_SlashPublication(_pubId);
    }

    /**
     * @notice Transfers all collected slashed funds to the protocol treasury.
     * @dev Restricted to the AI Agent.
     */
    function transferSlashedPool() external onlyAgent nonReentrant {
        // Check
        uint256 value = slashedPool;
        if (value == 0) revert BioVerify_ZeroValueToTransfer();

        // Effect
        slashedPool = 0;

        // Interaction
        (bool sent,) = I_TREASURY_ADDRESS.call{value: value}("");
        if (!sent) revert BioVerify_FailedToTransferTo(I_TREASURY_ADDRESS);

        emit BioVerify_Agent_TransferTotalSlashed(I_TREASURY_ADDRESS, value);
    }

    /**
     * @notice Retrieves the current manifest CID for a publication.
     * @param _pubId The publication ID.
     * @return The most recent CID string.
     */
    function getCurrentCid(uint256 _pubId) public view onlyValidPubId(_pubId) returns (string memory) {
        Publication storage pub = idToPublication[_pubId];
        return pub.cids[pub.cids.length - 1];
    }

    /**
     * @notice Retrieves full publication details.
     * @param _pubId The publication ID.
     * @return The Publication struct data.
     */
    function getPublication(uint256 _pubId) external view onlyValidPubId(_pubId) returns (Publication memory) {
        return idToPublication[_pubId];
    }

    /**
     * @notice Gets the reputation of a specific member.
     * @param _member The member address.
     * @return The reputation score.
     */
    function getMemberReputation(address _member) external view returns (uint256) {
        return addressToMember[_member].reputation;
    }

    // --- Internal Helpers ---

    /**
     * @dev Internal VRF callback. Picks unique candidates and assigns one as Senior based on reputation.
     * @param requestId The ID of the VRF request being fulfilled.
     * @param randomWords The array of random numbers provided by Chainlink.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        address[] memory solventReviewersAddresses = _getSolventReviewersAddresses();

        // Check if enough solvent reviewers (need I_VRF_NUM_WORDS peer reviewers + 1 senior reviewer)
        uint256 poolSize = solventReviewersAddresses.length;
        if (poolSize < I_VRF_NUM_WORDS + 1) revert BioVerify_InsufficientReviewersPool(poolSize);

        // Check if contract holds enough rewards
        uint256 cashOutForRewards = I_REVIEWER_REWARD * I_VRF_NUM_WORDS;
        if (rewardPool < cashOutForRewards) revert BioVerify_InsufficientRewardPool(rewardPool);

        // Effect
        rewardPool -= cashOutForRewards;

        uint256 pubId = vrfRequestToPubId[requestId];
        Publication storage publication = idToPublication[pubId];
        address publisher = publication.publisher;

        address[] memory candidates = new address[](I_VRF_NUM_WORDS);

        for (uint32 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            uint256 rdmIdx = randomWords[i] % poolSize;
            address candidate = solventReviewersAddresses[rdmIdx];

            while (_isAlreadySelected(candidates, candidate, i) || candidate == publisher) {
                rdmIdx = (rdmIdx + 1) % poolSize;
                candidate = solventReviewersAddresses[rdmIdx];
            }
            candidates[i] = candidate;
        }

        uint256 seniorIndex = 0;
        uint256 highestRep = addressToMember[candidates[0]].reputation;

        for (uint32 i = 1; i < I_VRF_NUM_WORDS; i++) {
            uint256 reviewerRep = addressToMember[candidates[i]].reputation;
            if (reviewerRep > highestRep) {
                seniorIndex = i;
                highestRep = reviewerRep;
            }
        }

        publication.seniorReviewer = candidates[seniorIndex];

        for (uint32 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            if (i != seniorIndex) publication.reviewers.push(candidates[i]);

            address selected = candidates[i];
            memberStakeOnPubId[selected][pubId] = I_REVIEWER_MIN_STAKE;
            publication.stakes += I_REVIEWER_MIN_STAKE;
        }

        emit BioVerify_Agent_PickReviewers(
            pubId, publication.reviewers, publication.seniorReviewer, getCurrentCid(pubId), I_MIN_REVIEWS_COUNT
        );
    }

    /**
     * @dev Increases reputation and tracks reward allocation for a reviewer.
     */
    function _rewardReviewer(address _reviewer, uint256 _pubId) internal {
        Member storage member = addressToMember[_reviewer];
        member.reputation += I_REPUTATION_BOOST;
        member.stakes += I_REVIEWER_REWARD;
        memberStakeOnPubId[_reviewer][_pubId] += I_REVIEWER_REWARD;

        emit BioVerify_Agent_RewardReviewer(_reviewer, member.reputation, _pubId);
    }

    /**
     * @dev Decreases reputation and zeros out publication stake for a member.
     */
    function _slashMember(address _member, uint256 _pubId) internal {
        uint256 mbStakeOnPubId = memberStakeOnPubId[_member][_pubId];
        // Check
        if (mbStakeOnPubId == 0) return;

        // Effect
        Member storage member = addressToMember[_member];
        uint256 rep = member.reputation;
        member.reputation = rep > I_REPUTATION_BOOST ? rep - I_REPUTATION_BOOST : 0;
        member.stakes -= mbStakeOnPubId;
        memberStakeOnPubId[_member][_pubId] = 0;

        emit BioVerify_Agent_SlashMember(_member, member.reputation, _pubId);
    }

    /**
     * @dev Filters global member pool for active reviewers with sufficient stake.
     */
    function _getSolventReviewersAddresses() internal view returns (address[] memory) {
        uint256 count;
        for (uint256 i = 0; i < memberAddresses.length; ++i) {
            Member memory member = addressToMember[memberAddresses[i]];
            if (member.isReviewer && member.stakes >= I_REVIEWER_MIN_STAKE) count++;
        }

        address[] memory addresses = new address[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < memberAddresses.length; ++i) {
            Member memory member = addressToMember[memberAddresses[i]];
            if (member.isReviewer && member.stakes >= I_REVIEWER_MIN_STAKE) {
                addresses[currentIndex] = member.memberAddress;
                currentIndex++;
            }
        }
        return addresses;
    }

    /**
     * @dev Internal access control check for the AI Agent.
     */
    function _onlyAgent() internal view {
        if (msg.sender != I_AI_AGENT_ADDRESS) revert BioVerify_OnlyAgent();
    }

    /**
     * @dev Internal check for publication existence.
     */
    function _onlyValidPubId(uint256 _pubId) internal view {
        if (_pubId >= nextPubId) revert BioVerify_InvalidPublicationId(_pubId);
    }

    /**
     * @dev Helper for unique reviewer selection during VRF fulfillment.
     */
    function _isAlreadySelected(address[] memory selected, address candidate, uint32 limit)
        internal
        pure
        returns (bool)
    {
        for (uint32 i = 0; i < limit; i++) {
            if (selected[i] == candidate) return true;
        }
        return false;
    }
}

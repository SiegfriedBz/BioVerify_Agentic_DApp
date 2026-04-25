// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @notice Configuration struct for deploying the BioVerifyV3 contract.
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
    // vrf
    address vrfCoordinator;
    uint32 vrfGasLimit;
    uint256 vrfSubId;
    bytes32 vrfKeyHash;
    uint16 vrfConfirmations;
    uint32 vrfNumWords;
}

// --- Types ---

/**
 * @notice Enum representing the current lifecycle stage of a publication.
 */
enum PublicationStatus {
    SUBMITTED, // Publisher has submitted the publication and staked.
    EARLY_SLASHED, // Publication was deemed fraudulent/negligent before human reviewing process.
    IN_REVIEW, // Reviewers have been picked via VRF and the review is ongoing.
    SLASHED, // Publication was deemed fraudulent/negligent after human reviewing process.
    PUBLISHED // Publication successfully passed peer review.
}

/**
 * @notice Represents a research publication.
 */
struct Publication {
    uint256 id;
    uint256 lockedStake;
    uint256 paidSubmissionFee;
    address publisher;
    address[] reviewers;
    address seniorReviewer;
    string cid;
    string verdictCid;
    PublicationStatus status;
}

/**
 * @notice Represents a user participating as either a Publisher or a Reviewer.
 */
struct Member {
    address mbAddress;
    uint256 availableStake;
    uint256 lockedStake;
    uint256[] submittedPublicationsIds;
    uint256 reputation;
}

// --- Errors ---
error BioVerify_NotAMember();
error BioVerify_InvalidPublicationId(uint256 pubId);
error BioVerify_ClaimTooMuch();
error BioVerify_ClaimFailTransferTo(address member, uint256 amount);
error BioVerify_InsufficientPayment();
error BioVerify_MustPayReviewerStake();
error BioVerify_AlreadyInReview(uint256 pubId);
error BioVerify_CanNotSettle(uint256 pubId, PublicationStatus from, PublicationStatus to);
error BioVerify_InsufficientReviewersPool(uint256 poolSize);
error BioVerify_InsufficientRewardPool(uint256 rewardPool);
error BioVerify_InsufficientSlashPoolToTransfer(uint256 slashPool);
error BioVerify_InsufficientSlashPoolToMove(uint256 slashPool);
error BioVerify_FailedToTransferTo(address to);
error BioVerify_OnlyAgent();
error BioVerify_InvalidReviewerCount();
error BioVerify_MemberNotReviewerForThisPub(address member, uint256 pubId);

// --- Events ---
// --- Protocol Pools ---
event RewardPool(uint256 newRewardPool);
event SlashPool(uint256 newSlashPool);

// --- Member State ---
event RewardMember(address indexed member);
event SlashMember(address indexed member);
event IsAvailableReviewer(address indexed reviewer, bool isAvailable, uint256 newActiveReviews);
event MemberReputation(address indexed member, uint256 newRep);
event MemberAvailableStake(address indexed member, uint256 newAvailStake);
event MemberLockedStake(address indexed member, uint256 newLockedStake);
event MemberLockedStakeOnPubId(address indexed member, uint256 indexed pubId, uint256 newLockedStake);
event Claim(address indexed member, uint256 amount, uint256 newAvailStake, uint256 newContractBal);

// --- Publication State ---
event SubmitPublication(address indexed publisher, uint256 indexed pubId, string cid, uint256 paidFee);
event LockedStakeOnPubId(uint256 indexed pubId, uint256 newLockedStake);
event NewPublicationStatus(uint256 indexed pubId, PublicationStatus newStatus);

// --- Agent Actions ---
event Agent_RequestVRF(uint256 indexed pubId, uint256 requestId);
event Agent_PickReviewers(
    uint256 indexed pubId, address indexed publisher, address[] reviewers, address seniorReviewer, string cid
);
event Agent_RecordReview(address indexed member, uint256 indexed pubId);
event Agent_FinalizePublication(uint256 indexed pubId, string verdictCid, PublicationStatus status);
event Agent_TransferSlashPoolToTreasury(address indexed to, uint256 amount, uint256 newSlashPool);
event Agent_MoveSlashPoolToRewardPool(uint256 amount, uint256 newSlashPool, uint256 newRewardPool);

/**
 * @title BioVerify Protocol
 * @author Siegfried Bozza
 * @notice A decentralized research validation protocol using AI agents and meritocratic peer review.
 * @dev Integrates Chainlink VRF for trustless reviewer selection and manages economic incentives (stake/slash).
 */
contract BioVerifyV3 is VRFConsumerBaseV2Plus, ReentrancyGuard {
    // --- State Variables ---
    uint256 public rewardPool;
    uint256 public slashPool;
    uint256 private nextPubId;

    address[] private memberAddresses;
    address[] private availableReviewersPool;

    mapping(address => uint256) private reviewerPoolIndex; // Stores array index + 1
    mapping(address => uint256) private reviewerCurrentActiveReviewsCount; // Tracks how many reviews they are currently doing
    mapping(uint256 => uint256) private vrfRequestToPubId;
    mapping(uint256 => Publication) private idToPublication;
    mapping(address => Member) private addressToMember;
    mapping(address => mapping(uint256 => uint256)) private memberLockedStakeOnPubId;
    mapping(address => mapping(uint256 => bool)) private hasSubmittedReviewOnPubId;

    // --- Immutable Protocol Constants ---
    address public immutable I_AI_AGENT_ADDRESS;
    address public immutable I_TREASURY_ADDRESS;
    uint256 public immutable I_REPUTATION_BOOST;
    uint256 public immutable I_PUBLISHER_MIN_FEE;
    uint256 public immutable I_PUBLISHER_STAKE;
    uint256 public immutable I_REVIEWER_STAKE;
    uint256 public immutable I_REVIEWER_REWARD;
    bytes32 private immutable I_VRF_KEY_HASH;
    uint256 private immutable I_VRF_SUBSCRIPTION_ID;
    uint32 private immutable I_VRF_CALLBACK_GAS_LIMIT;
    uint32 private immutable I_VRF_NUM_WORDS;
    uint16 private immutable I_VRF_REQUEST_CONFIRMATIONS;

    // --- Modifiers ---
    modifier onlyValidPubId(uint256 _pubId) {
        _onlyValidPubId(_pubId);
        _;
    }

    modifier onlyAgent() {
        _onlyAgent();
        _;
    }

    // --- Functions ---

    /**
     * @notice Initializes the protocol with configuration parameters.
     * @param config The BioVerifyConfig struct containing addresses and protocol parameters.
     */
    constructor(BioVerifyConfig memory config) payable VRFConsumerBaseV2Plus(config.vrfCoordinator) {
        rewardPool = msg.value;
        I_AI_AGENT_ADDRESS = config.aiAgent;
        I_TREASURY_ADDRESS = config.treasury;
        I_REPUTATION_BOOST = config.reputationBoost;
        I_PUBLISHER_MIN_FEE = config.pubMinFee;
        I_PUBLISHER_STAKE = config.pubMinStake;
        I_REVIEWER_STAKE = config.revMinStake;
        I_REVIEWER_REWARD = config.revReward;
        I_VRF_SUBSCRIPTION_ID = config.vrfSubId;
        I_VRF_KEY_HASH = config.vrfKeyHash;
        I_VRF_CALLBACK_GAS_LIMIT = config.vrfGasLimit;
        I_VRF_REQUEST_CONFIRMATIONS = config.vrfConfirmations;
        I_VRF_NUM_WORDS = config.vrfNumWords;

        emit RewardPool(msg.value);
    }

    /**
     * @notice Allows the contract to receive plain ETH to fund the reward pool.
     */
    receive() external payable {
        rewardPool += msg.value;
        emit RewardPool(rewardPool);
    }

    /**
     * @notice Allows a member to withdraw their available stake.
     * @param _amount The amount of ETH to withdraw.
     */
    function claim(uint256 _amount) external nonReentrant {
        // Check
        Member storage member = addressToMember[msg.sender];
        if (member.mbAddress == address(0)) {
            revert BioVerify_NotAMember();
        }

        if (member.availableStake < _amount) {
            revert BioVerify_ClaimTooMuch();
        }

        // Effect
        member.availableStake -= _amount;
        emit MemberAvailableStake(msg.sender, member.availableStake);

        _syncReviewerStatus(msg.sender);

        // Interaction
        (bool sent,) = msg.sender.call{value: _amount}("");
        if (!sent) revert BioVerify_ClaimFailTransferTo(msg.sender, _amount);

        emit Claim(msg.sender, _amount, member.availableStake, address(this).balance);
    }

    /**
     * @notice Deposits stake to register as a new reviewer or tops up the available stake of an existing reviewer.
     * @dev Increases the member's available stake, which is evaluated by `_syncReviewerStatus` to determine active pool eligibility and concurrent review capacity.
     */
    function payReviewerStake() external payable {
        // Check
        if (msg.value != I_REVIEWER_STAKE) revert BioVerify_MustPayReviewerStake();

        // Effect
        Member storage member = addressToMember[msg.sender];
        if (member.mbAddress == address(0)) {
            member.mbAddress = msg.sender;
            memberAddresses.push(msg.sender);
        }

        member.availableStake += I_REVIEWER_STAKE;
        emit MemberAvailableStake(msg.sender, member.availableStake);

        _syncReviewerStatus(msg.sender);
    }

    /**
     * @notice Submits a new research publication and locks the publisher's fixed protocol stake.
     * @dev The stake is always `I_PUBLISHER_STAKE`. The submission fee is derived from `msg.value`
     * as `msg.value - I_PUBLISHER_STAKE`, allowing callers to overpay the fee (e.g. to cover VRF
     * cost spikes) while enforcing a minimum fee via `I_PUBLISHER_MIN_FEE`.
     * @param _cid The IPFS content identifier of the publication.
     */
    function submitPublication(string calldata _cid) external payable {
        // Check
        if (msg.value < I_PUBLISHER_STAKE + I_PUBLISHER_MIN_FEE) revert BioVerify_InsufficientPayment();

        uint256 stake = I_PUBLISHER_STAKE;
        uint256 paidFee = msg.value - stake;

        // Effect
        uint256 pubId = nextPubId;

        Publication storage pub = idToPublication[pubId];
        pub.id = pubId;
        pub.publisher = msg.sender;
        pub.cid = _cid;
        pub.paidSubmissionFee = paidFee;
        pub.status = PublicationStatus.SUBMITTED;
        emit NewPublicationStatus(pubId, PublicationStatus.SUBMITTED);

        Member storage member = addressToMember[msg.sender];
        if (member.mbAddress == address(0)) {
            member.mbAddress = msg.sender;
            memberAddresses.push(msg.sender);
        }
        member.submittedPublicationsIds.push(pubId);
        member.availableStake += stake;
        emit MemberAvailableStake(msg.sender, member.availableStake);

        // Lock publisher stake on pubId.
        _lockStake(msg.sender, pubId, stake);

        emit SubmitPublication(msg.sender, pubId, _cid, paidFee);

        nextPubId++;
    }

    /**
     * @notice AI Agent triggers Chainlink VRF to select random reviewers for a submission.
     * @param _pubId The ID of the publication.
     * @return requestId The Chainlink VRF request ID.
     */
    function pickReviewers(uint256 _pubId) external onlyAgent onlyValidPubId(_pubId) returns (uint256 requestId) {
        // Check if enough reviewers
        uint256 minPoolSize = I_VRF_NUM_WORDS + 1; // need + 1 to ensure publisher can not self-review.
        uint256 poolSize = availableReviewersPool.length;
        if (poolSize < minPoolSize) revert BioVerify_InsufficientReviewersPool(poolSize);

        // Check if contract holds enough rewards
        uint256 rewardsProvision = I_VRF_NUM_WORDS * I_REVIEWER_REWARD;
        if (rewardPool < rewardsProvision) revert BioVerify_InsufficientRewardPool(rewardPool);

        Publication storage pub = idToPublication[_pubId];
        if (pub.status == PublicationStatus.IN_REVIEW) revert BioVerify_AlreadyInReview(_pubId);

        // Effect
        pub.status = PublicationStatus.IN_REVIEW;
        emit NewPublicationStatus(pub.id, PublicationStatus.IN_REVIEW);

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
        emit Agent_RequestVRF(_pubId, requestId);
    }

    /**
     * @notice AI Agent records that a specific reviewer has submitted their review.
     * @param _pubId The ID of the publication.
     * @param _reviewer The address of the reviewer.
     */
    function recordReview(uint256 _pubId, address _reviewer) external onlyAgent onlyValidPubId(_pubId) {
        if (hasSubmittedReviewOnPubId[_reviewer][_pubId]) return;

        hasSubmittedReviewOnPubId[_reviewer][_pubId] = true;
        emit Agent_RecordReview(_reviewer, _pubId);
    }

    /**
     * @notice AI Agent slashes a publication prior to human review (e.g., immediate detection of plagiarism).
     * @param _pubId The ID of the publication.
     * @param _verdictCid The IPFS CID containing the AI's rejection reasoning.
     */
    function earlySlashPublication(uint256 _pubId, string calldata _verdictCid)
        external
        onlyAgent
        onlyValidPubId(_pubId)
    {
        Publication storage pub = idToPublication[_pubId];
        // Check
        if (pub.status != PublicationStatus.SUBMITTED) {
            revert BioVerify_CanNotSettle(_pubId, pub.status, PublicationStatus.EARLY_SLASHED);
        }

        // Effect
        // Publisher Slash
        _unLockStakeAndSlash(pub.publisher, _pubId, true);

        _markPubAsFinalized(_pubId, _verdictCid, PublicationStatus.EARLY_SLASHED);
    }

    /**
     * @notice AI Agent successfully settles and publishes the paper post-review.
     * @param _pubId The ID of the publication.
     * @param _honest Array of reviewers who performed correctly.
     * @param _negligent Array of reviewers who were negligent or fraudulent.
     * @param _verdictCid The IPFS CID containing the final synthesized verdict.
     */
    function publishPublication(
        uint256 _pubId,
        address[] calldata _honest,
        address[] calldata _negligent,
        string calldata _verdictCid
    ) external onlyAgent onlyValidPubId(_pubId) {
        _settlePublication(_pubId, _honest, _negligent, _verdictCid, PublicationStatus.PUBLISHED);
    }

    /**
     * @notice AI Agent rejects and slashes the publication post-review.
     * @param _pubId The ID of the publication.
     * @param _honest Array of reviewers who performed correctly.
     * @param _negligent Array of reviewers who were negligent or fraudulent.
     * @param _verdictCid The IPFS CID containing the final synthesized verdict.
     */
    function slashPublication(
        uint256 _pubId,
        address[] calldata _honest,
        address[] calldata _negligent,
        string calldata _verdictCid
    ) external onlyAgent onlyValidPubId(_pubId) {
        _settlePublication(_pubId, _honest, _negligent, _verdictCid, PublicationStatus.SLASHED);
    }

    /**
     * @notice Moves accumulated slash penalties to the designated Treasury.
     * @param _amount The amount of ETH to transfer.
     */
    function transferSlashPoolToTreasury(uint256 _amount) external onlyAgent nonReentrant {
        // Check
        if (slashPool < _amount) revert BioVerify_InsufficientSlashPoolToTransfer(slashPool);

        // Effect
        slashPool -= _amount;

        // Interaction
        (bool sent,) = I_TREASURY_ADDRESS.call{value: _amount}("");
        if (!sent) revert BioVerify_FailedToTransferTo(I_TREASURY_ADDRESS);

        emit Agent_TransferSlashPoolToTreasury(I_TREASURY_ADDRESS, _amount, slashPool);
        emit SlashPool(slashPool);
    }

    /**
     * @notice Reallocates funds from the slash pool into the reward pool to sustain the protocol.
     * @param _amount The amount of ETH to move.
     */
    function moveSlashPoolToRewardPool(uint256 _amount) external onlyAgent {
        // Check
        if (slashPool < _amount) revert BioVerify_InsufficientSlashPoolToMove(slashPool);

        // Effect
        slashPool -= _amount;
        rewardPool += _amount;

        emit Agent_MoveSlashPoolToRewardPool(_amount, slashPool, rewardPool);
        emit SlashPool(slashPool);
        emit RewardPool(rewardPool);
    }

    // --- Internal ---

    /**
     * @notice Callback invoked by Chainlink VRF to finalize reviewer selection.
     * @dev Assigns reviewers, determines the senior reviewer based on reputation, and locks their stakes.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        // Check
        uint256 poolSize = availableReviewersPool.length;
        uint256 minPoolSize = I_VRF_NUM_WORDS + 1;
        if (poolSize < minPoolSize) revert BioVerify_InsufficientReviewersPool(poolSize);

        uint256 cashOutForRewards = I_REVIEWER_REWARD * I_VRF_NUM_WORDS;
        if (rewardPool < cashOutForRewards) revert BioVerify_InsufficientRewardPool(rewardPool);

        // Effect
        rewardPool -= cashOutForRewards;
        emit RewardPool(rewardPool);

        uint256 pubId = vrfRequestToPubId[requestId];
        Publication storage pub = idToPublication[pubId];
        address publisher = pub.publisher;

        // --- Candidate Selection ---
        address[] memory candidates = new address[](I_VRF_NUM_WORDS);
        for (uint32 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            uint256 rdmIdx = randomWords[i] % poolSize;
            address candidate = availableReviewersPool[rdmIdx];

            // Ensure unique selection and prevent publisher from self-reviewing
            while (_isAlreadySelected(candidates, candidate, i) || candidate == publisher) {
                rdmIdx = (rdmIdx + 1) % poolSize;
                candidate = availableReviewersPool[rdmIdx];
            }
            candidates[i] = candidate;
        }

        // --- Meritocratic Seniority Assignment ---
        uint256 seniorIndex = 0;
        uint256 highestRep = addressToMember[candidates[0]].reputation;

        for (uint32 i = 1; i < I_VRF_NUM_WORDS; i++) {
            uint256 reviewerRep = addressToMember[candidates[i]].reputation;
            if (reviewerRep > highestRep) {
                seniorIndex = i;
                highestRep = reviewerRep;
            }
        }

        // --- Finalizing Assignments & Stake Accounting ---
        pub.seniorReviewer = candidates[seniorIndex];

        for (uint32 i = 0; i < I_VRF_NUM_WORDS; ++i) {
            address reviewer = candidates[i];
            // Add non-senior reviewers to pub peer-reviewers
            if (i != seniorIndex) pub.reviewers.push(reviewer);

            // Lock reviewer available stake into pubId
            _lockStake(reviewer, pub.id, I_REVIEWER_STAKE);

            // Update reviewer status
            reviewerCurrentActiveReviewsCount[reviewer]++;
            _syncReviewerStatus(reviewer);
        }

        emit Agent_PickReviewers(pubId, pub.publisher, pub.reviewers, pub.seniorReviewer, pub.cid);
    }

    // --- Private ---

    /**
     * @dev Core logic for finalizing a publication after human reviews.
     */
    function _settlePublication(
        uint256 _pubId,
        address[] calldata _honest,
        address[] calldata _negligent,
        string calldata _verdictCid,
        PublicationStatus _newStatus
    ) private {
        Publication storage pub = idToPublication[_pubId];
        // Check
        if (_honest.length + _negligent.length != I_VRF_NUM_WORDS) {
            revert BioVerify_InvalidReviewerCount();
        }

        if (!(pub.status == PublicationStatus.IN_REVIEW
                    && (_newStatus == PublicationStatus.PUBLISHED || _newStatus == PublicationStatus.SLASHED))) {
            revert BioVerify_CanNotSettle(_pubId, pub.status, _newStatus);
        }

        // Effect
        // Publisher reward/slash
        if (_newStatus == PublicationStatus.PUBLISHED) {
            // Publisher reward
            _unLockStakeAndReward(pub.publisher, _pubId, true);
            _syncReviewerStatus(pub.publisher);
        } else if (_newStatus == PublicationStatus.SLASHED) {
            // Publisher Slash
            _unLockStakeAndSlash(pub.publisher, _pubId, true);
        }

        // Reviewers rewards/slashes & statuses update
        _rewardAndSlashReviewers(_pubId, _honest, _negligent);

        _markPubAsFinalized(_pubId, _verdictCid, _newStatus);
    }

    /**
     * @dev Updates the final state and CID of a publication.
     */
    function _markPubAsFinalized(uint256 _pubId, string calldata _verdictCid, PublicationStatus _newStatus) private {
        Publication storage pub = idToPublication[_pubId];
        pub.verdictCid = _verdictCid;
        pub.status = _newStatus;

        emit Agent_FinalizePublication(_pubId, _verdictCid, _newStatus);
        emit NewPublicationStatus(_pubId, _newStatus);
    }

    /**
     * @dev Moves a member's available stake into locked stake for a specific publication.
     */
    function _lockStake(address _member, uint256 _pubId, uint256 _amountToLock) private {
        Member storage member = addressToMember[_member];
        Publication storage pub = idToPublication[_pubId];

        // Update member available stake
        member.availableStake -= _amountToLock;
        emit MemberAvailableStake(_member, member.availableStake);

        // Update member locked stake
        member.lockedStake += _amountToLock;
        emit MemberLockedStake(_member, member.lockedStake);

        memberLockedStakeOnPubId[_member][_pubId] += _amountToLock;
        emit MemberLockedStakeOnPubId(_member, _pubId, memberLockedStakeOnPubId[_member][_pubId]);

        // Update total locked stake on pubId
        pub.lockedStake += _amountToLock;
        emit LockedStakeOnPubId(_pubId, pub.lockedStake);
    }

    /**
     * @dev Removes locked stake from a specific publication.
     */
    function _unLockStake(address _member, uint256 _pubId, uint256 _lockedAmount) private {
        Member storage member = addressToMember[_member];
        Publication storage pub = idToPublication[_pubId];

        // Update member locked stake
        member.lockedStake -= _lockedAmount;
        emit MemberLockedStake(_member, member.lockedStake);

        memberLockedStakeOnPubId[_member][_pubId] = 0;
        emit MemberLockedStakeOnPubId(_member, _pubId, 0);

        // Update total locked on pubId
        pub.lockedStake -= _lockedAmount;
        emit LockedStakeOnPubId(_pubId, pub.lockedStake);
    }

    /**
     * @dev Penalizes a member, decreases reputation, and moves their locked stake to the slash pool.
     */
    function _unLockStakeAndSlash(address _member, uint256 _pubId, bool _isPublisher) private {
        emit SlashMember(_member);

        Member storage member = addressToMember[_member];

        // Update member reputation
        uint256 currentRep = member.reputation;
        member.reputation = currentRep > I_REPUTATION_BOOST ? currentRep - I_REPUTATION_BOOST : 0;
        emit MemberReputation(_member, member.reputation);

        // Update member locked stake & Update total locked on pubId
        uint256 amountToSlash = memberLockedStakeOnPubId[_member][_pubId];
        _unLockStake(_member, _pubId, amountToSlash);

        // Update slashPool
        slashPool += amountToSlash;
        emit SlashPool(slashPool);

        // Update reward pool if not publisher. Re-allocate to rewardPool the provisioned I_REVIEWER_REWARD.
        if (!_isPublisher) {
            rewardPool += I_REVIEWER_REWARD;
            emit RewardPool(rewardPool);
        }
    }

    /**
     * @dev Rewards a member, increases reputation, and returns their stake (plus reward if reviewer).
     */
    function _unLockStakeAndReward(address _member, uint256 _pubId, bool _isPublisher) private {
        emit RewardMember(_member);

        Member storage member = addressToMember[_member];

        // Update member reputation. Publisher & Reviewers.
        member.reputation += I_REPUTATION_BOOST;
        emit MemberReputation(_member, member.reputation);

        // Update member locked stake & Update total locked on pubId
        uint256 lockedAmount = memberLockedStakeOnPubId[_member][_pubId];
        _unLockStake(_member, _pubId, lockedAmount);

        // Update member available stake. Publisher gets back locked stake only. Reviewers gets back locked stake + reward.
        uint256 returnAmount = _isPublisher ? lockedAmount : lockedAmount + I_REVIEWER_REWARD;
        member.availableStake += returnAmount;
        emit MemberAvailableStake(_member, member.availableStake);
    }

    /**
     * @dev Processes all reviewer stakes and reputation, based on AI Agent's honesty/negligence categorization.
     */
    function _rewardAndSlashReviewers(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
        private
    {
        // Honest Reviewers rewards & statuses update
        for (uint256 i = 0; i < _honest.length; ++i) {
            if (memberLockedStakeOnPubId[_honest[i]][_pubId] == 0) {
                revert BioVerify_MemberNotReviewerForThisPub(_honest[i], _pubId);
            }
            _unLockStakeAndReward(_honest[i], _pubId, false);
            reviewerCurrentActiveReviewsCount[_honest[i]]--;
            _syncReviewerStatus(_honest[i]);
        }

        // Negligent Reviewers slashes & statuses update
        for (uint256 i = 0; i < _negligent.length; ++i) {
            if (memberLockedStakeOnPubId[_negligent[i]][_pubId] == 0) {
                revert BioVerify_MemberNotReviewerForThisPub(_negligent[i], _pubId);
            }
            _unLockStakeAndSlash(_negligent[i], _pubId, false);
            reviewerCurrentActiveReviewsCount[_negligent[i]]--;
            _syncReviewerStatus(_negligent[i]);
        }
    }

    /**
     * @dev Core O(1) swap-and-pop logic to manage the active VRF reviewer pool based on financial solvency.
     */
    function _syncReviewerStatus(address _member) private {
        Member storage member = addressToMember[_member];

        bool shouldBeInPool = member.availableStake >= I_REVIEWER_STAKE;
        uint256 currentReviews = reviewerCurrentActiveReviewsCount[_member];
        bool isInPool = reviewerPoolIndex[_member] > 0;

        if (shouldBeInPool && !isInPool) {
            // ADD to pool
            availableReviewersPool.push(_member);
            reviewerPoolIndex[_member] = availableReviewersPool.length; // Index + 1
        } else if (!shouldBeInPool && isInPool) {
            // SWAP AND POP
            uint256 idx = reviewerPoolIndex[_member] - 1;
            address lastMember = availableReviewersPool[availableReviewersPool.length - 1];

            availableReviewersPool[idx] = lastMember;
            reviewerPoolIndex[lastMember] = idx + 1;

            availableReviewersPool.pop();
            reviewerPoolIndex[_member] = 0;
        }

        emit IsAvailableReviewer(_member, shouldBeInPool, currentReviews);
    }

    // --- Private View ---

    /**
     * @dev Internal access control check for the AI Agent.
     */
    function _onlyAgent() private view {
        if (msg.sender != I_AI_AGENT_ADDRESS) revert BioVerify_OnlyAgent();
    }

    /**
     * @dev Internal check for publication existence.
     */
    function _onlyValidPubId(uint256 _pubId) private view {
        if (_pubId >= nextPubId) revert BioVerify_InvalidPublicationId(_pubId);
    }

    // --- Private Pure ---

    /**
     * @dev Helper for unique reviewer selection during VRF fulfillment.
     */
    function _isAlreadySelected(address[] memory selected, address candidate, uint32 limit)
        private
        pure
        returns (bool)
    {
        for (uint32 i = 0; i < limit; i++) {
            if (selected[i] == candidate) return true;
        }
        return false;
    }
}

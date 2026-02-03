// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// errors
error BioVerify_MustPayToSubmit();
error BioVerify_InsufficientReviewerStake();
error BioVerify_AlreadyReviewer();
error BioVerify_OnlyAgent();
error BioVerify_InvalidPublicationId(uint256 publicationId);
error BioVerify_AlreadySlashed(uint256 publicationId);
error BioVerify_ZeroValueToTransfer();
error BioVerify_FailedToTransferTo(address to);

// events
event BioVerify_JoinReviewerPool(address reviewer);
event BioVerify_SubmittedPublication(address publisher, uint256 id, string cid);
event BioVerify_SlashedPublisher(uint256 publicationId, address publisher);
event BioVerify_AgentTransferTotalSlashed(address to, uint256 value);
event BioVerify_AgentSetMemberReputationScore(address member, uint256 score);

contract BioVerify is ReentrancyGuard {
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
    address[] public reviewerPool;
    Publication[] public publications;

    // immutable
    address public immutable I_AI_AGENT_ADDRESS;
    address public immutable I_TREASURY_ADDRESS;
    uint256 public immutable I_SUBMISSION_FEE;
    uint256 public immutable I_PUBLISHER_MIN_STAKE;
    uint256 public immutable I_REVIEWER_MIN_STAKE;

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
        address _slashedToAddress,
        uint256 _submissionFee,
        uint256 _publisherMinStake,
        uint256 _reviewerMinStake
    ) {
        I_AI_AGENT_ADDRESS = _aiAgentAddress;
        I_TREASURY_ADDRESS = _slashedToAddress;
        I_SUBMISSION_FEE = _submissionFee;
        I_PUBLISHER_MIN_STAKE = _publisherMinStake;
        I_REVIEWER_MIN_STAKE = _reviewerMinStake;
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

    // TODO ADD TESTS
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
        memberReputationScore[publisher] = 0; // TODO CHECK IN TESTS

        emit BioVerify_SlashedPublisher(_publicationId, publisher);
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
}

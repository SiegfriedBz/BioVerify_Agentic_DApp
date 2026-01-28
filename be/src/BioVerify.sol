// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// errors
error BioVerify_MustPayToSubmit();

// events
event BioVerify_SubmittedPublication(address publisher, uint256 id, string cid);

contract BioVerify {
    // storage
    uint256 nextPublicationId;
    mapping(uint256 publicationId => string cid) public publicationCurrentCid;
    mapping(address publisher => uint256[] publicationIds) public publisherToPublicationIds;
    mapping(uint256 publicationId => mapping(address staker => uint256 stake)) public publicationStakes;
    mapping(uint256 publicationId => uint256 totalStake) public publicationTotalStake;
    Publication[] public Publications;

    // immutable
    uint256 public immutable I_SUBMISSION_FEE;
    uint256 public immutable I_MIN_STAKE;

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

    // functions
    constructor(uint256 _submissionFee, uint256 _minStake) {
        I_SUBMISSION_FEE = _submissionFee;
        I_MIN_STAKE = _minStake;
    }

    function submitPublication(string memory _cid) external payable {
        // 1. Check
        if (msg.value < I_SUBMISSION_FEE + I_MIN_STAKE) {
            revert BioVerify_MustPayToSubmit();
        }
        // 2. Effect
        uint256 publicationId = nextPublicationId;
        uint256 stake = msg.value - I_SUBMISSION_FEE;

        Publication storage newPublication = Publications.push();
        newPublication.id = publicationId;
        newPublication.publisher = msg.sender;
        newPublication.cids.push(_cid);
        newPublication.status = PublicationStatus.SUBMITTED;

        publicationCurrentCid[publicationId] = _cid;
        publisherToPublicationIds[msg.sender].push(nextPublicationId);
        publicationStakes[publicationId][msg.sender] = stake;
        publicationTotalStake[publicationId] = stake;

        nextPublicationId++;

        emit BioVerify_SubmittedPublication(msg.sender, publicationId, _cid);
    }
}

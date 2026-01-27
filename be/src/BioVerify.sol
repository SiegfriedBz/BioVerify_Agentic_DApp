// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// errors
error BioVerify_MustPayToSubmit();

// events
event BioVerify_SubmittedProject(address publisher, uint256 id, string cid);

contract BioVerify {
    // storage
    uint256 nextProjectId;
    mapping(address publisher => uint256[] projectIds) public publisherToProjectIds;
    mapping(uint256 projectId => mapping(address staker => uint256 stake)) public projectStakes;
    mapping(uint256 projectId => uint256 totalStake) public totalProjectStake;

    // immutable
    uint256 public immutable I_SUBMISSION_FEE;
    uint256 public immutable I_MIN_STAKE;

    // custom types
    struct Project {
        uint256 id;
        address publisher;
        address[] reviewers;
        string[] cids;
        ProjectStatus status;
    }
    Project[] public projects;

    // enums
    enum ProjectStatus {
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
        uint256 projectId = nextProjectId;
        uint256 stake = msg.value - I_SUBMISSION_FEE;

        Project storage newProject = projects.push();
        newProject.id = projectId;
        newProject.publisher = msg.sender;
        newProject.cids.push(_cid);
        newProject.status = ProjectStatus.SUBMITTED;

        publisherToProjectIds[msg.sender].push(nextProjectId);
        projectStakes[projectId][msg.sender] = stake;
        totalProjectStake[projectId] = stake;

        nextProjectId++;

        emit BioVerify_SubmittedProject(msg.sender, projectId, _cid);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract VotingGuardian is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Election {
        string name;
        uint256 startTime;
        uint256 endTime;
        bytes32 merkleRoot; // For voter eligibility verification
        bool exists;
    }

    struct Candidate {
        bytes32 idHash; // keccak256(candidateId)
        uint256 positionId;
        bool exists;
    }

    event ElectionCreated(
        uint256 indexed electionId,
        string name,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed electionId,
        bytes32 indexed voterCommitment, // keccak256(voterId + secret)
        bytes32 indexed candidateHash
    );

    mapping(uint256 => Election) public elections;
    mapping(bytes32 => Candidate) public candidates;
    mapping(uint256 => mapping(bytes32 => bool)) public spentCommitments;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier validElection(uint256 electionId) {
        Election storage election = elections[electionId];
        require(election.exists, "Invalid election");
        require(block.timestamp >= election.startTime, "Not started");
        require(block.timestamp <= election.endTime, "Ended");
        _;
    }

    function createElection(
        uint256 electionId,
        string calldata name,
        uint256 startTime,
        uint256 endTime,
        bytes32 merkleRoot // Root of allowed voter IDs
    ) external onlyRole(ADMIN_ROLE) {
        require(!elections[electionId].exists, "Election exists");
        elections[electionId] = Election(
            name,
            startTime,
            endTime,
            merkleRoot,
            true
        );
        emit ElectionCreated(electionId, name, startTime, endTime);
    }

    function addCandidate(
        bytes32 idHash,
        uint256 positionId
    ) external onlyRole(ADMIN_ROLE) {
        require(!candidates[idHash].exists, "Candidate exists");
        candidates[idHash] = Candidate(idHash, positionId, true);
    }

    function castVote(
        uint256 electionId,
        bytes32 voterCommitment, // keccak256(voterId + secretSalt)
        bytes32 candidateHash,
        bytes32[] calldata merkleProof // Proof of voter eligibility
    ) external validElection(electionId) {
        Election storage election = elections[electionId];
        require(candidates[candidateHash].exists, "Invalid candidate");
        require(
            !spentCommitments[electionId][voterCommitment],
            "Already voted"
        );

        // Verify voter is allowed
        require(
            MerkleProof.verify(
                merkleProof,
                election.merkleRoot,
                keccak256(abi.encodePacked(voterCommitment))
            ),
            "Not an eligible voter"
        );

        spentCommitments[electionId][voterCommitment] = true;
        emit VoteCast(electionId, voterCommitment, candidateHash);
    }
}

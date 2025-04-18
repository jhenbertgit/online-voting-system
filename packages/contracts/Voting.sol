// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AnonymousVoting {
    // Election structure
    struct Election {
        string name;
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }

    // Candidate structure
    struct Candidate {
        bytes32 encryptedId; // Hashed candidate ID (e.g., keccak256(prismaCandidateId))
        uint256 positionId; // Matches Prisma's positionId
        bool exists;
    }

    // Vote event with encrypted voter identity
    event VoteCast(
        bytes32 indexed voterHash, // keccak256(voterClerkId + secretSalt)
        uint256 indexed electionId,
        bytes32 indexed candidateHash,
        uint256 positionId,
        uint256 timestamp
    );

    address public admin;
    mapping(uint256 => Election) public elections;
    mapping(bytes32 => Candidate) public candidates; // Key: candidateHash
    mapping(bytes32 => bool) public usedVoterHashes; // Prevent double-voting

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier validElection(uint256 electionId) {
        require(elections[electionId].exists, "Invalid election");
        require(
            block.timestamp >= elections[electionId].startTime,
            "Not started"
        );
        require(block.timestamp <= elections[electionId].endTime, "Ended");
        _;
    }

    // Admin setup functions
    function createElection(
        uint256 electionId,
        string calldata name,
        uint256 startTime,
        uint256 endTime
    ) external onlyAdmin {
        require(!elections[electionId].exists, "Election exists");
        elections[electionId] = Election(name, startTime, endTime, true);
    }

    function addCandidate(
        bytes32 candidateHash,
        uint256 positionId
    ) external onlyAdmin {
        require(!candidates[candidateHash].exists, "Candidate exists");
        candidates[candidateHash] = Candidate(candidateHash, positionId, true);
    }

    // Core voting function
    function castVote(
        bytes32 voterHash, // Frontend: keccak256(clerkUserId + secretSalt)
        uint256 electionId,
        bytes32 candidateHash,
        uint256 positionId
    ) external validElection(electionId) {
        require(candidates[candidateHash].exists, "Invalid candidate");
        require(!usedVoterHashes[voterHash], "Already voted");
        require(
            candidates[candidateHash].positionId == positionId,
            "Position mismatch"
        );

        usedVoterHashes[voterHash] = true;
        emit VoteCast(
            voterHash,
            electionId,
            candidateHash,
            positionId,
            block.timestamp
        );
    }

    // Verification view function
    function verifyVote(
        bytes32 voterHash,
        bytes32 candidateHash,
        uint256 electionId
    ) external view returns (bool) {
        return
            usedVoterHashes[voterHash] &&
            candidates[candidateHash].exists &&
            block.timestamp >= elections[electionId].startTime;
    }
}

pragma solidity ^0.4.0;

contract owned {
    address public owner;

    function owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

contract Ballot is owned {
    struct VoteCategory {
        string name;
    }

    struct Vote {
        uint8 points;
        address voter;
        uint categoryID;
    }

    struct Project {
        string name;
        Vote[] votes;
        mapping (address => mapping (uint => bool)) voted;
        mapping (address => mapping (uint => uint)) voteIDs;
    }

    Project[] public projects;
    uint public projectsCount;

    VoteCategory[] public voteCategories;
    uint public voteCategoriesCount;

    event ProjectAdded(uint projectID, string name);
    event Voted(uint projectID, uint8 points, uint voteCategory, address voter);

    // Setting up ballot

    function addProject(string name) onlyOwner returns (uint projectID) {
        projectID = projects.length++;
        Project p = projects[projectID];
        p.name = name;
        projectsCount = projects.length;
        ProjectAdded(projectID, name);
    }

    function addVoteCategory(string name) onlyOwner returns (uint categoryID) {
        categoryID = projects.length++;
        VoteCategory c = voteCategories[categoryID];
        c.name = name;
        voteCategoriesCount = voteCategories.length;
    }

    // Vote action

    function vote(uint projectID, uint voteCategory, uint8 points) returns (uint voteID) {
        Project p = projects[projectID];
        if (p.voted[msg.sender][voteCategory] == true) throw;

        voteID = p.votes.length++;
        p.votes[voteID] = Vote({points: points, voter: msg.sender, categoryID: voteCategory});
        p.voted[msg.sender][voteCategory] = true;
        p.voteIDs[msg.sender][voteCategory] = voteID;
        Voted(projectID, points, voteCategory, msg.sender);
    }

    // Fetch data

    function getVoteResult(uint projectID, uint voteCategory, address voter) returns (int16 points) {
        Project p = projects[projectID];
        if (p.voted[voter][voteCategory] == true) {
            uint voteID = p.voteIDs[voter][voteCategory];
            Vote vote = p.votes[voteID];
            points = vote.points;
        } else {
            points = -1;
        }
    }

    function getVotesCount(uint projectID) returns (uint votesCount) {
        Project p = projects[projectID];
        votesCount = p.votes.length;
    }

    function getCategoryPointsSum(uint projectID, uint categoryID) returns (uint points) {
        points = 0;
        Project p = projects[projectID];
        for (uint i = 0; i < p.votes.length; i++) {
            Vote vote = p.votes[i];
            if (vote.categoryID == categoryID) {
                points += vote.points;
            }
        }
    }

    function getCategoryVotesCount(uint projectID, uint categoryID) returns (uint count) {
        count = 0;
        Project p = projects[projectID];
        for (uint i = 0; i < p.votes.length; i++) {
            Vote vote = p.votes[i];
            if (vote.categoryID == categoryID) {
                count += 1;
            }
        }
    }

    function getVersion() returns (string version) {
        version = "0.2";
    }
}


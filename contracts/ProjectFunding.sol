// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ProjectFunding {
    struct Project {
        string name;
        string description;
        uint256 requiredFunding;
        uint256 currentFunding;
        address payable founder;
        bool isActive;
    }

    struct User {
        string name;
        string role;
        bool exists;
    }

    Project[] public projects;
    mapping(uint256 => mapping(address => uint256)) public investments;
    mapping(address => User) public users;

    event ProjectCreated(uint256 projectId, string name, uint256 requiredFunding);
    event ProjectFunded(uint256 projectId, address investor, uint256 amount);
    event UserRegistered(address userAddress, string name, string role);

    function registerUser(string memory _name, string memory _role) public {
        require(!users[msg.sender].exists, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_role).length > 0, "Role cannot be empty");
        
        users[msg.sender] = User({
            name: _name,
            role: _role,
            exists: true
        });
        
        emit UserRegistered(msg.sender, _name, _role);
    }

    function getUserInfo(address _userAddress) public view returns (string memory name, string memory role, bool exists) {
        User memory user = users[_userAddress];
        return (user.name, user.role, user.exists);
    }

    function createProject(
        string memory _name,
        string memory _description,
        uint256 _requiredFunding
    ) public {
        require(users[msg.sender].exists, "User must be registered");
        require(keccak256(bytes(users[msg.sender].role)) == keccak256(bytes("founder")), "Only founders can create projects");
        
        Project memory newProject = Project({
            name: _name,
            description: _description,
            requiredFunding: _requiredFunding,
            currentFunding: 0,
            founder: payable(msg.sender),
            isActive: true
        });
        projects.push(newProject);
        emit ProjectCreated(projects.length - 1, _name, _requiredFunding);
    }

    function investInProject(uint256 _projectId) public payable {
        require(users[msg.sender].exists, "User must be registered");
        require(keccak256(bytes(users[msg.sender].role)) == keccak256(bytes("investor")), "Only investors can invest");
        require(_projectId < projects.length, "Project does not exist");
        require(projects[_projectId].isActive, "Project is not active");
        require(msg.value > 0, "Investment must be greater than 0");

        Project storage project = projects[_projectId];
        project.currentFunding += msg.value;
        investments[_projectId][msg.sender] += msg.value;
        project.founder.transfer(msg.value);

        emit ProjectFunded(_projectId, msg.sender, msg.value);

        if (project.currentFunding >= project.requiredFunding) {
            project.isActive = false;
        }
    }

    function getProject(uint256 _projectId) public view returns (
        string memory name,
        string memory description,
        uint256 requiredFunding,
        uint256 currentFunding,
        address founder,
        bool isActive
    ) {
        require(_projectId < projects.length, "Project does not exist");
        Project memory project = projects[_projectId];
        return (
            project.name,
            project.description,
            project.requiredFunding,
            project.currentFunding,
            project.founder,
            project.isActive
        );
    }

    function getProjectCount() public view returns (uint256) {
        return projects.length;
    }
} 
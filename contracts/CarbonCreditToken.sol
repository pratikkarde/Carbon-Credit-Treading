// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CarbonCreditToken
 * @dev Implementation of the Carbon Credit Token
 * 
 * This token represents carbon credits on the blockchain.
 * Each token represents 1 metric ton of CO2 equivalent reduced or sequestered.
 */
contract CarbonCreditToken is ERC20, Ownable, Pausable {
    // Struct to store project information
    struct Project {
        string name;
        string location;
        string projectType;
        string certificationStandard;
        uint256 carbonReduction;
        uint256 issuanceDate;
        bool verified;
        address verifier;
    }
    
    // Mapping from project ID to Project struct
    mapping(uint256 => Project) public projects;
    
    // Mapping from project ID to token amount
    mapping(uint256 => uint256) public projectTokens;
    
    // Counter for project IDs
    uint256 private _projectCounter;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, string name, string location);
    event ProjectVerified(uint256 indexed projectId, address verifier);
    event TokensIssued(uint256 indexed projectId, uint256 amount);
    event TokensRetired(uint256 indexed projectId, uint256 amount, string reason);
    
    constructor() ERC20("Carbon Credit Token", "CCT") {
        _projectCounter = 0;
    }
    
    /**
     * @dev Creates a new carbon credit project
     * @param name Project name
     * @param location Project location
     * @param projectType Type of project (e.g., "Forest", "Renewable Energy")
     * @param certificationStandard Certification standard used
     * @param carbonReduction Amount of carbon reduced in metric tons
     */
    function createProject(
        string memory name,
        string memory location,
        string memory projectType,
        string memory certificationStandard,
        uint256 carbonReduction
    ) public onlyOwner {
        uint256 projectId = _projectCounter;
        _projectCounter++;
        
        projects[projectId] = Project({
            name: name,
            location: location,
            projectType: projectType,
            certificationStandard: certificationStandard,
            carbonReduction: carbonReduction,
            issuanceDate: block.timestamp,
            verified: false,
            verifier: address(0)
        });
        
        emit ProjectCreated(projectId, name, location);
    }
    
    /**
     * @dev Verifies a project and issues tokens
     * @param projectId ID of the project to verify
     */
    function verifyProject(uint256 projectId) public onlyOwner {
        require(projectId < _projectCounter, "Project does not exist");
        require(!projects[projectId].verified, "Project already verified");
        
        projects[projectId].verified = true;
        projects[projectId].verifier = msg.sender;
        
        // Issue tokens equal to the carbon reduction
        uint256 tokenAmount = projects[projectId].carbonReduction;
        projectTokens[projectId] = tokenAmount;
        _mint(msg.sender, tokenAmount);
        
        emit ProjectVerified(projectId, msg.sender);
        emit TokensIssued(projectId, tokenAmount);
    }
    
    /**
     * @dev Issues additional tokens for an existing project
     * @param projectId ID of the project
     * @param amount Amount of tokens to issue
     */
    function issueTokens(uint256 projectId, uint256 amount) public onlyOwner {
        require(projectId < _projectCounter, "Project does not exist");
        require(projects[projectId].verified, "Project not verified");
        
        projectTokens[projectId] += amount;
        _mint(msg.sender, amount);
        
        emit TokensIssued(projectId, amount);
    }
    
    /**
     * @dev Retires tokens (burns them permanently)
     * @param projectId ID of the project
     * @param amount Amount of tokens to retire
     * @param reason Reason for retiring the tokens
     */
    function retireTokens(uint256 projectId, uint256 amount, string memory reason) public {
        require(projectId < _projectCounter, "Project does not exist");
        require(projects[projectId].verified, "Project not verified");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        
        emit TokensRetired(projectId, amount, reason);
    }
    
    /**
     * @dev Pauses all token transfers
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override the _beforeTokenTransfer function to add pausable functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Returns project information
     * @param projectId ID of the project
     */
    function getProject(uint256 projectId) public view returns (
        string memory name,
        string memory location,
        string memory projectType,
        string memory certificationStandard,
        uint256 carbonReduction,
        uint256 issuanceDate,
        bool verified,
        address verifier,
        uint256 tokenAmount
    ) {
        require(projectId < _projectCounter, "Project does not exist");
        
        Project memory project = projects[projectId];
        return (
            project.name,
            project.location,
            project.projectType,
            project.certificationStandard,
            project.carbonReduction,
            project.issuanceDate,
            project.verified,
            project.verifier,
            projectTokens[projectId]
        );
    }
    
    /**
     * @dev Returns the total number of projects
     */
    function getProjectCount() public view returns (uint256) {
        return _projectCounter;
    }
} 
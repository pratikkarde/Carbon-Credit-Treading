// Carbon Credit Token Blockchain Integration
class CarbonCreditBlockchain {
    constructor() {
        this.contractAddress = null;
        this.contract = null;
        this.signer = null;
        this.provider = null;
        this.isConnected = false;
        this.account = null;
    }

    // Initialize Web3 and connect to the blockchain
    async initialize() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install MetaMask to use blockchain features.');
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            
            // Create Web3 provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Get the signer
            this.signer = this.provider.getSigner();
            
            // Get the network
            const network = await this.provider.getNetwork();
            console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
            
            // Load the contract ABI
            const response = await fetch('/assets/contracts/CarbonCreditToken.json');
            const contractData = await response.json();
            
            // Get the contract address from environment or localStorage
            this.contractAddress = localStorage.getItem('carbonCreditTokenAddress') || 
                                  process.env.CARBON_CREDIT_TOKEN_ADDRESS;
            
            if (!this.contractAddress) {
                throw new Error('Contract address not found. Please deploy the contract first.');
            }
            
            // Create contract instance
            this.contract = new ethers.Contract(
                this.contractAddress,
                contractData.abi,
                this.signer
            );
            
            this.isConnected = true;
            console.log('Blockchain connection established');
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
            
            return true;
        } catch (error) {
            console.error('Failed to initialize blockchain connection:', error);
            return false;
        }
    }
    
    // Handle account changes
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected their wallet
            this.isConnected = false;
            this.account = null;
            console.log('Wallet disconnected');
        } else {
            this.account = accounts[0];
            console.log(`Account changed to: ${this.account}`);
        }
    }
    
    // Handle chain changes
    handleChainChanged(chainId) {
        // Reload the page to ensure everything is in sync
        window.location.reload();
    }
    
    // Get the current account
    async getCurrentAccount() {
        if (!this.isConnected) {
            await this.initialize();
        }
        return this.account;
    }
    
    // Get the contract instance
    getContract() {
        if (!this.contract) {
            throw new Error('Contract not initialized. Call initialize() first.');
        }
        return this.contract;
    }
    
    // Get all projects
    async getAllProjects() {
        try {
            const contract = this.getContract();
            const projectCount = await contract.getProjectCount();
            
            const projects = [];
            for (let i = 0; i < projectCount; i++) {
                const project = await contract.getProject(i);
                projects.push({
                    id: i,
                    name: project[0],
                    location: project[1],
                    projectType: project[2],
                    certificationStandard: project[3],
                    carbonReduction: project[4].toString(),
                    issuanceDate: new Date(project[5].toNumber() * 1000).toISOString(),
                    verified: project[6],
                    verifier: project[7],
                    tokenAmount: project[8].toString()
                });
            }
            
            return projects;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    }
    
    // Get a specific project
    async getProject(projectId) {
        try {
            const contract = this.getContract();
            const project = await contract.getProject(projectId);
            
            return {
                id: projectId,
                name: project[0],
                location: project[1],
                projectType: project[2],
                certificationStandard: project[3],
                carbonReduction: project[4].toString(),
                issuanceDate: new Date(project[5].toNumber() * 1000).toISOString(),
                verified: project[6],
                verifier: project[7],
                tokenAmount: project[8].toString()
            };
        } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            throw error;
        }
    }
    
    // Get token balance
    async getBalance(address = null) {
        try {
            const contract = this.getContract();
            const account = address || await this.getCurrentAccount();
            const balance = await contract.balanceOf(account);
            return balance.toString();
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    }
    
    // Transfer tokens
    async transfer(to, amount) {
        try {
            const contract = this.getContract();
            const tx = await contract.transfer(to, amount);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error transferring tokens:', error);
            throw error;
        }
    }
    
    // Retire tokens
    async retireTokens(projectId, amount, reason) {
        try {
            const contract = this.getContract();
            const tx = await contract.retireTokens(projectId, amount, reason);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error retiring tokens:', error);
            throw error;
        }
    }
    
    // Create a new project (admin only)
    async createProject(name, location, projectType, certificationStandard, carbonReduction) {
        try {
            const contract = this.getContract();
            const tx = await contract.createProject(
                name,
                location,
                projectType,
                certificationStandard,
                carbonReduction
            );
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }
    
    // Verify a project (admin only)
    async verifyProject(projectId) {
        try {
            const contract = this.getContract();
            const tx = await contract.verifyProject(projectId);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error verifying project:', error);
            throw error;
        }
    }
    
    // Issue additional tokens (admin only)
    async issueTokens(projectId, amount) {
        try {
            const contract = this.getContract();
            const tx = await contract.issueTokens(projectId, amount);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error issuing tokens:', error);
            throw error;
        }
    }
}

// Initialize the blockchain integration
let blockchain = null;

// Function to initialize the blockchain
async function initializeBlockchain() {
    if (!blockchain) {
        blockchain = new CarbonCreditBlockchain();
        await blockchain.initialize();
    }
    return blockchain;
}

// Export the blockchain instance and initialization function
window.initializeBlockchain = initializeBlockchain;
window.blockchain = blockchain; 
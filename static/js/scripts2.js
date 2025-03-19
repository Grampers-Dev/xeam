document.addEventListener("DOMContentLoaded", async function () {
    const enableEthereumButton = document.getElementById("connect-wallet");
    const claimButton = document.getElementById("btnClaimIdentity");
    const successMessage = document.getElementById("successMessage");
    const requestTokensForm = document.getElementById('requestTokensForm');
    const metamaskInstallMessage = document.getElementById('metamaskInstallMessage');

    // Define a separate function for connecting the wallet
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request access to the user's Ethereum account(s)
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts.length > 0) {
                    const address = accounts[0];
                    // Shorten the address: first 2 characters and last 4 characters
                    const shortenedAddress = address.substring(0, 2) + "..." + address.substring(address.length - 4);
                    
                    // Update the button text to show the shortened address
                    enableEthereumButton.textContent = shortenedAddress;
                }
            } catch (error) {
                console.error("User denied account access or an error occurred:", error);
            }
        } else {
            console.error("No Ethereum provider found. Please install MetaMask or another wallet.");
        }
    }

    // Attach the click event listener directly to the button
    enableEthereumButton.addEventListener("click", connectWallet);

    
    // Contract details (defined once)
    const contractAddress = '0x2f3441EEE57cf40244aD680E8a4E517F3Fc6BFDC';
    const contractABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "OwnableInvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "OwnableUnauthorizedAccount",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "claimant",
                    "type": "address"
                }
            ],
            "name": "AddressClaimedEvent",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "claimAddress",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "pause",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "Paused",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "unclaimAddress",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "unpause",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "Unpaused",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "claimant",
                    "type": "address"
                }
            ],
            "name": "isAddressClaimed",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "paused",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];  // Your ABI here

    // Check if MetaMask iavailable
    const provider = await detectEthereumProvider();
    if (!provider) {
        console.log('Please install MetaMask!');
        metamaskInstallMessage.textContent = 'To interact with this website, you need to install ';
        const metamaskLink = document.createElement('a');
        metamaskLink.href = 'https://metamask.io/download/';
        metamaskLink.target = '_blank';
        metamaskLink.rel = 'noopener noreferrer';
        metamaskLink.textContent = 'MetaMask';
        metamaskInstallMessage.appendChild(metamaskLink);
        metamaskInstallMessage.classList.add("text-danger");
        return;
    }

    // Initialize Web3 and contract instance
    const web3 = new Web3(ethereum);
    const myContract = new web3.eth.Contract(contractABI, contractAddress);

    // Enable Ethereum connection
    enableEthereumButton.addEventListener("click", async () => {
        try {
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            const userWalletAddress = accounts[0];

            console.log('Connected to MetaMask');
            successMessage.textContent = "Connected to MetaMask!";
            successMessage.classList.add("text-success");
            claimButton.disabled = false;
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            successMessage.textContent = "Error connecting to MetaMask!";
            successMessage.classList.add("text-danger");
        }
    });

    // Claim address functionality
    claimButton.addEventListener("click", async () => {
        try {
            if (!ethereum.selectedAddress) {
                console.log("Please connect your wallet first.");
                return;
            }
            await myContract.methods.claimAddress().send({ from: ethereum.selectedAddress });
            successMessage.textContent = "Identity claimed successfully!";
            successMessage.classList.add("text-success");
        } catch (error) {
            console.error("Error claiming identity:", error);
            successMessage.textContent = "An unexpected error occurred.";
            successMessage.classList.add("text-danger");
        }
    });

    // Handle "Request Tokens" form submission
    requestTokensForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const walletAddress = document.getElementById('walletAddress').value;
        fetch('/submit-wallet-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({ walletAddress })
        }).then(response => response.json())
          .then(data => alert('Request sent successfully.'))
          .catch(error => console.error('Error:', error));
    });
});

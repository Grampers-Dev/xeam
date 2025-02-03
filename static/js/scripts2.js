document.addEventListener("DOMContentLoaded", async function () {
    // Get references to HTML elements if they exist
    const enableEthereumButton = document.getElementById("enableEthereumButton");
    const claimButton = document.getElementById("btnClaimIdentity");
    const successMessage = document.getElementById("successMessage");
    const requestTokensForm = document.getElementById('requestTokensForm');
    const metamaskInstallMessage = document.getElementById('metamaskInstallMessage'); // New element to display install message

    // Check if the required elements exist
    if (enableEthereumButton && claimButton && successMessage && requestTokensForm && metamaskInstallMessage) {
        enableEthereumButton.addEventListener("click", async () => {
            try {
                // Your existing code for MetaMask integration
                const provider = await detectEthereumProvider();

                if (provider) {
                    const accounts = await provider.request({ method: "eth_requestAccounts" });
                    const userWalletAddress = accounts[0];

                    const web3 = new Web3(ethereum);

                    const contractAddress = '0x68Ab1D520f7BE29f6497aAa30799589B98aF506e';
                    const contractABI = [
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "internalType": "address",
                                    "name": "owner",
                                    "type": "address"
                                }
                            ],
                            "name": "IdentityClaimed",
                            "type": "event"
                        },
                        {
                            "inputs": [],
                            "name": "claimIdentity",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "name": "identityOwners",
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
                    ];

                    const myContract = new web3.eth.Contract(contractABI, contractAddress);

                    console.log('Connected to MetaMask and initialized the contract.');
                    successMessage.textContent = "Connected to MetaMask and initialized the contract.";
                    successMessage.classList.add("text-success");
                    claimButton.disabled = false;

                    claimButton.addEventListener("click", async () => {
                        try {
                            if (!ethereum.selectedAddress) {
                                console.log("Please connect your wallet first.");
                                return;
                            }
                    
                            await myContract.methods.claimIdentity().send({ from: ethereum.selectedAddress });
                    
                            console.log("Identity claimed successfully!");
                            successMessag.textContent = "Identity claimed successfully!";
                            successMessage.classList.add("text-success");
                        } catch (error) {
                            console.error("Error claiming identity:", error);
                    
                            // Check if the error is due to the address already being claimed
                            if (error.message.includes('Transaction has been reverted by the EVM') &&
                                error.message.includes('Address already claimed')) {
                                console.error("Address is already claimed.");
                                // Display a custom error message to the user
                                successMessageClaim.textContent = "Address is already claimed.";
                                successMessageClaim.classList.add("text-danger");
                            } else {
                                // If it's not due to the address already being claimed, log the error
                                console.error("Unexpected error:", error);
                                successMessageClaim.textContent = "Address is already claimed.";
                                successMessageClaim.classList.add("text-danger");
                            }
                        }
                    });
                    
                } else {
                    console.log('Please install MetaMask!');
                    metamaskInstallMessage.textContent = 'To interact with this website, you need to install ';

                    // Create and append the anchor element
                    const metamaskLink = document.createElement('a');
                    metamaskLink.href = 'https://metamask.io/download/';
                    metamaskLink.target = '_blank';
                    metamaskLink.rel = 'noopener noreferrer';
                    metamaskLink.textContent = 'MetaMask';
                    metamaskInstallMessage.appendChild(metamaskLink);
                    metamaskInstallMessage.appendChild(document.createTextNode('!'));

                    metamaskInstallMessage.classList.add("text-danger"); // Optionally, add a class for styling
                }
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        });

        // Event listener for the "Request Tokens" form
        requestTokensForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var walletAddress = document.getElementById('walletAddress').value;

            fetch('/submit-wallet-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ walletAddress: walletAddress }),
            })
                .then(response => response.json())
                .then(data => {
                    alert('Request sent successfully.');
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });

        // Initialize Web3 with the provider
        const web3 = new Web3('https://rpc-mumbai.maticvigil.com');

        // Contract address and ABI
        const contractAddress = '0x68Ab1D520f7BE29f6497aAa30799589B98aF506e'; // Replace with your contract address
        const contractABI = [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "IdentityClaimed",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "claimIdentity",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "identityOwners",
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
        ];

        // Create contract instance
        const myContract = new web3.eth.Contract(contractABI, contractAddress);

        // Function to display successful claims
        async function displaySuccessfulClaims() {
            try {
                // Retrieve event logs for 'IdentityClaimed' event
                const logs = await myContract.getPastEvents('IdentityClaimed', {
                    fromBlock: '43459376', // Adjust the number of blocks as needed
                    toBlock: 'latest'
                });

                // Process event logs to extract wallet addresses of successful claims
                const successfulClaims = logs.map(log => log.returnValues.owner);

                // Display the wallet addresses in the HTML
                const walletAddressesElement = document.getElementById('successfulWalletAddresses');
                walletAddressesElement.textContent = successfulClaims.join(', '); // Display addresses separated by commas
            } catch (error) {
                console.error('Error:', error);
            }
        }

        // Event listener for the button to display successful claims
        $('#showSuccessfulClaimsButton').click(displaySuccessfulClaims);
    } else {
        console.log('Some DOM elements are missing. Ensure they exist before attaching event listeners.');
    }

    // Function to create the chart with holder addresses
    function createChart(holderAddresses) {
        // Chart data with holder addresses
        const chartData = {
            labels: holderAddresses,
            datasets: [{
                label: 'Holder Addresses',
                data: Array(holderAddresses.length).fill(1), // Placeholder data
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        // Get the canvas element
        const ctx = document.getElementById('myChartFeature1').getContext('2d');

        // Create a new Chart instance
        const myChartFeature1 = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});

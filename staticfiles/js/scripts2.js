document.addEventListener("DOMContentLoaded", async function () {
    const enableEthereumButton = document.getElementById("connect-wallet");
    const claimButton = document.getElementById("btnClaimIdentity") || document.getElementById("claimBtn");
    const successMessage = document.getElementById("successMessage");
    const stakingStatus = document.getElementById("stakingStatus");
    const claimStatus = document.getElementById("claimStatus");
    const requestTokensForm = document.getElementById('requestTokensForm');
    const metamaskInstallMessage = document.getElementById('metamaskInstallMessage');

    if (typeof window.ethereum === 'undefined') {
        console.log("MetaMask not installed");
        if (metamaskInstallMessage) {
            metamaskInstallMessage.innerHTML = 'Please install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask</a> to use this feature.';
            metamaskInstallMessage.classList.add("text-danger");
        }
        return;
    }

    // ✅ Initialize Web3 only ONCE
    const web3 = new Web3(window.ethereum);

    // ✅ Contract ABI
    const contractABI = [
        {
            "inputs": [
                { "internalType": "address", "name": "_encouragementFund", "type": "address" },
                { "internalType": "address", "name": "_emergencyFund", "type": "address" },
                { "internalType": "address", "name": "_marketingWallet", "type": "address" },
                { "internalType": "address", "name": "_stakingWallet", "type": "address" },
                { "internalType": "address", "name": "_initialUniswapPair", "type": "address" }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "recipient", "type": "address" },
                { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "name": "transfer",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    // ✅ Contract address and staking wallet
    const contractAddress = web3.utils.toChecksumAddress("0x4614435fa9ff920827940d9bf8a9ee279d9144ba");
    const stakingWallet = "0xd3db2B982B829AAF2C84791b6e2DB67E5913AAbF";
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    let userAccount = null;

    async function connectWallet() {
        console.log("Connect Wallet clicked");
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                userAccount = accounts[0];
                const shortened = userAccount.substring(0, 6) + "..." + userAccount.slice(-4);
                enableEthereumButton.textContent = shortened;

                const walletAddressEl = document.getElementById("walletAddress");
                const stakingWalletEl = document.getElementById("stakingWallet");

                if (walletAddressEl) walletAddressEl.innerHTML = `Wallet: <code>${userAccount}</code>`;
                if (stakingWalletEl) stakingWalletEl.textContent = userAccount;

                updateBalance();

                if (successMessage) {
                    successMessage.textContent = "Wallet connected!";
                    successMessage.classList.add("text-success");
                }
            }
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            if (successMessage) {
                successMessage.textContent = "Failed to connect wallet.";
                successMessage.classList.add("text-danger");
            }
        }
    }

    async function updateBalance() {
        try {
            const decimals = await contract.methods.decimals().call();
            const balance = await contract.methods.balanceOf(userAccount).call();
            const formatted = (balance / 10 ** decimals).toFixed(4);
            const availableBalance = document.getElementById("availableBalance");
            if (availableBalance) availableBalance.textContent = formatted;
        } catch (err) {
            console.error("Error getting balance:", err);
        }
    }

    async function claimTokens() {
        if (claimStatus) {
            claimStatus.textContent = "Tokens claimed successfully! ✅";
        }
        updateBalance();
    }

    async function stakeTokens() {
        try {
            const amount = parseFloat(document.getElementById("stakeAmount").value);
            const decimals = await contract.methods.decimals().call();
            const value = web3.utils.toBN(amount * 10 ** decimals);

            await contract.methods.transfer(stakingWallet, value).send({ from: userAccount });

            if (stakingStatus) stakingStatus.textContent = `Staked ${amount} XEAM successfully.`;
            updateBalance();
        } catch (err) {
            console.error("Stake error:", err);
            if (stakingStatus) stakingStatus.textContent = `Error staking tokens.`;
        }
    }

    async function unstakeTokens() {
        if (stakingStatus) stakingStatus.textContent = `Unstaking not implemented in contract.`;
    }

    // Event Listeners
    if (enableEthereumButton) enableEthereumButton.addEventListener("click", connectWallet);
    if (claimButton) claimButton.addEventListener("click", claimTokens);
    const stakeBtn = document.getElementById("stakeBtn");
    const unstakeBtn = document.getElementById("unstakeBtn");

    if (stakeBtn) stakeBtn.addEventListener("click", stakeTokens);
    if (unstakeBtn) unstakeBtn.addEventListener("click", unstakeTokens);

    if (requestTokensForm) {
        requestTokensForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const walletAddressText = document.getElementById('walletAddress')?.textContent || '';
            const cleaned = walletAddressText.replace("Wallet: ", "").replace(/<[^>]+>/g, '').trim();
            fetch('/submit-wallet-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                body: JSON.stringify({ walletAddress: cleaned })
            }).then(res => res.json())
              .then(() => alert('Request sent successfully.'))
              .catch(err => console.error('Error submitting wallet:', err));
        });
    }

    // MetaMask disconnect listener
    if (ethereum && ethereum.on) {
        ethereum.on("disconnect", () => {
            console.warn("Wallet disconnected.");
            if (successMessage) {
                successMessage.textContent = "Wallet disconnected.";
                successMessage.classList.remove("text-success");
                successMessage.classList.add("text-warning");
            }
        });
    }
});

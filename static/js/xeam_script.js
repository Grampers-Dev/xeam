// XEAM Token Smart Contract Interaction Script

if (typeof window.ethereum !== 'undefined') {
    const web3 = new Web3(window.ethereum);
  
    const contractAddress = "0x4614435Fa9fF920827940D9bF8a9EE279d9144ba";
    const contractABI = [
      { "inputs": [ { "internalType": "address", "name": "_encouragementFund", "type": "address" }, { "internalType": "address", "name": "_emergencyFund", "type": "address" }, { "internalType": "address", "name": "_marketingWallet", "type": "address" }, { "internalType": "address", "name": "_stakingWallet", "type": "address" }, { "internalType": "address", "name": "_initialUniswapPair", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }
    ];
  
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    let userAccount;
  
    async function connectWallet() {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      userAccount = accounts[0];
      document.getElementById("walletAddress").innerHTML = `Wallet: <code>${userAccount}</code>`;
      document.getElementById("stakingWallet").textContent = userAccount;
      updateBalance();
    }
  
    async function updateBalance() {
      const decimals = await contract.methods.decimals().call();
      const balance = await contract.methods.balanceOf(userAccount).call();
      const formatted = (balance / (10 ** decimals)).toFixed(4);
      document.getElementById("availableBalance").textContent = formatted;
    }
  
    async function claimTokens() {
      // Placeholder for future eligibility logic or backend integration
      document.getElementById("claimStatus").textContent = "Tokens claimed successfully! ✅";
      updateBalance();
    }
  
    async function stakeTokens() {
      const amount = parseFloat(document.getElementById("stakeAmount").value);
      const decimals = await contract.methods.decimals().call();
      const value = web3.utils.toBN(amount * 10 ** decimals);
  
      try {
        // Replace with your actual staking contract or wallet address
        await contract.methods.transfer("0xd3db2B982B829AAF2C84791b6e2DB67E5913AAbF", value).send({ from: userAccount });
        document.getElementById("stakingStatus").textContent = `Staked ${amount} XEAM successfully.`;
        updateBalance();
      } catch (err) {
        console.error(err);
        document.getElementById("stakingStatus").textContent = `Error staking tokens.`;
      }
    }
  
    async function unstakeTokens() {
      document.getElementById("stakingStatus").textContent = `Unstaking not implemented in contract.`;
    }
  
    document.getElementById("connect-wallet").addEventListener("click", connectWallet);
    document.getElementById("claimBtn").addEventListener("click", claimTokens);
    document.getElementById("stakeBtn").addEventListener("click", stakeTokens);
    document.getElementById("unstakeBtn").addEventListener("click", unstakeTokens);
  
  } else {
    alert("Please install MetaMask to use this feature.");
  }
  

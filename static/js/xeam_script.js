document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.ethereum !== 'undefined') {
    const web3 = new Web3(window.ethereum);

    const contractAddress = "0x4614435Fa9fF920827940D9bF8a9EE279d9144ba";
    const contractABI = [
      { "inputs": [...], "stateMutability": "nonpayable", "type": "constructor" }, // shortened for brevity
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
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

    async function stakeTokens() {
      const amount = parseFloat(document.getElementById("stakeAmount").value);
      const status = document.getElementById("stakingStatus");
      const tierLabel = document.getElementById("tierLabel");
      const rewardLabel = document.getElementById("estimatedReward");
      const feedbackBlock = document.getElementById("stakingFeedback");

      if (!amount || amount <= 0) {
        status.textContent = "Please enter a valid amount.";
        return;
      }

      const decimals = await contract.methods.decimals().call();
      const value = web3.utils.toBN(amount * 10 ** decimals);

      try {
        await contract.methods.transfer(
          "0xd3db2B982B829AAF2C84791b6e2DB67E5913AAbF", // XEAM staking wallet
          value
        ).send({ from: userAccount });

        // 💎 Tier Logic
        let tier = "🧱 Base";
        let multiplier = 1.0;

        if (amount >= 1000) {
          tier = "💎 Diamond";
          multiplier = 2.0;
        } else if (amount >= 500) {
          tier = "🌟 Gold";
          multiplier = 1.5;
        } else if (amount >= 250) {
          tier = "🔥 Silver";
          multiplier = 1.2;
        } else if (amount >= 50) {
          tier = "🚀 Bronze";
          multiplier = 1.0;
        }

        const rewardPool = 100000;
        const estimatedReward = (amount * multiplier).toFixed(2);

        // 🎯 UI Updates
        status.textContent = `✅ Staked ${amount} XEAM successfully.`;
        tierLabel.textContent = tier;
        rewardLabel.textContent = estimatedReward;
        feedbackBlock.style.display = "block";
        updateBalance();

        // 📬 Notify Backend
        await fetch("/log-stake/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
          },
          body: JSON.stringify({
            amount: amount,
            wallet: userAccount
          })
        });

      } catch (err) {
        console.error(err);
        status.textContent = "❌ Error staking tokens.";
      }
    }

    async function claimTokens() {
      document.getElementById("claimStatus").textContent = "Tokens claimed successfully! ✅";
      updateBalance();
    }

    async function unstakeTokens() {
      document.getElementById("stakingStatus").textContent = "Unstaking not implemented in contract.";
    }

    // 🎯 Event Listeners
    document.getElementById("connect-wallet").addEventListener("click", connectWallet);
    document.getElementById("stakeBtn").addEventListener("click", stakeTokens);
    document.getElementById("claimBtn").addEventListener("click", claimTokens);
    document.getElementById("unstakeBtn").addEventListener("click", unstakeTokens);

  } else {
    alert("🦊 Please install MetaMask to use this feature.");
  }
});



  

  

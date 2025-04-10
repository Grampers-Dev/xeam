document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.ethereum !== 'undefined') {
    const web3 = new Web3(window.ethereum);

    const tokenAddress = "0x4614435Fa9fF920827940D9bF8a9Ee279d9144ba";
    const stakingAddress = "0xd6360d2E77Dfe9C20F5f1886a0e036A7D917D3b7"; // Your XEAMStaking contract

    const tokenABI = [
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
    ];

    const stakingABI = [
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ];

    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);

    let userAccount;

    async function connectWallet() {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      userAccount = accounts[0];
      document.getElementById("walletAddress").innerHTML = `Wallet: <code>${userAccount}</code>`;
      document.getElementById("stakingWallet").textContent = userAccount;
      updateBalance();
    }

    async function updateBalance() {
      const decimals = await tokenContract.methods.decimals().call();
      const balance = await tokenContract.methods.balanceOf(userAccount).call();
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

      const decimals = await tokenContract.methods.decimals().call();
      const value = web3.utils.toBN(amount * 10 ** decimals);

      try {
        status.textContent = "⏳ Approving tokens...";
        await tokenContract.methods.approve(stakingAddress, value).send({ from: userAccount });

        status.textContent = "⏳ Staking tokens...";
        await stakingContract.methods.stake(value).send({ from: userAccount });

        // Tier Logic
        let tier = "🧱 Base";
        let multiplier = 1.0;
        if (amount >= 1000) { tier = "💎 Diamond"; multiplier = 2.0; }
        else if (amount >= 500) { tier = "🌟 Gold"; multiplier = 1.5; }
        else if (amount >= 250) { tier = "🔥 Silver"; multiplier = 1.2; }
        else if (amount >= 50) { tier = "🚀 Bronze"; }

        const estimatedReward = (amount * multiplier).toFixed(2);

        status.textContent = `✅ Staked ${amount} XEAM successfully.`;
        tierLabel.textContent = tier;
        rewardLabel.textContent = estimatedReward;
        feedbackBlock.style.display = "block";
        updateBalance();

        // Log stake to backend
        await fetch("/log-stake/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
          },
          body: JSON.stringify({ amount, wallet: userAccount })
        });

      } catch (err) {
        console.error(err);
        status.textContent = "❌ Error staking tokens.";
      }
    }

    async function unstakeTokens() {
      const status = document.getElementById("stakingStatus");
      const amount = parseFloat(prompt("Enter amount to unstake:"));
      if (!amount || amount <= 0) {
        status.textContent = "Please enter a valid amount.";
        return;
      }

      try {
        const decimals = await tokenContract.methods.decimals().call();
        const value = web3.utils.toBN(amount * 10 ** decimals);
        status.textContent = "⏳ Unstaking...";
        await stakingContract.methods.unstake(value).send({ from: userAccount });

        status.textContent = `✅ Unstaked ${amount} XEAM successfully.`;
        updateBalance();
      } catch (err) {
        console.error(err);
        status.textContent = "❌ Error unstaking tokens.";
      }
    }

    async function claimTokens() {
      document.getElementById("claimStatus").textContent = "Tokens claimed successfully! ✅";
      updateBalance();
    }

    document.getElementById("connect-wallet").addEventListener("click", connectWallet);
    document.getElementById("stakeBtn").addEventListener("click", stakeTokens);
    document.getElementById("claimBtn").addEventListener("click", claimTokens);
    document.getElementById("unstakeBtn").addEventListener("click", unstakeTokens);

  } else {
    alert("🦊 Please install MetaMask to use this feature.");
  }
});




  

  

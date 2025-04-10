document.addEventListener("DOMContentLoaded", async function () {
    const enableEthereumButton = document.getElementById("connect-wallet");
    const claimButton = document.getElementById("btnClaimIdentity") || document.getElementById("claimBtn");
    const successMessage = document.getElementById("successMessage");
    const stakingStatus = document.getElementById("stakingStatus");
    const claimStatus = document.getElementById("claimStatus");
    const requestTokensForm = document.getElementById("requestTokensForm");
    const metamaskInstallMessage = document.getElementById("metamaskInstallMessage");
  
    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask not installed");
      if (metamaskInstallMessage) {
        metamaskInstallMessage.innerHTML =
          'Please install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask</a> to use this feature.';
        metamaskInstallMessage.classList.add("text-danger");
      }
      return;
    }
  
    const web3 = new Web3(window.ethereum);
  
    const tokenABI = [
      {
        inputs: [
          { internalType: "address", name: "_encouragementFund", type: "address" },
          { internalType: "address", name: "_emergencyFund", type: "address" },
          { internalType: "address", name: "_marketingWallet", type: "address" },
          { internalType: "address", name: "_stakingWallet", type: "address" },
          { internalType: "address", name: "_initialUniswapPair", type: "address" }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function"
      }
    ];
  
    const stakingABI = [
        {
          inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
          name: "unstake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
          name: "stake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [{ internalType: "address", name: "user", type: "address" }],
          name: "stakedBalanceOf",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "stakes",
          outputs: [
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "uint256", name: "timestamp", type: "uint256" }
          ],
          stateMutability: "view",
          type: "function"
        }
      ];
      
  
    const tokenAddress = "0x4614435fa9ff920827940d9bf8a9ee279d9144ba";
    const stakingAddress = "0xd6360d2E77Dfe9C20F5f1886a0e036A7D917D3b7";
  
    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    window.tokenContract = tokenContract;
    const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);
    window.stakingContract = stakingContract;

  
    let userAccount = null;
  
    async function connectWallet() {
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        userAccount = accounts[0];
        enableEthereumButton.textContent = userAccount.substring(0, 6) + "..." + userAccount.slice(-4);
  
        document.getElementById("walletAddress").innerHTML = `Wallet: <code>${userAccount}</code>`;
        document.getElementById("stakingWallet").textContent = userAccount;
  
        updateBalance();
  
        if (successMessage) {
          successMessage.textContent = "Wallet connected!";
          successMessage.classList.add("text-success");
        }
      } catch (error) {
        console.error("MetaMask connect error:", error);
      }
    }
  
    async function updateBalance() {
      try {
        const decimals = await tokenContract.methods.decimals().call();
        const balance = await tokenContract.methods.balanceOf(userAccount).call();
        const formatted = (balance / 10 ** decimals).toFixed(4);
        document.getElementById("availableBalance").textContent = formatted;
      } catch (err) {
        console.error("Balance fetch error:", err);
      }
    }
  
    async function stakeTokens() {
        try {
          const amount = parseFloat(document.getElementById("stakeAmount").value);
          const decimals = await tokenContract.methods.decimals().call();
          const value = web3.utils.toBN((amount * 10 ** decimals).toString());
      
          // 1. Approve staking contract to spend user's tokens
          await tokenContract.methods
            .approve(stakingAddress, value)
            .send({ from: userAccount });
      
          // 2. Stake through the staking contract (IMPORTANT)
          await stakingContract.methods
            .stake(value)
            .send({ from: userAccount });
      
          stakingStatus.textContent = `✅ Staked ${amount} XEAM successfully.`;
          updateBalance();
        } catch (err) {
          console.error("❌ Staking error:", err);
          stakingStatus.textContent = `❌ Error staking tokens: ${err.message}`;
        }
      }
      
      
  
      async function unstakeTokens() {
        try {
          // Fallback in case userAccount is null
          if (!userAccount) {
            const accounts = await ethereum.request({ method: "eth_accounts" });
            userAccount = accounts[0] || null;
          }
      
          if (!userAccount) {
            stakingStatus.textContent = "⚠️ Please connect your wallet first.";
            return;
          }
      
          const amount = parseFloat(document.getElementById("stakeAmount").value);
          if (!amount || amount <= 0) {
            stakingStatus.textContent = "❌ Please enter a valid amount to unstake.";
            return;
          }
      
          const decimals = await tokenContract.methods.decimals().call();
          const unstakeAmount = web3.utils.toBN((amount * 10 ** decimals).toString());
      
          const currentStaked = await stakingContract.methods
            .stakedBalanceOf(userAccount)
            .call();
      
          if (unstakeAmount.gt(web3.utils.toBN(currentStaked))) {
            stakingStatus.textContent = `❌ You only have ${(currentStaked / 10 ** decimals).toFixed(4)} XEAM staked.`;
            return;
          }
      
          await stakingContract.methods.unstake(unstakeAmount).send({ from: userAccount });
      
          stakingStatus.textContent = `✅ Unstaked ${amount} XEAM successfully.`;
          updateBalance();
        } catch (err) {
          console.error("❌ Unstake error:", err);
          stakingStatus.textContent = `❌ Unstaking failed: ${err?.message || "Unknown error"}`;
        }
      }
      
      
      
  
    if (enableEthereumButton) enableEthereumButton.addEventListener("click", connectWallet);
    if (claimButton) claimButton.addEventListener("click", () => {
      claimStatus.textContent = "Tokens claimed successfully! ✅";
      updateBalance();
    });
    document.getElementById("stakeBtn")?.addEventListener("click", stakeTokens);
    document.getElementById("unstakeBtn")?.addEventListener("click", unstakeTokens);
  });
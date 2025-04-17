document.addEventListener("DOMContentLoaded", async function () {
  const enableEthereumButton = document.getElementById("connect-wallet");
  const claimButton =
    document.getElementById("btnClaimIdentity") ||
    document.getElementById("claimBtn");
  const successMessage = document.getElementById("successMessage");
  const stakingStatus = document.getElementById("stakingStatus");
  const claimStatus = document.getElementById("claimStatus");
  const requestTokensForm = document.getElementById("requestTokensForm");
  const metamaskInstallMessage = document.getElementById(
    "metamaskInstallMessage"
  );

  if (typeof window.ethereum === "undefined") {
    console.log("MetaMask not installed");
    if (metamaskInstallMessage) {
      metamaskInstallMessage.innerHTML =
        'Please install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask</a> to use this feature.';
      metamaskInstallMessage.classList.add("text-danger");
    }
    return;
  }

  let web3 = new Web3(window.ethereum);
  window.web3 = web3;

  const tokenABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_encouragementFund",
          type: "address",
        },
        { internalType: "address", name: "_emergencyFund", type: "address" },
        { internalType: "address", name: "_marketingWallet", type: "address" },
        { internalType: "address", name: "_stakingWallet", type: "address" },
        {
          internalType: "address",
          name: "_initialUniswapPair",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const stakingABI = [
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "calculateReward",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "claimRewards",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "stake",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "unstake",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "stakedBalanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const tokenAddress = "0x81dcEF0C7fEb6BC0F50f6d4F8Cc1635393A6EBEB";
  const stakingAddress = "0xEA15E5C2388ba6bFEC4BF1979ca68140a6Be5C2F";

  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);
  window.tokenContract = tokenContract;
  window.stakingContract = stakingContract;

  let userAccount = null;

  async function retryRequest(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i < retries - 1) {
          console.warn(`Retry ${i + 1} failed:`, err.message);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          throw err;
        }
      }
    }
  }

  async function connectWallet() {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      userAccount = accounts[0];
      enableEthereumButton.textContent = `${userAccount.substring(
        0,
        6
      )}...${userAccount.slice(-4)}`;
      document.getElementById(
        "walletAddress"
      ).innerHTML = `Wallet: <code>${userAccount}</code>`;
      document.getElementById("stakingWallet").textContent = userAccount;
      updateBalance();
      updateClaimable();
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
      const decimals = await retryRequest(() =>
        tokenContract.methods.decimals().call()
      );
      const balance = await retryRequest(() =>
        tokenContract.methods.balanceOf(userAccount).call()
      );
      const formatted = (balance / 10 ** decimals).toFixed(4);
      document.getElementById("availableBalance").textContent = formatted;
    } catch (err) {
      console.error("Balance fetch error:", err);
      document.getElementById("availableBalance").textContent = "Error";
    }
  }

  async function stakeTokens() {
    try {
      const amount = parseFloat(document.getElementById("stakeAmount").value);
      if (!amount || amount <= 0) {
        stakingStatus.textContent = "❌ Enter a valid staking amount.";
        return;
      }

      const decimals = await tokenContract.methods.decimals().call();
      const value = web3.utils.toBN((amount * 10 ** decimals).toString());

      // 1. Approve
      await tokenContract.methods
        .approve(stakingAddress, value)
        .send({ from: userAccount })
        .on("transactionHash", (hash) => console.log("Approval TX:", hash))
        .on("receipt", (receipt) => console.log("Approval complete:", receipt))
        .on("error", (err) => {
          console.error("❌ Approval error:", err);
          stakingStatus.textContent = `❌ Approval failed: ${err.message}`;
          throw err;
        });

      // 2. Stake
      await stakingContract.methods
        .stake(value)
        .send({ from: userAccount })
        .on("transactionHash", (hash) => console.log("Staking TX:", hash))
        .on("receipt", (receipt) => {
          console.log("✅ Staking successful:", receipt);
          stakingStatus.textContent = `✅ Staked ${amount} XEAM successfully.`;
          updateBalance();
        })
        .on("error", (err) => {
          console.error("❌ Staking error:", err);
          stakingStatus.textContent = `❌ Staking failed: ${err.message}`;
        });
    } catch (err) {
      console.error("Unexpected staking error:", err);
      stakingStatus.textContent = `❌ Unexpected error: ${err.message}`;
    }
  }

  async function unstakeTokens() {
    try {
      const amount = parseFloat(document.getElementById("stakeAmount").value);
      if (!amount || amount <= 0) {
        stakingStatus.textContent = "❌ Enter a valid unstaking amount.";
        return;
      }
  
      const decimals = await tokenContract.methods.decimals().call();
      const unstakeAmount = web3.utils.toBN((amount * 10 ** decimals).toString());
  
      const currentStaked = await stakingContract.methods
        .stakedBalanceOf(userAccount)
        .call();
  
      if (unstakeAmount.gt(web3.utils.toBN(currentStaked))) {
        stakingStatus.textContent = `❌ You only have ${(
          currentStaked / 10 ** decimals
        ).toFixed(4)} XEAM staked.`;
        return;
      }
  
      await stakingContract.methods
        .unstake(unstakeAmount)
        .send({ from: userAccount })
        .on("transactionHash", (hash) => console.log("Unstaking TX:", hash))
        .on("receipt", (receipt) => {
          console.log("✅ Unstaking complete:", receipt);
          stakingStatus.textContent = `✅ Unstaked ${amount} XEAM successfully.`;
          updateBalance();
          updateClaimable();
        })
        .on("error", (err) => {
          console.error("❌ Unstaking error:", err);
          stakingStatus.textContent = `❌ Unstaking failed: ${err.message}`;
        });
    } catch (err) {
      console.error("Unexpected unstaking error:", err);
      stakingStatus.textContent = `❌ Unexpected error: ${err.message}`;
    }
  }
  

  async function updateClaimable() {
    try {
      const decimals = await retryRequest(() =>
        tokenContract.methods.decimals().call()
      );
      const reward = await retryRequest(() =>
        stakingContract.methods.calculateReward(userAccount).call()
      );
      const formatted = (reward / 10 ** decimals).toFixed(4);
      document.getElementById("claimableAmount").textContent = formatted;
    } catch (err) {
      console.error("Claimable fetch error:", err);
      document.getElementById("claimableAmount").textContent = "Error";
    }
  }

  if (enableEthereumButton)
    enableEthereumButton.addEventListener("click", connectWallet);
  if (claimButton)
    claimButton.addEventListener("click", () => {
      claimStatus.textContent = "Tokens claimed successfully! ✅";
      updateBalance();
      updateClaimable();
    });

  document
    .getElementById("stakeBtn")
    ?.addEventListener("click", () => stakeTokens());
  document
    .getElementById("unstakeBtn")
    ?.addEventListener("click", () => unstakeTokens());
});

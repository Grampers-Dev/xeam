document.addEventListener("DOMContentLoaded", async function () {
  const enableEthereumButton = document.getElementById("connect-wallet");
  const stakeBtn = document.getElementById("stakeBtn");
  const unstakeBtn = document.getElementById("unstakeBtn");
  const claimBtn = document.getElementById("claimBtn");
  const stakingStatus = document.getElementById("stakingStatus");
  const claimStatus = document.getElementById("claimStatus");
  const successMessage = document.getElementById("successMessage");
  const metamaskInstall = document.getElementById("metamaskInstallMessage");

  if (typeof window.ethereum === "undefined") {
    if (metamaskInstall) {
      metamaskInstall.innerHTML =
        'Please install <a href="https://metamask.io/download/" target="_blank">MetaMask</a>';
      metamaskInstall.classList.add("text-danger");
    }
    return;
  }

  const web3 = new Web3(window.ethereum);
  window.web3 = web3;

  // ─────── TOKEN ABI ──────────────────────────────────────────────────────────
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
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "allowance", type: "uint256" },
        { internalType: "uint256", name: "needed", type: "uint256" },
      ],
      name: "ERC20InsufficientAllowance",
      type: "error",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "needed", type: "uint256" },
      ],
      name: "ERC20InsufficientBalance",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "approver", type: "address" }],
      name: "ERC20InvalidApprover",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "receiver", type: "address" }],
      name: "ERC20InvalidReceiver",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "sender", type: "address" }],
      name: "ERC20InvalidSender",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "spender", type: "address" }],
      name: "ERC20InvalidSpender",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "owner", type: "address" }],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "LPFundsWithdrawn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "category",
          type: "string",
        },
      ],
      name: "TaxDistributed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "newBuyTax",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "newSellTax",
          type: "uint256",
        },
      ],
      name: "TaxesUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "newPair",
          type: "address",
        },
      ],
      name: "UniswapPairUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      inputs: [],
      name: "INITIAL_SUPPLY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MAX_TX",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MAX_WALLET",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
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
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
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
      name: "buyTax",
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
      name: "emergencyFund",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "encouragementFund",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "isExcludedFromFees",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "marketingWallet",
      outputs: [{ internalType: "address", name: "", type: "address" }],
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
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "sellTax",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "stakingWallet",
      outputs: [{ internalType: "address", name: "", type: "address" }],
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
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "uniswapPair",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "account", type: "address" },
        { internalType: "bool", name: "excluded", type: "bool" },
      ],
      name: "updateExcludedAccountStatus",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_buyTax", type: "uint256" },
        { internalType: "uint256", name: "_sellTax", type: "uint256" },
      ],
      name: "updateTaxes",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newPair", type: "address" }],
      name: "updateUniswapPair",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "withdrawLPFunds",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  // ─────── STAKING ABI ──────────────────────────────────────────────────────────
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
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "stakes",
      outputs: [
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "uint256", name: "timestamp", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const tokenAddress = "0x81dcEF0C7fEb6BC0F50f6d4F8Cc1635393A6EBEB";
  const stakingAddress = "0xEA15E5C2388ba6bFEC4BF1979ca68140a6Be5C2F";

  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);

  let userAccount = null;

  async function retryRequest(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i + 1 < retries) await new Promise((r) => setTimeout(r, delay));
        else throw err;
      }
    }
  }

  async function connectWallet() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      userAccount = accounts[0];
      enableEthereumButton.textContent =
        userAccount.slice(0, 6) + "…" + userAccount.slice(-4);
      document.getElementById(
        "walletAddress"
      ).innerHTML = `Wallet: <code>${userAccount}</code>`;
      document.getElementById("stakingWallet").textContent = userAccount;
      await updateBalance();
      await updateClaimable();
      await updateStakedInfo();
      if (successMessage) {
        successMessage.textContent = "Wallet connected!";
        successMessage.classList.add("text-success");
      }
    } catch (err) {
      console.error("Connect error:", err);
    }
  }

  async function updateBalance() {
    try {
      const [decimals, raw] = await Promise.all([
        retryRequest(() => tokenContract.methods.decimals().call()),
        retryRequest(() => tokenContract.methods.balanceOf(userAccount).call()),
      ]);
      document.getElementById("availableBalance").textContent = (
        raw /
        10 ** decimals
      ).toFixed(4);
    } catch {
      document.getElementById("availableBalance").textContent = "Error";
    }
  }

  async function updateClaimable() {
    try {
      const [decimals, reward] = await Promise.all([
        retryRequest(() => tokenContract.methods.decimals().call()),
        retryRequest(() =>
          stakingContract.methods.calculateReward(userAccount).call()
        ),
      ]);
      document.getElementById("claimableAmount").textContent = (
        reward /
        10 ** decimals
      ).toFixed(4);
    } catch {
      document.getElementById("claimableAmount").textContent = "Error";
    }
  }

  async function updateStakedInfo() {
    try {
      const [decimals, rawStaked, stakeData] = await Promise.all([
        retryRequest(() => tokenContract.methods.decimals().call()),
        retryRequest(() =>
          stakingContract.methods.stakedBalanceOf(userAccount).call()
        ),
        retryRequest(() => stakingContract.methods.stakes(userAccount).call()),
      ]);
      document.getElementById("stakedAmount").textContent = (
        rawStaked /
        10 ** decimals
      ).toFixed(4);
      const ts = parseInt(stakeData.timestamp, 10);
      if (ts > 0) {
        const diff = Math.floor(Date.now() / 1000) - ts;
        const d = Math.floor(diff / 86400),
          h = Math.floor((diff % 86400) / 3600);
        document.getElementById("stakeAge").textContent =
          (d ? d + "d " : "") + h + "h";
      } else {
        document.getElementById("stakeAge").textContent = "–";
      }
    } catch {
      document.getElementById("stakedAmount").textContent = "Error";
      document.getElementById("stakeAge").textContent = "Error";
    }
  }

  async function stakeTokens() {
    try {
      const amount = parseFloat(document.getElementById("stakeAmount").value);
      if (!amount || amount <= 0)
        return (stakingStatus.textContent = "❌ Invalid amount");
      const decimals = await tokenContract.methods.decimals().call();
      const value = web3.utils.toBN((amount * 10 ** decimals).toString());
      await tokenContract.methods
        .approve(stakingAddress, value)
        .send({ from: userAccount });
      await stakingContract.methods
        .stake(value)
        .send({ from: userAccount })
        .on("receipt", () => {
          stakingStatus.textContent = `✅ Staked ${amount} XEAM`;
          updateBalance();
          updateClaimable();
          updateStakedInfo();
        });
    } catch (err) {
      console.error("Stake error:", err);
      stakingStatus.textContent = `❌ ${err.message}`;
    }
  }

  async function unstakeTokens() {
    try {
      const amount = parseFloat(document.getElementById("stakeAmount").value);
      if (!amount || amount <= 0)
        return (stakingStatus.textContent = "❌ Invalid amount");
      const decimals = await tokenContract.methods.decimals().call();
      const value = web3.utils.toBN((amount * 10 ** decimals).toString());
      const rawStaked = await stakingContract.methods
        .stakedBalanceOf(userAccount)
        .call();
      if (value.gt(web3.utils.toBN(rawStaked)))
        return (stakingStatus.textContent = `❌ You only have ${(
          rawStaked /
          10 ** decimals
        ).toFixed(4)} staked`);
      await stakingContract.methods
        .unstake(value)
        .send({ from: userAccount })
        .on("receipt", () => {
          stakingStatus.textContent = `✅ Unstaked ${amount} XEAM`;
          updateBalance();
          updateClaimable();
          updateStakedInfo();
        });
    } catch (err) {
      console.error("Unstake error:", err);
      stakingStatus.textContent = `❌ ${err.message}`;
    }
  }

  async function claimTokens() {
    try {
      await stakingContract.methods
        .claimRewards()
        .send({ from: userAccount })
        .on("receipt", () => {
          claimStatus.textContent = "✅ Claimed!";
          updateBalance();
          updateClaimable();
          updateStakedInfo();
        });
    } catch (err) {
      console.error("Claim error:", err);
      claimStatus.textContent = `❌ ${err.message}`;
    }
  }

  enableEthereumButton.addEventListener("click", connectWallet);
  stakeBtn.addEventListener("click", stakeTokens);
  unstakeBtn.addEventListener("click", unstakeTokens);
  claimBtn.addEventListener("click", claimTokens);
});

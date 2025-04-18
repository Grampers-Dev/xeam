document.addEventListener("DOMContentLoaded", async function () {
  // ─────── ELEMENTS ────────────────────────────────────────────────────────────
  const enableEthereumButton = document.getElementById("connect-wallet");
  const stakeBtn = document.getElementById("stakeBtn");
  const unstakeBtn = document.getElementById("unstakeBtn");
  const claimBtn = document.getElementById("claimBtn");
  const stakingStatus = document.getElementById("stakingStatus");
  const claimStatus = document.getElementById("claimStatus");
  const successMessage = document.getElementById("successMessage");
  const metamaskInstall = document.getElementById("metamaskInstallMessage");
  const walletAddressLabel = document.getElementById("walletAddress");
  const availableBalanceLbl = document.getElementById("availableBalance");
  const claimableAmountLbl = document.getElementById("claimableAmount");
  const nextRewardInLbl = document.getElementById("nextRewardIn");
  const stakedAmountLbl = document.getElementById("stakedAmount");
  const stakeAgeLbl = document.getElementById("stakeAge");
  const rewardProgressBar = document.getElementById("rewardProgress");

  // ─────── CONSTANTS ─────────────────────────────────────────────────────────────
  const INTERVAL = 24 * 3600; // 24 h in seconds
  const BASE_DAILY_REWARD = 5; // XEAM/day at ×1.0 (Bronze)

  if (typeof window.ethereum === "undefined") {
    metamaskInstall.innerHTML =
      'Please install <a href="https://metamask.io/download/" target="_blank">MetaMask</a>';
    metamaskInstall.classList.add("text-danger");
    return;
  }

  // ─────── WEB3 + CONTRACTS ────────────────────────────────────────────────────
  const web3 = new Web3(window.ethereum);
  window.web3 = web3;

  // ─ Token ABI (full ERC‑20 + extras) ───────────────────────────────────────────
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

  // ─ Staking ABI (v3: with initialRate, rewardRate, totalStaked, etc.) ───────────
  const stakingABI = [
    {
      inputs: [
        { internalType: "address", name: "_xeamToken", type: "address" },
        { internalType: "uint256", name: "_initialRate", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
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
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "reward",
          type: "uint256",
        },
      ],
      name: "RewardPaid",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "oldRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "newRate",
          type: "uint256",
        },
      ],
      name: "RewardRateUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Staked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Unstaked",
      type: "event",
    },
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
      inputs: [],
      name: "lastUpdateTime",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "token", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "rescueTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "rewardPerTokenStored",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "rewardRate",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "rewards",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "newRate", type: "uint256" }],
      name: "setRewardRate",
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
    {
      inputs: [],
      name: "totalStaked",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
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
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "unstake",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "userRewardPerTokenPaid",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "xeamToken",
      outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  // ─── ADDRESSES ───────────────────────────────────────────────────────────────
  const tokenAddress = "0x81dcEF0C7fEb6BC0F50f6d4F8Cc1635393A6EBEB";
  const stakingAddress = "0x985D4E991f1Bfb2474315ea9d7Ec92b0b74F3b7A";

  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);

  // ─────── STATE ────────────────────────────────────────────────────────────────
  let userAccount = null;
  let stakeTimestamp = 0;
  let refreshInterval;

  // ─────── HELPERS ─────────────────────────────────────────────────────────────
  function getMultiplier(stakedAmount) {
    if (stakedAmount >= 1000) return 2.0; // Diamond
    if (stakedAmount >= 500) return 1.5; // Gold
    if (stakedAmount >= 250) return 1.2; // Silver
    if (stakedAmount >= 50) return 1.0; // Bronze
    return 0.0; // Base
  }

  async function updateRewardProgress(rawReward, decimals) {
    const unit = 10 ** decimals;
    const fraction = (Number(rawReward) % unit) / unit;
    rewardProgressBar.style.width = `${(fraction * 100).toFixed(2)}%`;
  }

  async function updateClaimable() {
    if (!userAccount) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const elapsed = nowSec - stakeTimestamp;

    // get staked amount & multiplier
    let rawStaked = "0";
    try {
      rawStaked = await stakingContract.methods
        .stakedBalanceOf(userAccount)
        .call();
    } catch {
      console.warn("stakedBalanceOf failed");
    }

    const dec = Number(
      await tokenContract.methods
        .decimals()
        .call()
        .catch(() => 18)
    );
    const staked = Number(rawStaked) / 10 ** dec;
    const mult = getMultiplier(staked);

    // on‑chain reward if matured
    let onchain = 0;
    try {
      const raw = await stakingContract.methods
        .calculateReward(userAccount)
        .call();
      onchain = Number(raw) / 10 ** dec;
    } catch {
      /* locked */
    }

    // pick display value
    let claimable;
    if (elapsed >= INTERVAL) {
      claimable = onchain;
    } else {
      const frac = Math.min(elapsed / INTERVAL, 1);
      claimable = frac * BASE_DAILY_REWARD * mult;
    }

    // render
    claimableAmountLbl.textContent = claimable.toFixed(4);
    rewardProgressBar.style.width = `${((claimable % 1) * 100).toFixed(2)}%`;

    // disable until actual claim
    claimBtn.disabled = elapsed < INTERVAL;
  }

  async function updateStakedInfo() {
    let rawStaked = "0",
      ts = 0;
    try {
      rawStaked = await stakingContract.methods
        .stakedBalanceOf(userAccount)
        .call();
      const s = await stakingContract.methods.stakes(userAccount).call();
      ts = s.timestamp || s[1] || 0;
      stakeTimestamp = ts;
    } catch {
      console.warn("stakes() failed");
    }

    const dec = Number(
      await tokenContract.methods
        .decimals()
        .call()
        .catch(() => 18)
    );
    const staked = Number(rawStaked) / 10 ** dec;
    stakedAmountLbl.textContent = staked.toFixed(4);

    // age and countdown
    const elapsed = ts > 0 ? Math.floor(Date.now() / 1000) - ts : 0;
    const days = Math.floor(elapsed / 86400);
    const hours = Math.floor((elapsed % 86400) / 3600);
    stakeAgeLbl.textContent =
      ts > 0 ? `${days ? days + "d " : ""}${hours}h` : "0h";

    if (ts > 0) {
      const into = elapsed % INTERVAL;
      const remain = INTERVAL - into;
      const hh = String(Math.floor(remain / 3600)).padStart(2, "0");
      const mm = String(Math.floor((remain % 3600) / 60)).padStart(2, "0");
      const ss = String(remain % 60).padStart(2, "0");
      nextRewardInLbl.textContent = `${hh}:${mm}:${ss}`;
    } else {
      nextRewardInLbl.textContent = "--:--:--";
    }
  }

  async function updateBalance() {
    try {
      const [dec, raw] = await Promise.all([
        tokenContract.methods.decimals().call(),
        tokenContract.methods.balanceOf(userAccount).call(),
      ]);
      availableBalanceLbl.textContent = (Number(raw) / 10 ** dec).toFixed(4);
    } catch {
      availableBalanceLbl.textContent = "Error";
    }
  }

  // ─────── ACTIONS ─────────────────────────────────────────────────────────────
  async function connectWallet() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      userAccount = accounts[0];
      enableEthereumButton.textContent =
        userAccount.slice(0, 6) + "…" + userAccount.slice(-4);
      walletAddressLabel.innerHTML = `Wallet: <code>${userAccount}</code>`;
      document.getElementById("stakingWallet").textContent = userAccount;

      await updateBalance();
      await updateStakedInfo();
      await updateClaimable();

      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = setInterval(() => {
        updateBalance();
        updateStakedInfo();
        updateClaimable();
      }, 1000);

      successMessage.textContent = "Wallet connected!";
      successMessage.classList.add("text-success");
    } catch (e) {
      console.error("Connect error:", e);
    }
  }

  async function stakeTokens() {
    stakingStatus.textContent = "⏳ Staking…";
    try {
      const amt = parseFloat(document.getElementById("stakeAmount").value);
      if (!amt || amt <= 0) throw new Error("Invalid amount");
      const dec = Number(await tokenContract.methods.decimals().call());
      const value = web3.utils.toBN((amt * 10 ** dec).toString());

      await tokenContract.methods
        .approve(stakingAddress, value)
        .send({ from: userAccount });
      await stakingContract.methods.stake(value).send({ from: userAccount });

      stakingStatus.textContent = `✅ Staked ${amt} XEAM`;
      await updateBalance();
      await updateStakedInfo();
      await updateClaimable();
    } catch (e) {
      console.error("Stake error:", e);
      stakingStatus.textContent = `❌ ${e.message}`;
    }
  }

  async function unstakeTokens() {
    stakingStatus.textContent = "⏳ Unstaking…";
    try {
      const amt = parseFloat(document.getElementById("stakeAmount").value);
      if (!amt || amt <= 0) throw new Error("Invalid amount");
      const dec = Number(await tokenContract.methods.decimals().call());
      const value = web3.utils.toBN((amt * 10 ** dec).toString());
      const rawSt = await stakingContract.methods
        .stakedBalanceOf(userAccount)
        .call();

      if (value.gt(web3.utils.toBN(rawSt)))
        throw new Error(
          `Only ${(Number(rawSt) / 10 ** dec).toFixed(4)} XEAM staked`
        );

      await stakingContract.methods.unstake(value).send({ from: userAccount });

      stakingStatus.textContent = `✅ Unstaked ${amt} XEAM`;
      await updateBalance();
      await updateStakedInfo();
      await updateClaimable();
    } catch (e) {
      console.error("Unstake error:", e);
      stakingStatus.textContent = `❌ ${e.message}`;
    }
  }

  async function claimTokens() {
    claimStatus.textContent = "⏳ Checking rewards…";
    await updateClaimable();

    const claimable = parseFloat(claimableAmountLbl.textContent);
    if (claimable <= 0) {
      claimStatus.textContent = "ℹ️ No rewards available to claim.";
      return;
    }

    try {
      claimStatus.textContent = "⏳ Claiming rewards…";
      await stakingContract.methods.claimRewards().send({ from: userAccount });

      claimStatus.textContent = "✅ Tokens claimed successfully!";
      await updateBalance();
      await updateStakedInfo();
      await updateClaimable();
      stakeTimestamp = Math.floor(Date.now() / 1000);
    } catch (e) {
      console.error("Claim failed:", e);
      claimStatus.textContent = `❌ ${e.message}`;
    }
  }

  // ─────── HOOK UP UI ───────────────────────────────────────────────────────────
  enableEthereumButton.addEventListener("click", connectWallet);
  stakeBtn.addEventListener("click", stakeTokens);
  unstakeBtn.addEventListener("click", unstakeTokens);
  claimBtn.addEventListener("click", claimTokens);
});

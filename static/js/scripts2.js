document.addEventListener("DOMContentLoaded", async function () {
  // ─────── ELEMENTS ────────────────────────────────────────────────────────────
  const connectBtn = document.getElementById("connect-wallet");
  const stakeBtn = document.getElementById("stakeBtn");
  const unstakeBtn = document.getElementById("unstakeBtn");
  const claimBtn = document.getElementById("claimBtn");
  const walletAddrLbl = document.getElementById("walletAddress");
  const stakingWalletLbl = document.getElementById("stakingWallet");
  const metaMaskMsg = document.getElementById("metamaskInstallMessage");
  const successMsg = document.getElementById("successMessage");

  const availableLbl = document.getElementById("availableBalance");
  const claimableLbl = document.getElementById("claimableAmount");
  const nextRewardLbl = document.getElementById("nextRewardIn");
  const rewardBar = document.getElementById("rewardProgress");
  const dailyRateLbl = document.getElementById("dailyRate");
  const claimGasLbl = document.getElementById("claimGas");
  const historyTbody = document.getElementById("claimHistory");

  const stakedLbl = document.getElementById("stakedAmount");
  const stakeAgeLbl = document.getElementById("stakeAge");
  const aprLbl = document.getElementById("apr");
  const totalStakedLbl = document.getElementById("totalStaked");
  const userShareLbl = document.getElementById("userShare");
  const tierBar = document.getElementById("tierProgress");
  const nextTierLbl = document.getElementById("nextTierThreshold");
  const estimatedLbl = document.getElementById("estimatedReward");
  const multiplierLbl = document.getElementById("multiplierLabel");
  const feedbackDiv = document.getElementById("stakingFeedback");
  const stakeInput = document.getElementById("stakeAmount");
  const unstakeFeeLbl = document.getElementById("unstakeFee");

  // ─────── CONSTANTS ─────────────────────────────────────────────────────────────
  const INTERVAL = 24 * 3600; // seconds
  const BASE_DAILY_REWARD = 5; // 5 XEAM @ ×1.0 Bronze

  if (typeof window.ethereum === "undefined") {
    metaMaskMsg.innerHTML =
      'Please install <a href="https://metamask.io/download/" target="_blank">MetaMask</a>';
    return;
  }

  // ─────── WEB3 + CONTRACTS ────────────────────────────────────────────────────
  const web3 = new Web3(window.ethereum);
  window.web3 = web3;

  // ─── Token ABI (full ERC‑20 + extras) ───────────────────────────────────────────
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
  // ─── Staking ABI ─────────────────────────────────────────────────────────────
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

  const tokenAddress = "0x81dcEF0C7fEb6BC0F50f6d4F8Cc1635393A6EBEB";
  const stakingAddress = "0x985D4E991f1Bfb2474315ea9d7Ec92b0b74F3b7A";

  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);

  // ─────── STATE ────────────────────────────────────────────────────────────────
  let userAccount = null;
  let stakeTime = 0;
  let refreshHandle, countdownHandle;

  // ─────── HELPERS ─────────────────────────────────────────────────────────────
  function getTierAndMultiplier(amount) {
    if (amount >= 1000) return ["Diamond", 2.0];
    if (amount >= 500) return ["Gold", 1.5];
    if (amount >= 250) return ["Silver", 1.2];
    if (amount >= 50) return ["Bronze", 1.0];
    return ["Base", 0.0];
  }

  function startCountdown(fromTs) {
    clearInterval(countdownHandle);
    const end = Number(fromTs) + INTERVAL;
    countdownHandle = setInterval(() => {
      const now = Math.floor(Date.now() / 1000),
        left = end - now;
      if (left <= 0) return clearInterval(countdownHandle);
      const h = String(Math.floor(left / 3600)).padStart(2, "0"),
        m = String(Math.floor((left % 3600) / 60)).padStart(2, "0"),
        s = String(left % 60).padStart(2, "0");
      nextRewardLbl.textContent = `${h}:${m}:${s}`;
      rewardBar.style.width = `${(((INTERVAL - left) / INTERVAL) * 100).toFixed(
        2
      )}%`;
    }, 1000);
  }

  async function updateGasEstimate() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      claimGasLbl.textContent = (gasPrice / 1e9).toFixed(1) + " Gwei";
    } catch {
      claimGasLbl.textContent = "--";
    }
  }

  async function updateBalance() {
    try {
      const dec = +(await tokenContract.methods.decimals().call());
      const raw = await tokenContract.methods.balanceOf(userAccount).call();
      availableLbl.textContent = (Number(raw) / 10 ** dec).toFixed(4);
    } catch {
      availableLbl.textContent = "Error";
    }
  }

  async function updateClaimable() {
    const now = Math.floor(Date.now() / 1000),
      elapsed = now - stakeTime;
    let onchain = 0;
    try {
      const raw = await stakingContract.methods
        .calculateReward(userAccount)
        .call();
      const dec = +(await tokenContract.methods.decimals().call());
      onchain = Number(raw) / 10 ** dec;
    } catch {}
    const [, mult] = getTierAndMultiplier(+stakedLbl.textContent || 0);
    const claimable =
      elapsed >= INTERVAL
        ? onchain
        : (elapsed / INTERVAL) * BASE_DAILY_REWARD * mult;
    claimableLbl.textContent = claimable.toFixed(4);
    rewardBar.style.width = `${((claimable % 1) * 100).toFixed(2)}%`;
    dailyRateLbl.textContent = (BASE_DAILY_REWARD * mult).toFixed(4);
    claimBtn.disabled = elapsed < INTERVAL;
  }

  async function updateStakedInfo() {
    let raw = "0",
      ts = 0;
    try {
      raw = await stakingContract.methods.stakedBalanceOf(userAccount).call();
      const s = await stakingContract.methods.stakes(userAccount).call();
      ts = s.timestamp || s[1] || 0;
    } catch {}
    stakeTime = ts;
    const dec = +(await tokenContract.methods.decimals().call());
    const staked = Number(raw) / 10 ** dec;
    stakedLbl.textContent = staked.toFixed(4);

    // stake age
    if (ts) {
      const elapsed = Math.floor(Date.now() / 1000) - ts,
        d = Math.floor(elapsed / 86400),
        h = Math.floor((elapsed % 86400) / 3600);
      stakeAgeLbl.textContent = `${d}d ${h}h`;
    } else {
      stakeAgeLbl.textContent = "0h";
    }

    // countdown bar
    try {
      const lastUpd = await stakingContract.methods.lastUpdateTime().call();
      startCountdown(lastUpd);
    } catch {}

    // pool stats
    const totalRaw = await stakingContract.methods.totalStaked().call();
    const total = Number(totalRaw) / 10 ** dec;
    totalStakedLbl.textContent = total.toFixed(4);

    const share = total > 0 ? ((staked / total) * 100).toFixed(2) : "0.00";
    userShareLbl.textContent = share + "%";

    const rawRate = await stakingContract.methods.rewardRate().call();
    const rate = Number(rawRate) / 10 ** dec;
    const apr =
      total > 0 ? (((rate * 86400 * 365) / total) * 100).toFixed(2) : "0.00";
    aprLbl.textContent = apr + "%";

    // tier & estimated reward
    const [tier, mult] = getTierAndMultiplier(staked);
    multiplierLbl.textContent = mult.toFixed(1);
    estimatedLbl.textContent = (BASE_DAILY_REWARD * mult).toFixed(4);
    document.getElementById("tierLabel").textContent = tier;
    feedbackDiv.style.display = staked > 0 ? "block" : "none";

    // next tier threshold
    let nextThreshold = 50;
    if (staked >= 50 && staked < 250) nextThreshold = 250;
    else if (staked >= 250 && staked < 500) nextThreshold = 500;
    else if (staked >= 500 && staked < 1000) nextThreshold = 1000;
    nextTierLbl.textContent = nextThreshold;
    const pct =
      staked >= nextThreshold
        ? 100
        : ((staked / nextThreshold) * 100).toFixed(2);
    tierBar.style.width = `${pct}%`;

    // emergency unstake fee (example 1%)
    unstakeFeeLbl.textContent = "1%";
  }

  async function updateClaimHistory() {
    try {
      const events = await stakingContract.getPastEvents("RewardPaid", {
        filter: { user: userAccount },
        fromBlock: 0,
        toBlock: "latest",
      });
      const last5 = events.slice(-5).reverse();
      historyTbody.innerHTML = "";
      last5.forEach((evt) => {
        const d = new Date(evt.returnValues.timestamp * 1000).toLocaleString();
        const amt = (Number(evt.returnValues.reward) / 10 ** 18).toFixed(4);
        historyTbody.insertAdjacentHTML(
          "beforeend",
          `<tr><td>${d}</td><td>${amt}</td></tr>`
        );
      });
    } catch {
      historyTbody.innerHTML = "<tr><td colspan='2'>Error</td></tr>";
    }
  }

  // ─────── ACTIONS ─────────────────────────────────────────────────────────────
  async function connectWallet() {
    try {
      const accs = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      userAccount = accs[0];
      connectBtn.textContent =
        userAccount.slice(0, 6) + "…" + userAccount.slice(-4);
      walletAddrLbl.innerHTML = `<code>${userAccount}</code>`;
      stakingWalletLbl.textContent = userAccount;
      successMsg.textContent = "Wallet connected!";
      successMsg.classList.add("text-success");

      await Promise.all([
        updateGasEstimate(),
        updateBalance(),
        updateStakedInfo(),
        updateClaimable(),
        updateClaimHistory(),
      ]);

      clearInterval(refreshHandle);
      refreshHandle = setInterval(() => {
        updateBalance();
        updateStakedInfo();
        updateClaimable();
      }, 1000);
    } catch (e) {
      console.error("Connect failed:", e);
    }
  }

  connectBtn.addEventListener("click", connectWallet);

  stakeBtn.addEventListener("click", async () => {
    try {
      const amt = parseFloat(stakeInput.value || 0);
      if (!amt || amt <= 0) throw new Error("Invalid amount");
      const dec = +(await tokenContract.methods.decimals().call());
      const val = web3.utils.toBN((amt * 10 ** dec).toString());
      await tokenContract.methods
        .approve(stakingAddress, val)
        .send({ from: userAccount });
      await stakingContract.methods.stake(val).send({ from: userAccount });
      await Promise.all([
        updateBalance(),
        updateStakedInfo(),
        updateClaimable(),
        updateClaimHistory(),
      ]);
    } catch (e) {
      console.error("Stake failed:", e);
    }
  });

  unstakeBtn.addEventListener("click", async () => {
    try {
      const amt = parseFloat(stakeInput.value || 0);
      const dec = +(await tokenContract.methods.decimals().call());
      const val = web3.utils.toBN((amt * 10 ** dec).toString());
      await stakingContract.methods.unstake(val).send({ from: userAccount });
      await Promise.all([
        updateBalance(),
        updateStakedInfo(),
        updateClaimable(),
        updateClaimHistory(),
      ]);
    } catch (e) {
      console.error("Unstake failed:", e);
    }
  });

  claimBtn.addEventListener("click", async () => {
    try {
      await updateClaimable();
      const claimable = parseFloat(claimableLbl.textContent);
      if (claimable <= 0) {
        document.getElementById("claimStatus").textContent =
          "ℹ️ No rewards available.";
        return;
      }
      await stakingContract.methods.claimRewards().send({ from: userAccount });
      document.getElementById("claimStatus").textContent =
        "✅ Claimed successfully!";
      stakeTime = Math.floor(Date.now() / 1000);
      await Promise.all([
        updateBalance(),
        updateStakedInfo(),
        updateClaimable(),
        updateClaimHistory(),
      ]);
    } catch (e) {
      console.error("Claim failed:", e);
      document.getElementById("claimStatus").textContent = "❌ Claim error.";
    }
  });
});

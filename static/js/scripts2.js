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

  // constants
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

  // ─── TOKEN ABI (full) ─────────────────────────────────────────────────────────
  const tokenABI = [
    // ... full ERC‑20 ABI as you already have above ...
    // (including constructor, errors, events, view & nonpayable methods)
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
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    // (you can leave the rest of the ABI in place)
  ];

  // ─── STAKING ABI (full) ───────────────────────────────────────────────────────
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

  // ─── ADDRESSES ───────────────────────────────────────────────────────────────
  const tokenAddress = "0x81dcEF0C7fEb6BC0F50f6d4F8Cc1635393A6EBEB";
  const stakingAddress = "0xEA15E5C2388ba6bFEC4BF1979ca68140a6Be5C2F";

  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);

  // ─────── STATE ────────────────────────────────────────────────────────────────
  let userAccount = null;
  let stakeTimestamp = 0;
  let refreshInterval = null;

  // ─────── HELPERS ─────────────────────────────────────────────────────────────

  // fraction toward next whole XEAM
  function getMultiplier(stakedAmount) {
    if (stakedAmount >= 1000) return 2.0; // Diamond
    if (stakedAmount >= 500) return 1.5; // Gold
    if (stakedAmount >= 250) return 1.2; // Silver
    if (stakedAmount >= 50) return 1.0; // Bronze
    return 0.0; // Base
  }

  // update the “progress bar” toward the next whole XEAM
  async function updateRewardProgress(rawReward, decimals) {
    const unit = 10 ** decimals;
    const fraction = (Number(rawReward) % unit) / unit;
    rewardProgressBar.style.width = `${(fraction * 100).toFixed(2)}%`;
  }

  // show claimable either estimated (if still locked) or on‑chain (if matured)
  async function updateClaimable() {
    if (!userAccount) return;

    // how long since stake
    const nowSec = Math.floor(Date.now() / 1000);
    const elapsed = nowSec - stakeTimestamp;

    // read staked balance & compute multiplier
    let rawStaked = "0";
    try {
      rawStaked = await stakingContract.methods
        .stakedBalanceOf(userAccount)
        .call();
    } catch {
      console.warn("stakedBalanceOf() failed → 0");
    }
    const dec = Number(
      await tokenContract.methods
        .decimals()
        .call()
        .catch(() => 18)
    );
    const staked = Number(rawStaked) / 10 ** dec;
    const mult = getMultiplier(staked);

    // try on‑chain reward (only works once 24 h passed)
    let onchain = 0;
    try {
      const raw = await stakingContract.methods
        .calculateReward(userAccount)
        .call();
      onchain = Number(raw) / 10 ** dec;
    } catch {
      // still locked → fallback
    }

    // choose display
    let claimable;
    if (elapsed >= INTERVAL) {
      claimable = onchain;
    } else {
      const frac = Math.min(elapsed / INTERVAL, 1);
      claimable = frac * BASE_DAILY_REWARD * mult;
    }

    claimableAmountLbl.textContent = claimable.toFixed(4);
    rewardProgressBar.style.width = `${((claimable % 1) * 100).toFixed(2)}%`;

    // disable claim button until matured
    claimBtn.disabled = elapsed < INTERVAL;
  }

  // update staked info + countdown + record timestamp
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
      console.warn("stakes() failed → 0");
    }

    const dec = Number(
      await tokenContract.methods
        .decimals()
        .call()
        .catch(() => 18)
    );
    const staked = Number(rawStaked) / 10 ** dec;
    stakedAmountLbl.textContent = staked.toFixed(4);

    // stake age
    const elapsed = ts > 0 ? Math.floor(Date.now() / 1000) - Number(ts) : 0;
    const days = Math.floor(elapsed / 86400);
    const hours = Math.floor((elapsed % 86400) / 3600);
    stakeAgeLbl.textContent =
      ts > 0 ? `${days ? days + "d " : ""}${hours}h` : "0h";

    // next reward countdown
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

  // fetch & display wallet balance
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

      // initial render
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

      if (value.gt(web3.utils.toBN(rawSt))) {
        throw new Error(
          `You only have ${(Number(rawSt) / 10 ** dec).toFixed(4)} XEAM staked`
        );
      }

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
      claimStatus.textContent = `❌ Claim failed: ${e.message}`;
    }
  }

  // ─────── HOOK UP UI ───────────────────────────────────────────────────────────
  enableEthereumButton.addEventListener("click", connectWallet);
  stakeBtn.addEventListener("click", stakeTokens);
  unstakeBtn.addEventListener("click", unstakeTokens);
  claimBtn.addEventListener("click", claimTokens);
});

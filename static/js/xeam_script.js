let userAccount;
let tokenContract;
let stakingContract;
let web3;


document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.ethereum === "undefined") {
    alert("🦊 Please install MetaMask");
    return;
  }

  web3 = new Web3(window.ethereum);

  const tokenAddress = "0x4614435Fa9fF920827940D9bF8a9Ee279d9144ba";
  const stakingAddress = "0x1BC7512D0803C73bb27523bcbfE20398d887B399";

  const tokenABI = [
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
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const stakingABI = [
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
  ];

  tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
  stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);

  document.getElementById("connect-wallet").addEventListener("click", connectWallet);
  document.getElementById("stakeBtn").addEventListener("click", stakeTokens);
  document.getElementById("unstakeBtn").addEventListener("click", unstakeTokens);
  document.getElementById("claimBtn").addEventListener("click", claimTokens);
});

async function connectWallet() {
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    userAccount = accounts[0];

    document.getElementById("walletAddress").innerHTML = `Wallet: <code>${userAccount}</code>`;
    document.getElementById("stakingWallet").textContent = userAccount;

    updateBalance();
    updateReward();
    updateClaimable();
  } catch (err) {
    console.error("Wallet connection failed:", err);
  }
}

async function updateClaimable() {
  if (!userAccount || !stakingContract || !tokenContract) return;

  try {
    const raw = await stakingContract.methods.calculateReward(userAccount).call();
    const decimals = await tokenContract.methods.decimals().call();
    const formatted = (raw / 10 ** decimals).toFixed(4);
    document.getElementById("claimableAmount").textContent = formatted;
  } catch (err) {
    console.error("Error fetching claimable amount:", err);
    document.getElementById("claimableAmount").textContent = "Error";
  }
}

async function claimTokens() {
  const status = document.getElementById("claimStatus");
  status.textContent = "⏳ Claiming rewards...";

  try {
    const reward = await stakingContract.methods.calculateReward(userAccount).call();
    if (reward == 0) {
      status.textContent = "ℹ️ No rewards available to claim.";
      return;
    }

    await stakingContract.methods.claimRewards().send({ from: userAccount });

    status.textContent = "✅ Tokens claimed successfully!";
    updateClaimable();
    updateBalance(); // optional
  } catch (error) {
    console.error(error);
    status.textContent = "❌ Claim failed.";
  }
}


async function updateBalance() {
  const decimals = await tokenContract.methods.decimals().call();
  const balance = await tokenContract.methods.balanceOf(userAccount).call();
  const formatted = (balance / 10 ** decimals).toFixed(4);
  document.getElementById("availableBalance").textContent = formatted;
}

async function updateReward() {
  const reward = await stakingContract.methods.calculateReward(userAccount).call();
  const decimals = await tokenContract.methods.decimals().call();
  const formatted = (reward / 10 ** decimals).toFixed(4);
  document.getElementById("estimatedReward").textContent = formatted;
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
    await tokenContract.methods.approve(stakingContract.options.address, value).send({ from: userAccount });

    status.textContent = "⏳ Staking tokens...";
    await stakingContract.methods.stake(value).send({ from: userAccount });

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
    }

    const estimatedReward = (amount * multiplier).toFixed(2);

    status.textContent = `✅ Staked ${amount} XEAM successfully.`;
    tierLabel.textContent = tier;
    rewardLabel.textContent = estimatedReward;
    feedbackBlock.style.display = "block";
    updateBalance();
    updateReward();

    await fetch("/log-stake/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
      },
      body: JSON.stringify({ amount, wallet: userAccount }),
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
    updateReward();
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error unstaking tokens.";
  }
}

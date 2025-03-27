// XEAM Staking Rewards Distribution Script

const Web3 = require('web3');
const fs = require('fs');
const contractABI = require('./XEAM_ABI.json'); // Replace with path to your actual ABI

const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

const contractAddress = '0x4614435Fa9fF920827940D9Bf8A9Ee279D9144bA'; // Replace with your deployed XEAM token address
const stakingWalletAddress = '0xd3db2B982B829AAF2C84791b6e2DB67E5913AAbF';
const stakingWalletPrivateKey = '0xYOUR_PRIVATE_KEY'; // Never commit this in production

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Example staking data — in a real app, get this from your database
const stakers = [
  { address: '0xAbC123...', staked: 1000 },
  { address: '0xDef456...', staked: 500 }
];

const totalRewards = 1000; // Total XEAM to distribute
const totalStaked = stakers.reduce((sum, s) => sum + s.staked, 0);

(async () => {
  for (const staker of stakers) {
    const reward = (staker.staked / totalStaked) * totalRewards;
    const amountInWei = web3.utils.toWei(reward.toString(), 'ether');

    const tx = contract.methods.transfer(staker.address, amountInWei);
    const gas = await tx.estimateGas({ from: stakingWalletAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(stakingWalletAddress);

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: contractAddress,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: 1, // Mainnet; use 11155111 for Sepolia
      },
      stakingWalletPrivateKey
    );

    try {
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`✅ Sent ${reward.toFixed(4)} XEAM to ${staker.address} | TxHash: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${staker.address}:`, err.message);
    }
  }
})();

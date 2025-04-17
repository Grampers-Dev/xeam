// XEAM Staking Rewards Distribution Script (with live balance read)
let userAccount;
let tokenContract;
let stakingContract;
let web3;

const Web3 = require('web3');
const stakingAbi = require('./abis/XEAMStaking_ABI.json');
const tokenAbi = require('./abis/XEAM_ABI.json'); // XEAM token ABI

const web3 = new Web3('7494b0df618d4ff6b3152f12c14ba456');

const tokenAddress = '0x4614435Fa9fF920827940D9Bf8A9Ee279D9144bA';
const stakingContractAddress = '0xd6360d2E77Dfe9C20F5f1886a0e036A7D917D3b7';

const stakingWalletAddress = '0xd3db2B982B829AAF2C84791b6e2DB67E5913AAbF';
const stakingWalletPrivateKey = '0xYOUR_PRIVATE_KEY'; // Secure this!

const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
const stakingContract = new web3.eth.Contract(stakingAbi, stakingContractAddress);

// Example staker addresses — ideally, you'd pull these from your DB or on-chain logs
const stakerAddresses = [
  '0xAbC123...',
  '0xDef456...'
];

const totalRewards = web3.utils.toWei('1000', 'ether'); // 1000 XEAM total rewards

(async () => {
  const stakers = [];

  // Fetch each user's current staked balance
  for (const address of stakerAddresses) {
    const staked = await stakingContract.methods.stakedBalanceOf(address).call();
    if (Number(staked) > 0) {
      stakers.push({ address, staked });
    }
  }

  const totalStaked = stakers.reduce((sum, s) => sum + Number(s.staked), 0);

  for (const staker of stakers) {
    const reward = (staker.staked / totalStaked) * totalRewards;
    const amountInWei = BigInt(reward.toFixed(0)).toString();

    const tx = tokenContract.methods.transfer(staker.address, amountInWei);
    const gas = await tx.estimateGas({ from: stakingWalletAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(stakingWalletAddress, 'pending');

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: tokenAddress,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: 1, // Mainnet
      },
      stakingWalletPrivateKey
    );

    try {
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`✅ Sent ${(web3.utils.fromWei(amountInWei))} XEAM to ${staker.address} | Tx: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(`❌ Error sending to ${staker.address}:`, err.message);
    }
  }
})();


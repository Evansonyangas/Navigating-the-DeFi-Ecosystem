require('dotenv').config();
const { ethers } = require('ethers');
const uniswapAbi = require('./abis/uniswap.json');
const erc20Abi = require('./abis/erc20.json');
const aaveAbi = require('./abis/aave.json');

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const USDC_ADDRESS = 'USDC_CONTRACT_ADDRESS'; // Replace with actual address
const LINK_ADDRESS = 'LINK_CONTRACT_ADDRESS'; // Replace with actual address
const UNISWAP_ROUTER_ADDRESS = 'UNISWAP_ROUTER_ADDRESS'; // Replace with actual address
const AAVE_LENDING_POOL_ADDRESS = 'AAVE_LENDING_POOL_ADDRESS'; // Replace with actual address

const uniswapRouter = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, uniswapAbi, wallet);
const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, wallet);
const linkContract = new ethers.Contract(LINK_ADDRESS, erc20Abi, wallet);
const aaveLendingPool = new ethers.Contract(AAVE_LENDING_POOL_ADDRESS, aaveAbi, wallet);

async function main(swapAmount) {
  const amountIn = ethers.utils.parseUnits(swapAmount.toString(), 6); // USDC has 6 decimals

  // Approve Uniswap Router to spend USDC
  await approveToken(USDC_ADDRESS, uniswapAbi, amountIn, wallet);

  // Swap USDC for LINK
  const swapParams = await prepareSwapParams(linkContract, wallet, amountIn);
  await executeSwap(uniswapRouter, swapParams, wallet);

  // Approve Aave to spend LINK
  const linkBalance = await linkContract.balanceOf(wallet.address);
  await approveToken(LINK_ADDRESS, erc20Abi, linkBalance, wallet);

  // Supply LINK to Aave
  await supplyToAave(aaveLendingPool, LINK_ADDRESS, linkBalance);

  // Display Aave Supply Info
  await displayAaveInfo(aaveLendingPool, wallet.address);
}

async function approveToken(tokenAddress, tokenAbi, amount, wallet) {
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);
  const tx = await tokenContract.approve(UNISWAP_ROUTER_ADDRESS, amount);
  await tx.wait();
  console.log(`Approved ${amount} tokens for ${tokenAddress}`);
}

async function prepareSwapParams(poolContract, signer, amountIn) {
  return {
    tokenIn: USDC_ADDRESS,
    tokenOut: LINK_ADDRESS,
    fee: 3000,
    recipient: signer.address,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
}

async function executeSwap(router, params, wallet) {
  const tx = await router.exactInputSingle(params);
  const receipt = await tx.wait();
  console.log(`Swap executed: ${receipt.transactionHash}`);
}

async function supplyToAave(aavePool, tokenAddress, amount) {
  const tx = await aavePool.deposit(tokenAddress, amount, wallet.address, 0);
  const receipt = await tx.wait();
  console.log(`Supplied ${amount} of ${tokenAddress} to Aave: ${receipt.transactionHash}`);
}

async function displayAaveInfo(aavePool, user) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH, currentLiquidationThreshold } = await aavePool.getUserAccountData(user);
  console.log(`Aave Info for ${user}:
    Total Collateral ETH: ${totalCollateralETH}
    Total Debt ETH: ${totalDebtETH}
    Available Borrows ETH: ${availableBorrowsETH}
    Liquidation Threshold: ${currentLiquidationThreshold}`);
}

main(100); // Example swap amount in USDC

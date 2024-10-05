import { ethers } from "ethers";
import pkg from "@uniswap/v3-sdk";
import { Fetcher } from "@uniswap/sdk";
import { Token } from "@uniswap/sdk-core";
// import pkgCore from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json" assert { type: "json" };

import { computePoolAddress, FeeAmount } from "@uniswap/v3-sdk";
import dotenv from "dotenv/config";
// refactored these since they export commonJS only
// const { TokenAmount } = pkgCore;
// const { Token, Route, Trade, TradeType } = pkg;

const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Uniswap V3 factory address on Polygon

const USDC = new Token(
  137,
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  6,
  "USDC",
  "USD Coin"
);
const DAI = new Token(
  137,
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  18,
  "DAI",
  "Dai Stablecoin"
);
const WETH = new Token(
  137,
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  18,
  "WETH",
  "Wrapped Ether"
);

console.log("🚀  ~ process.env.INFURA_KEY:", process.env.INFURA_KEY);
// Polygon RPC and wallet setup
const provider = new ethers.JsonRpcProvider(
  "https://polygon-mainnet.infura.io/v3/" + process.env.INFURA_KEY
);

// provider
//   .getBlockNumber()
//   .then((blockNumber) => {
//     console.log(blockNumber);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// Pool Address: USDC/WETH 0x0e44cEb592AcFC5D3F09D996302eB4C499ff8c10

// Pool Address: DAI/WETH 0x6baD0f9a89Ca403bb91d253D385CeC1A2b6eca97

// Pool Address: USDC/DAI 0x257d365f7870742C87Bb3a8A53a609979908799A

// Pool Addresses
const usdcWethPoolAddress = "0x0e44cEb592AcFC5D3F09D996302eB4C499ff8c10";
const daiWethPoolAddress = "0x6baD0f9a89Ca403bb91d253D385CeC1A2b6eca97";
const usdcDaiPoolAddress = "0x257d365f7870742C87Bb3a8A53a609979908799A";

// const poolAddress = computePoolAddress({
//   factoryAddress,
//   tokenA: USDC,
//   tokenB: DAI,
//   fee: FeeAmount.MEDIUM, // 0.3%
// });

// console.log("Pool Address:", poolAddress);

// Create pool contract instances
const usdcWethPoolContract = new ethers.Contract(
  usdcWethPoolAddress,
  IUniswapV3PoolABI.abi,
  provider
);
const daiWethPoolContract = new ethers.Contract(
  daiWethPoolAddress,
  IUniswapV3PoolABI.abi,
  provider
);
const usdcDaiPoolContract = new ethers.Contract(
  usdcDaiPoolAddress,
  IUniswapV3PoolABI.abi,
  provider
);

async function fetchSlot0Data(poolContract) {
  try {
    const slot0 = await poolContract.slot0();
    return slot0;
  } catch (error) {
    console.error("Error fetching slot0 data:", error);
  }
}

// Fetch slot0 data for each pool
const usdcWethSlot0 = await fetchSlot0Data(usdcWethPoolContract);
const daiWethSlot0 = await fetchSlot0Data(daiWethPoolContract);
const usdcDaiSlot0 = await fetchSlot0Data(usdcDaiPoolContract);

function getPriceFromSqrtPriceX96(
  sqrtPriceX96,
  decimalsToken0,
  decimalsToken1
) {
  const priceInX96 = ethers.BigNumber.from(sqrtPriceX96).pow(2);
  const numerator = priceInX96.mul(BigNumber.from(10).pow(decimalsToken0));
  const denominator = BigNumber.from(2)
    .pow(192)
    .mul(BigNumber.from(10).pow(decimalsToken1));
  const price = numerator.div(denominator);
  return price.toString();
}

// Assuming USDC is token0 and WETH is token1 in the pool
const usdcWethPrice = getPriceFromSqrtPriceX96(
  usdcWethSlot0.sqrtPriceX96,
  6,
  18
);
console.log("Price of WETH in terms of USDC:", usdcWethPrice);

// Similarly for other pools
const daiWethPrice = getPriceFromSqrtPriceX96(
  daiWethSlot0.sqrtPriceX96,
  18,
  18
);
console.log("Price of WETH in terms of DAI:", daiWethPrice);

const usdcDaiPrice = getPriceFromSqrtPriceX96(usdcDaiSlot0.sqrtPriceX96, 6, 18);
console.log("Price of DAI in terms of USDC:", usdcDaiPrice);

// const poolContract = new ethers.Contract(
//   poolAddress,
//   IUniswapV3PoolABI.abi,
//   provider
// );

// // Fetch liquidity and price data from the pool contract
// const [liquidity, slot0] = await Promise.all([
//   poolContract.liquidity(),
//   poolContract.slot0(),
// ]);

// // slot0 contains sqrtPriceX96, which is used to calculate the token price
// const sqrtPriceX96 = slot0.sqrtPriceX96;

// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Define tokens using Uniswap Token definitions (USDC, DAI, WETH for Polygon)
// const USDC = new Token(
//   137,
//   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
//   6,
//   "USDC",
//   "USD Coin"
// );
// const DAI = new Token(
//   137,
//   "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
//   18,
//   "DAI",
//   "Dai Stablecoin"
// );
// const WETH = new Token(
//   137,
//   "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
//   18,
//   "WETH",
//   "Wrapped Ether"
// );

// Function to fetch prices and check for arbitrage opportunities
const fetchPricesAndArb = async () => {
  try {
    // Fetch pools for the token pairs on Uniswap V3
    const poolUSDC_WETH = await Fetcher.fetchPoolData(USDC, WETH, provider);
    const poolWETH_DAI = await Fetcher.fetchPoolData(WETH, DAI, provider);
    const poolUSDC_DAI = await Fetcher.fetchPoolData(USDC, DAI, provider);

    // Calculate prices
    const routeUSDC_WETH = new Route([poolUSDC_WETH], USDC);
    const priceUSDC_WETH = parseFloat(routeUSDC_WETH.midPrice.toSignificant(6));

    const routeWETH_DAI = new Route([poolWETH_DAI], WETH);
    const priceWETH_DAI = parseFloat(routeWETH_DAI.midPrice.toSignificant(6));

    const routeUSDC_DAI = new Route([poolUSDC_DAI], USDC);
    const priceUSDC_DAI = parseFloat(routeUSDC_DAI.midPrice.toSignificant(6));

    console.log(`Price USDC/WETH: ${priceUSDC_WETH}`);
    console.log(`Price WETH/DAI: ${priceWETH_DAI}`);
    console.log(`Price USDC/DAI: ${priceUSDC_DAI}`);

    // Check for arbitrage opportunities (simplified logic)
    const tradeProduct = priceUSDC_WETH * priceWETH_DAI * (1 / priceUSDC_DAI);
    const feeAdjustedThreshold = 1 + 0.009; // Adjust for fees (0.9%)

    if (tradeProduct > feeAdjustedThreshold) {
      console.log("Arbitrage opportunity detected!");
      executeArbitrageTrade();
    } else {
      console.log("No arbitrage opportunity at the moment.");
    }
  } catch (error) {
    console.error("Error fetching prices or executing trade:", error);
  }
};

// Function to execute arbitrage trade
const executeArbitrageTrade = async () => {
  console.log("Executing arbitrage trade...");
  // Implement the trade execution logic using ethers.js and Uniswap's smart contracts
  // You'd perform the steps:
  // 1. Swap USDC -> WETH
  // 2. Swap WETH -> DAI
  // 3. Swap DAI -> USDC
  // Ensure this is atomic and adjust gas settings as necessary
  console.log("Trade executed successfully!");
};

// Fetch prices every 10 seconds
// setInterval(fetchPricesAndArb, 10000);
// fetchPricesAndArb();

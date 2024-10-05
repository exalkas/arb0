import { ethers } from "ethers";
import pkg from "@uniswap/v3-sdk";
import { Fetcher } from "@uniswap/sdk";
import { Token } from "@uniswap/sdk-core";
import { Percent } from "@uniswap/sdk";
import dotenv from "dotenv";

const { Pool, Route, Trade, TradeType } = pkg;

dotenv.config();
// console.log("🚀  ~ ethers:", ethers);

// Infura or Alchemy URL
const provider = new ethers.InfuraProvider(
  "mainnet",
  process.env.INFURA_PROJECT_ID
);

// Define tokens using Uniswap Token definitions
const USDC = new Token(
  1,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48",
  6,
  "USDC",
  "USD Coin"
);
const DAI = new Token(
  1,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18,
  "DAI",
  "Dai Stablecoin"
);
const WETH = new Token(
  1,
  "0xC02aaA39b223FE8D0A0e5C4F27eaD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether"
);

// Wallet details for executing trades
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const fetchPrices = async () => {
  try {
    // Fetch pools for the token pairs
    const poolUSDC_ETH = await Fetcher.fetchPoolData(USDC, WETH, provider);
    const poolETH_DAI = await Fetcher.fetchPoolData(WETH, DAI, provider);
    const poolUSDC_DAI = await Fetcher.fetchPoolData(USDC, DAI, provider);

    // Calculate mid prices
    const routeETH_USDC = new Route([poolUSDC_ETH], WETH);
    const priceETH_USDC = parseFloat(routeETH_USDC.midPrice.toSignificant(6));

    const routeDAI_ETH = new Route([poolETH_DAI], DAI);
    const priceDAI_ETH = parseFloat(routeDAI_ETH.midPrice.toSignificant(6));

    const routeUSDC_DAI = new Route([poolUSDC_DAI], USDC);
    const priceUSDC_DAI = parseFloat(routeUSDC_DAI.midPrice.toSignificant(6));

    console.log(`Price ETH/USDC: ${priceETH_USDC}`);
    console.log(`Price DAI/ETH: ${priceDAI_ETH}`);
    console.log(`Price USDC/DAI: ${priceUSDC_DAI}`);

    // Check for arbitrage opportunity
    checkArbitrageOpportunity(priceETH_USDC, priceDAI_ETH, priceUSDC_DAI);
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
};

const checkArbitrageOpportunity = (
  priceETH_USDC,
  priceDAI_ETH,
  priceUSDC_DAI
) => {
  const tradeProduct = priceETH_USDC * priceUSDC_DAI * (1 / priceDAI_ETH);
  const feeAdjustedThreshold = 1 + 0.009; // 0.9% total fee for three trades (0.003 * 3)

  if (tradeProduct > feeAdjustedThreshold) {
    console.log("Arbitrage opportunity detected!");
    console.log(`Trade Product: ${tradeProduct}`);
    executeArbitrageTrade(priceETH_USDC, priceDAI_ETH, priceUSDC_DAI);
  } else {
    console.log("No arbitrage opportunity at the moment.");
  }
};

// Function to execute arbitrage trades
const executeArbitrageTrade = async (
  priceETH_USDC,
  priceDAI_ETH,
  priceUSDC_DAI
) => {
  try {
    // Placeholder for trade execution logic
    console.log("Executing trade...");

    // 1. Buy ETH with USDC
    // 2. Buy DAI with ETH
    // 3. Sell DAI back to USDC

    // In a real implementation, you'd interact with Uniswap smart contracts
    // Use `SwapRouter`, create a swap transaction, and send it via ethers.js
    // All trades should be executed atomically, i.e., in one transaction

    // Example pseudo-code (adjust for actual implementation):
    // const tx = await wallet.sendTransaction({
    //   to: uniswapRouterAddress,
    //   data: encodedSwapData,
    //   gasLimit: ethers.utils.hexlify(250000),
    //   gasPrice: ethers.utils.hexlify(currentGasPrice)
    // });
    // await tx.wait();

    console.log("Trade executed successfully!");
  } catch (error) {
    console.error("Error executing arbitrage trade:", error);
  }
};

// Fetch prices every 10 seconds
// setInterval(fetchPrices, 10000);

fetchPrices();

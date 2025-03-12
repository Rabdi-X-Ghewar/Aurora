import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { LidoSDK, LidoSDKCore } from "@lidofinance/lido-ethereum-sdk";
import { createPublicClient, http, parseEther } from "viem";
import { holesky } from "viem/chains";
import { getProvider, getUserAddress } from "./web3Provider.js";

const RPC_URL = "https://holesky.drpc.org";

// Helper function that can be used anywhere
export const getAndValidateAddress = async () => {
  const address = await getUserAddress();
  if (!address) {
    throw new Error("User address not found");
  }
  return address;
};
export const getAndValidateProvider = async () => {
  const provider = await getProvider();
  if (!provider) {
    throw new Error("Web3 provider not found");
  }
  return provider;
};

// Initialize providers and SDK
const initializeLidoSDK = async () => {
  const provider = await getAndValidateProvider();

  const rpcProvider = createPublicClient({
    chain: holesky,
    transport: http(RPC_URL),
  });

  return new LidoSDK({
    chainId: 17000,
    rpcProvider,
    walletProvider: provider,
    rpcUrl: RPC_URL,
  });
};

let lidoSDK = null;

class LidoStakingTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "LidoStakingTool",
      description: `A tool for interacting with Lido Ethereum Staking. Available operations:
        - stakeETH: Stake ETH and receive stETH.
        - getBalances: Fetch ETH, stETH, and wstETH balances.
        - withdrawStETH: Request withdrawal of stETH.
        - wrapETH: Convert ETH to wstETH.
        - unwrapETH: Convert wstETH back to ETH.
          userAddress is already set no need to provide only for staking you can ask referral addres that is optional.`,
      schema: z.object({
        operation: z.enum([
          "stakeETH",
          "getBalances",
          "withdrawStETH",
          "wrapETH",
          "unwrapETH",
        ]),
        params: z.object({
          referralAddress: z.string(), // Required user address
          amount: z.number().optional(),
        }),
      }),
    });

    // Initialize SDK in constructor
    this.initialize();
  }

  async initialize() {
    if (!lidoSDK) {
      lidoSDK = await initializeLidoSDK();
    }
  }

  async _call(args) {
    // Ensure SDK is initialized
    if (!lidoSDK) {
      await this.initialize();
    }

    try {
      const { operation, params } = args;
      const { amount } = params;
      // Using the helper function

      switch (operation) {
        case "stakeETH":
          if (!amount) throw new Error("Amount is required for staking");
          return await this.stakeETH(amount, params.referralAddress);

        case "getBalances":
          return await this.getBalances();

        case "withdrawStETH":
          if (!amount) throw new Error("Amount is required for withdrawal");
          return await this.withdrawStETH(amount);

        case "wrapETH":
          if (!amount) throw new Error("Amount is required for wrapping");
          return await this.wrapETH(amount);

        case "unwrapETH":
          if (!amount) throw new Error("Amount is required for unwrapping");
          return await this.unwrapETH(amount);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error(
        `LidoStakingTool error for operation ${args.operation}:`,
        error
      );
      return { error: true, message: error.message, operation: args.operation };
    }
  }

  async stakeETH(amount, referralAddress) {
    const userAddress = await getAndValidateAddress(); // Using the helper function
    const value = parseEther(amount.toString());
    // Contracts
    const addressStETH = await lidoSDK.stake.contractAddressStETH();
    const contractStETH = await lidoSDK.stake.getContractStETH();
    const stakeTx = await lidoSDK.stake.stakeEth({
      value,
      referralAddress: referralAddress,
    });
    return {
      addressStETH: addressStETH,
      transaction: stakeTx,
      contractStETH: contractStETH,
    };
  }

  async getBalances() {
    try {
      const userAddress = await getAndValidateAddress();
      console.log("Fetching balances for address:", userAddress);

      const ethBalance = await lidoSDK.core.balanceETH(userAddress);
      const stakedBalance = await lidoSDK.shares.balance(userAddress);

      // Check if user has more than 1 ETH staked
      const canVote = Number(stakedBalance) >= 1e18; // 1e18 wei = 1 ETH

      return {
        ethBalance: ethBalance.toString(),
        stakedBalance: stakedBalance.toString(),
        canVote,
        votingPower: canVote ? stakedBalance.toString() : "0",
      };
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw new Error("Failed to fetch balances. Please try again.");
    }
  }

  async withdrawStETH(amount) {
    const amountInWei = parseEther(amount.toString());
    const addressWithdrawalQueue =
      await lidoSDK.withdraw.contract.contractAddressWithdrawalQueue();
    const contractWithdrawalQueue =
      await lidoSDK.withdraw.contract.getContractWithdrawalQueue();
    const requestTx = await lidoSDK.withdraw.requestWithdrawalWithPermit({
      amount: amountInWei,
      token: "stETH",
      userAddress: await getAndValidateAddress(), // Ensure we pass userAddress correctly
    });
    return {
      addressWithdrawalQueue: addressWithdrawalQueue,
      transaction: requestTx,
      contractWithdrawalQueue: contractWithdrawalQueue,
    };
  }

  async wrapETH(amount) {
    const value = parseEther(amount.toString());
    const wrapTx = await lidoSDK.wrap.wrapEth({
      value,
      account: await getAndValidateAddress(),
    });
    return { transaction: wrapTx };
  }

  async unwrapETH(amount) {
    const amountInWei = parseEther(amount.toString());
    const unwrapTx = await lidoSDK.wrap.unwrapEth({
      amount: amountInWei,
      account: await getAndValidateAddress(),
    });
    return { transaction: unwrapTx };
  }
}

const lidoStakingTool = new LidoStakingTool();
export default lidoStakingTool;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWallet = createWallet;
exports.signMessage = signMessage;
exports.sendTransaction = sendTransaction;
exports.fetchWallet = fetchWallet;
const server_auth_1 = require("@privy-io/server-auth");
const viem_1 = require("viem");
const viem_2 = require("@privy-io/server-auth/viem");
const chains_1 = require("viem/chains");
const User_1 = require("../models/User");
const policyService_1 = require("./policyService");
const privy = new server_auth_1.PrivyClient('cm6m2x54x009tkqmmiupwl2eg', '5x9hnFZ7NJhVhZkAidxABCfcewb6VQENdtHEZyPvcqwUcwRsEveVfpBc9svYD2i17ZKLKPKCyEk53HEQtV9s59ZU', {
    walletApi: {
        authorizationPrivateKey: 'wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiNhlIWPT9yr/XRmb3qgssVWSr91E4XX8X62HbPVAMi+hRANCAARx5wcOumvPh0Yweqsum+7NvlQoTC2qL1XoCio+JxBe8nL3fB4KorklityyACRqAdnd7sXoBr414dJbXBB5rBgm'
    }
});
const policy = {
    "version": "1.0",
    "name": "Max 0.01 ETH Transactions on Sepolia",
    "chain_type": "ethereum",
    "method_rules": [
        {
            "method": "eth_sendTransaction",
            "rules": [
                {
                    "name": "Limit transaction value to max 0.01 ETH",
                    "conditions": [
                        {
                            "field_source": "ethereum_transaction",
                            "field": "value",
                            "operator": "lte",
                            "value": "10000000000000000" // 0.01 ETH in wei
                        }
                    ],
                    "action": "ALLOW"
                }
            ]
        }
    ],
    "default_action": "DENY"
};
const policyId = (0, policyService_1.createPolicy)(policy);
async function createWallet(email) {
    try {
        const user = await User_1.User.findOne({ email });
        console.log(email);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.serverWallet?.id) {
            throw new Error('User already has a server wallet');
        }
        const { id, address, chainType } = await privy.walletApi.create({
            chainType: 'ethereum',
            policyIds: [policyId]
        });
        user.serverWallet = {
            id,
            address,
            chainType
        };
        await user.save();
        return { id, address, chainType };
    }
    catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
}
async function signMessage(email, message) {
    try {
        const user = await User_1.User.findOne({ email });
        if (!user || !user.serverWallet) {
            throw new Error('User does not have a server wallet');
        }
        const { id: walletId, address } = user.serverWallet;
        const account = await (0, viem_2.createViemAccount)({
            walletId,
            address: address,
            privy,
        });
        const client = (0, viem_1.createWalletClient)({
            account,
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(),
        });
        const signature = await client.signMessage({
            message,
            account,
        });
        return signature;
    }
    catch (error) {
        console.error('Error signing message:', error);
        throw error;
    }
}
async function sendTransaction(email, to, valueInEth) {
    try {
        const user = await User_1.User.findOne({ email });
        if (!user || !user.serverWallet) {
            throw new Error('User does not have a server wallet');
        }
        const { id: walletId, address } = user.serverWallet;
        const valueInWei = (0, viem_1.parseEther)(valueInEth.toString());
        const valueInHex = `0x${valueInWei.toString(16)}`;
        const data = await privy.walletApi.ethereum.sendTransaction({
            walletId: walletId,
            caip2: 'eip155:11155111',
            transaction: {
                to: to,
                value: valueInHex,
                chainId: 11155111,
            },
        });
        const { hash } = data;
        // const account = await createViemAccount({
        //     walletId,
        //     address: address as `0x${string}`,
        //     privy,
        // }); 
        // console.log(account);
        // const client = createWalletClient({
        //     account,
        //     chain: sepolia,
        //     transport: http(),
        // });
        // console.log(client);
        // const hash = await client.sendTransaction({
        //     to,
        //     value: parseEther(valueInEth.toString()),
        //     account,
        // });
        console.log('Transaction Sent:', hash);
        return hash;
    }
    catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}
async function fetchWallet(email) {
    try {
        const user = await User_1.User.findOne({ email });
        if (!user) {
            throw new Error('No User ');
        }
        let wallet;
        if (!user.serverWallet?.id) {
            console.log("No server wallet");
            wallet = await createWallet(email);
        }
        else {
            console.log("Server wallet exists");
            console.log(user.serverWallet);
            const { id: walletId, address, chainType } = user.serverWallet;
            wallet = { walletId, address, chainType };
        }
        return wallet;
    }
    catch (error) {
        console.error('Error fetching balance:', error.message);
        throw error;
    }
}

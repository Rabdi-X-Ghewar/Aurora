import express, { Request, Response } from 'express';
import { EchelonClient } from "@echelonmarket/echelon-sdk";
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";

const router = express.Router();

const aptos = new Aptos(
    new AptosConfig({
        network: Network.TESTNET,
        fullnode: "https://api.testnet.staging.aptoslabs.com/v1",
    })
);

const ECHELON_CONTRACT_ADDRESS = "0x0daaf1cca3f702b3d94425e4f0a7bfb921142666846a916f5be91edf1f1911d4";
// Initialize Echelon client
const echelonClient = new EchelonClient(aptos, ECHELON_CONTRACT_ADDRESS);


router.get('/api/markets', async (req: Request, res: Response): Promise<any> => {
    try {
        const markets = await echelonClient.getAllMarkets();
        const marketData = await Promise.all(markets.map(async (market) => {
            const coinAddress = await echelonClient.getMarketCoin(market);
            const borrowApr = await echelonClient.getBorrowApr(market);
            const supplyApr = await echelonClient.getSupplyApr(market);
            const price = await echelonClient.getCoinPrice(market);

            return {
                id: market,
                coinAddress,
                borrowApr,
                supplyApr,
                price
            };
        }));

        res.json(marketData);
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({ error: 'Failed to fetch markets' });
    }
});

router.get('/api/account/:address/position', async (req: Request, res: Response): Promise<any> => {
    try {
        const { address } = req.params;
        const { market } = req.query;

        if (!market) {
            return res.status(400).json({ error: 'Market parameter is required' });
        }

        const [supplied, borrowable, withdrawable, liability] = await Promise.all([
            echelonClient.getAccountSupply(address, market as string),
            echelonClient.getAccountBorrowable(address, market as string),
            echelonClient.getAccountWithdrawable(address, market as string),
            echelonClient.getAccountLiability(address, market as string)
        ]);

        res.json({
            supplied,
            borrowable,
            withdrawable,
            liability
        });
    } catch (error) {
        console.error('Error fetching account position:', error);
        res.status(500).json({ error: 'Failed to fetch account position' });
    }
});

router.post('/api/transaction/payload', async (req: Request, res: Response): Promise<any> => {
    try {
        const { type, coinAddress, market, amount } = req.body;

        if (!type || !coinAddress || !market || amount === undefined) {
            return res.status(400).json({
                error: 'Missing required parameters: type, coinAddress, market, and amount are required'
            });
        }

        let payload;

        switch (type) {
            case 'supply':
                payload = echelonClient.createSupplyPayload(coinAddress, market, amount);
                break;
            case 'withdraw':
                // Convert amount to share for withdraw
                const share = await echelonClient.convertAmountToShare(market, amount);
                payload = echelonClient.createWithdrawPayload(coinAddress, market, share);
                break;
            case 'borrow':
                payload = echelonClient.createBorrowPayload(coinAddress, market, amount);
                break;
            case 'repay':
                payload = echelonClient.createRepayPayload(coinAddress, market, amount);
                break;
            default:
                return res.status(400).json({ error: 'Invalid transaction type' });
        }

        res.json({ payload });
    } catch (error) {
        console.error('Error creating transaction payload:', error);
        res.status(500).json({ error: 'Failed to create transaction payload' });
    }
});


router.get('/api/rewards/:account', async (req: Request, res: Response): Promise<any> => {
    try {
        const { account } = req.params;
        const { coinName, market, mode } = req.query;

        if (!coinName || !market || !mode) {
            return res.status(400).json({
                error: 'Missing required parameters: coinName, market, and mode are required'
            });
        }

        const claimableReward = await echelonClient.getAccountClaimableReward(
            account,
            coinName as string,
            market as string,
            mode as "supply" | "borrow"
        );

        res.json({ claimableReward });
    } catch (error) {
        console.error('Error fetching claimable rewards:', error);
        res.status(500).json({ error: 'Failed to fetch claimable rewards' });
    }
});

export default router;
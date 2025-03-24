import express, { Request, Response } from 'express';
import { EchelonClient } from "@echelonmarket/echelon-sdk";
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";

const router = express.Router();

const aptos = new Aptos(
    new AptosConfig({
        network: Network.MAINNET,
        fullnode: "https://api.testnet.staging.aptoslabs.com/v1",
    })
);

const echelonClient = new EchelonClient(aptos, "0x0daaf1cca3f702b3d94425e4f0a7bfb921142666846a916f5be91edf1f1911d4");


router.get('/api/markets', async (req: Request, res: Response): Promise<any> => {
    try {
        const markets = await echelonClient.getAllMarkets();
        console.log("Markets: ", markets);
        const marketData = await Promise.all(markets.map(async (market) => {
            const coinAddress = await echelonClient.getMarketCoin(market);
            const borrowApr = await echelonClient.getBorrowApr(market);
            const supplyApr = await echelonClient.getSupplyApr(market);
            console.log("Supply APR: ", supplyApr);

            let price;
            try { 
                price = await echelonClient.getCoinPrice(market);
                console.log("Price: ", price);
            } catch (priceError) {
                console.error(`Error fetching price for market ${market}:`);
                price = 0; // or some default value
            }
            console.log("Price: ", price);

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

        // Use Promise.allSettled instead of Promise.all to handle partial failures
        const results = await Promise.allSettled([
            echelonClient.getAccountSupply(address, market as string),
            echelonClient.getAccountBorrowable(address, market as string),
            echelonClient.getAccountWithdrawable(address, market as string),
            echelonClient.getAccountLiability(address, market as string)
        ]);
        
        // Process results
        const [suppliedResult, borrowableResult, withdrawableResult, liabilityResult] = results;
        
        const response: any = {};
        
        if (suppliedResult.status === 'fulfilled') response.supplied = suppliedResult.value;
        else response.supplied = 0;
        
        if (borrowableResult.status === 'fulfilled') response.borrowable = borrowableResult.value;
        else response.borrowable = 0;
        
        if (withdrawableResult.status === 'fulfilled') response.withdrawable = withdrawableResult.value;
        else response.withdrawable = 0;
        
        if (liabilityResult.status === 'fulfilled') response.liability = liabilityResult.value;
        else response.liability = 0;
        
        // Add error information if needed
        if (results.some(r => r.status === 'rejected')) {
            response.hasErrors = true;
            response.errorDetails = "Some position data could not be retrieved due to oracle issues";
        }
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching account position:', error);
        res.status(500).json({ error: 'Failed to fetch account position' });
    }
});

router.post('/api/transaction/payload', async (req: Request, res: Response): Promise<any> => {
    try {
        const { type, coinAddress, market, amount } = req.body;
        console.log(type, coinAddress, market, amount);

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
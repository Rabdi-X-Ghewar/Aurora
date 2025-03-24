import { EchelonClient } from "@echelonmarket/echelon-sdk";
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";



async function getMarkets() {

    const aptos = new Aptos(
        new AptosConfig({
            network: Network.TESTNET,
            fullnode: "https://api.testnet.staging.aptoslabs.com/v1",
        })
    );

    const client = new EchelonClient(aptos, "0x0daaf1cca3f702b3d94425e4f0a7bfb921142666846a916f5be91edf1f1911d4");
    const amount = 10; // amount of USDC to supply
    const markets = await client.getAllMarkets();
    return markets;
    const market = markets[0]; // use the first market as an example


    const supply = client.createSupplyPayload(
        '0xb129c938e4d1a0c2ae6be6c4589dfcfaba6f87be41c6ef65a1b2f10fa36366ac::tokens::USDC',
        market[0],
        amount
    );

    return supply;
    const withdraw = client.createWithdrawPayload(
        '0xb129c938e4d1a0c2ae6be6c4589dfcfaba6f87be41c6ef65a1b2f10fa36366ac::tokens::USDC',
        market[0],
        amount
    )




}

getMarkets()
    .then(market => {
        console.log("First market details:", market);
        // Do something with the market data here
    })
    .catch(error => {
        console.error("Error fetching markets:", error);
    });




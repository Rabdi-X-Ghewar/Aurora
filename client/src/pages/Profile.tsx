import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { Wallet2, CreditCard, Coins, Copy, Send, Wallet } from "lucide-react";
import { fetchWallet, sendServerTransaction } from "../apiClient";
import { toast } from "sonner";

import { createWalletClient, custom, Hex, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";






export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const getWalletIcon = (clientType: string) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s"
                alt="MetaMask"
                className="w-8 h-8" />;
        case 'coinbase_wallet':
            return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 512 512" id="coinbase" className="w-8 h-8">
                <g clipPath="url(#clip0_84_15704)">
                    <rect width="512" height="512" fill="#0052FF" rx="60"></rect>
                    <path fill="#0052FF" d="M255.5 40C375.068 40 472 136.932 472 256.5C472 376.068 375.068 473 255.5 473C135.932 473 39 376.068 39 256.5C39 136.932 135.932 40 255.5 40Z"></path>
                    <path fill="#fff" d="M255.593 331.733C213.515 331.733 179.513 297.638 179.513 255.653C179.513 213.668 213.608 179.573 255.593 179.573C293.258 179.573 324.535 206.999 330.547 242.973H407.19C400.71 164.826 335.337 103.398 255.5 103.398C171.436 103.398 103.245 171.589 103.245 255.653C103.245 339.717 171.436 407.907 255.5 407.907C335.337 407.907 400.71 346.48 407.19 268.333H330.453C324.441 304.307 293.258 331.733 255.593 331.733Z"></path>
                </g>
                <defs>
                    <clipPath id="clip0_84_15704">
                        <rect width="512" height="512" fill="#fff"></rect>
                    </clipPath>
                </defs>
            </svg>;
        case 'privy':
            return <Wallet2 className="w-8 h-8 text-purple-600" />;
        default:
            return <CreditCard className="w-8 h-8 text-gray-600" />;
    }
};

const getWalletName = (clientType: string) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return "MetaMask";
        case 'coinbase_wallet':
            return "Coinbase"
        case 'privy':
            return "Privy Embedded";
        case 'phantom':
            return "Phantom";
    }
}

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Profile = () => {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | undefined>(undefined);
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [open, setOpen] = useState(false);



    useEffect(() => {
        const fetchWalletData = async () => {
            if (wallets.length > 0) {
                try {
                    const balances = await Promise.all(
                        wallets.map(async (wallet) => {
                            const balance = await getWalletBalance(wallet.address);
                            return {
                                address: wallet.address,
                                clientType: wallet.walletClientType,
                                balance: balance ? parseFloat(balance) : 0
                            };
                        })
                    );
                    setWalletBalances(balances);
                } catch (error) {
                    console.error("Error fetching wallet balances:", error);
                }
            }
        };

        const fetchServerWalletData = async () => {
            try {
                const wallet = await fetchWallet(user?.email?.address!);
                const serverWalletAddress = wallet.wallet.address; // Replace with actual server wallet address
                const balance = await getWalletBalance(serverWalletAddress);
                setServerWallet({
                    address: serverWalletAddress,
                    balance: balance ? parseFloat(balance) : 0,
                });
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
            }
        };

        fetchServerWalletData();

        fetchWalletData();
    }, [wallets]);

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            toast.success("Address copied to clipboard");
        } catch (error) {
            console.error("Failed to copy address:", error);
            toast.error("Failed to copy address");
        }
    };


    const sendTransaction = async () => {
        if (!selectedWallet) return;

        try {
            if (selectedWallet.address === serverWallet?.address) {
                // Call server wallet transaction
                const hash = await sendServerTransaction(user?.email?.address!, destinationAddress, amount);
                if (hash) {
                    toast.success("Server wallet transaction successful");
                    setOpen(false)
                }
            } else {
                const wallet = wallets.find(wallet => wallet.address === selectedWallet.address);
                if (!wallet) {
                    console.error('Wallet not found');
                    return;
                }

                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    console.error('Ethereum provider is undefined');
                    return;
                }

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: sepolia,
                    transport: custom(provider),
                });

                const [address] = await walletClient.getAddresses();
                const hash = await walletClient.sendTransaction({
                    account: address,
                    to: destinationAddress as `0x${string}`,
                    value: parseEther(amount),
                });

                toast.success("Transaction successful");
                setOpen(false)
                return hash

            }

        } catch (error) {
            console.log("Error sending transaction:", error);
            toast.error("Error sending transaction");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black mb-2 font-montserrat">WALLET DASHBOARD</h1>
                <p className="text-gray-600 font-montserrat">Manage and monitor your connected wallets</p>
            </div>
            
            {/* Server Wallet Card */}
            <div className="mb-8 bg-black rounded-3xl shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-4 font-montserrat">SERVER WALLET</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Wallet2 className="w-8 h-8" />
                        <div>
                            <p className="font-semibold font-montserrat">{truncateAddress(serverWallet?.address || "N/A")}</p>
                            <p className="text-sm font-montserrat">Balance: {serverWallet?.balance.toFixed(4) || "0.0000"} ETH</p>
                        </div>
                    </div>
                    {serverWallet && (
                        <button 
                            onClick={() => handleCopyAddress(serverWallet.address)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Copy className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>
                
                {serverWallet && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => setSelectedWallet(serverWallet)}
                                className="mt-4 bg-white text-black hover:bg-white/90 font-montserrat rounded-full"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send Transaction
                            </Button>
                        </DialogTrigger>
                        
                        {/* Dialog content remains the same */}
                        <DialogContent className="sm:max-w-[425px] rounded-3xl border-black">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Send Transaction</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Send ETH to another wallet address. Please verify all details before confirming.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm font-medium">From</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Wallet className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-mono text-sm">
                                            {truncateAddress(selectedWallet?.address || "")}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="destination" className="text-sm font-medium">
                                        Destination Address
                                    </Label>
                                    <Input
                                        id="destination"
                                        placeholder="0x..."
                                        value={destinationAddress}
                                        onChange={(e) => setDestinationAddress(e.target.value)}
                                        className="font-mono"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="amount" className="text-sm font-medium">
                                        Amount (ETH)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pr-12"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            ETH
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setOpen(false);
                                        setDestinationAddress("");
                                        setAmount("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={sendTransaction}
                                    className="bg-primary hover:bg-primary/90 text-white"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Transaction
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            
            {/* Connected Wallets Grid */}
            <h2 className="text-2xl font-bold mb-4 text-black font-montserrat">CONNECTED WALLETS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walletBalances.length > 0 ? (
                    walletBalances.map((wallet, index) => (
                        <div key={index}
                            className="bg-white rounded-3xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border-2 border-black">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getWalletIcon(wallet.clientType || '')}
                                    <div>
                                        <h3 className="font-semibold text-lg text-black capitalize font-montserrat">
                                            {getWalletName(wallet.clientType || '')} Wallet
                                        </h3>
                                        <p className="text-sm text-gray-500 font-mono">
                                            {truncateAddress(wallet.address)}
                                        </p>
                                        <button 
                                            onClick={() => handleCopyAddress(wallet.address)}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <Copy className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                <Coins className="w-5 h-5 text-black" />
                                <div>
                                    <p className="text-sm text-gray-600 font-montserrat">Balance</p>
                                    <p className="font-semibold text-lg font-montserrat">
                                        {wallet.balance.toFixed(4)} ETH
                                    </p>
                                </div>
                            </div>

                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setSelectedWallet(wallet)}
                                        className="mt-4 w-full bg-black hover:bg-black/90 text-white font-montserrat rounded-full"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Transaction
                                    </Button>
                                </DialogTrigger>
                                
                                {/* Dialog content remains the same */}
                                <DialogContent className="sm:max-w-[425px] rounded-3xl border-black">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">Send Transaction</DialogTitle>
                                        <DialogDescription className="text-muted-foreground">
                                            Send ETH to another wallet address. Please verify all details before confirming.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm font-medium">From</Label>
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Wallet className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-mono text-sm">
                                                    {truncateAddress(selectedWallet?.address || "")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="destination" className="text-sm font-medium">
                                                Destination Address
                                            </Label>
                                            <Input
                                                id="destination"
                                                placeholder="0x..."
                                                value={destinationAddress}
                                                onChange={(e) => setDestinationAddress(e.target.value)}
                                                className="font-mono"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="amount" className="text-sm font-medium">
                                                Amount (ETH)
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="pr-12"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                    ETH
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setOpen(false);
                                                setDestinationAddress("");
                                                setAmount("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={sendTransaction}
                                            className="bg-primary hover:bg-primary/90 text-white"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Transaction
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-dashed border-black">
                        <Wallet2 className="w-12 h-12 text-black mb-3" />
                        <h3 className="text-lg font-medium text-black mb-1 font-montserrat">NO WALLETS CONNECTED</h3>
                        <p className="text-gray-500 font-montserrat">Connect a wallet to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
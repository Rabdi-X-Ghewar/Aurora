import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { fetchWallet, getSavedWallets, saveWallet, sendServerTransaction } from "../apiClient";

type SavedWallet = {
    nickname: string;
    address: string;
};

export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const SavedWalletsPage = () => {
    const { wallets } = useWallets();
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(
        null
    );
    const [openDialog, setOpenDialog] = useState(false);
    const [destinationAddress, setDestinationAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [isAddWalletDialogOpen, setIsAddWalletDialogOpen] = useState(false); // State for Add Wallet Dialog
    const [newWalletNickname, setNewWalletNickname] = useState(""); // State for nickname input
    const [newWalletAddress, setNewWalletAddress] = useState(""); //
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    const { user } = usePrivy();


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

    const fetchSavedWallets = async () => {
        if (user?.email?.address) {
            const fetchedWallets = await getSavedWallets(user.email.address);
            setSavedWallets(fetchedWallets.wallets);
        }
    };
    console.log("Saved Wallets: ", JSON.stringify(savedWallets));
    // Load saved wallets from localStorage

    useEffect(() => {
        fetchSavedWallets();
    }, [user?.email?.address]);

    // Fetch wallet balances
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
                                balance: balance ? parseFloat(balance) : 0,
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

    // Save wallet address with nickname
    const handleSaveWallet = async () => {
        if (!newWalletNickname || !newWalletAddress) {
            toast.error("Nickname and address are required.");
            return;
        }

        try {
            const newWallet: SavedWallet = { nickname: newWalletNickname, address: newWalletAddress };
            if (user?.email?.address) {
                await saveWallet(user.email.address, newWallet.address, newWallet.nickname); // Call API to save wallet
            } else {
                toast.error("User email address is undefined.");
            }
            // setSavedWallets((prev) => [...prev, newWallet]);
            toast.success("Wallet saved successfully!");
            setIsAddWalletDialogOpen(false); // Close the dialog
            setNewWalletNickname(""); // Reset nickname input
            setNewWalletAddress(""); // Reset address input
        } catch (error) {
            console.error("Error saving wallet:", error);
            toast.error("Failed to save wallet.");
        }
    };

    // Send transaction
    const sendTransaction = async () => {
        if (!selectedWallet || !destinationAddress || !amount) return;


        try {
            if (selectedWallet.address === serverWallet?.address) {
                console.log("Server Wallet");
                const hash = await sendServerTransaction(user?.email?.address!, destinationAddress, amount);
                if (hash) {
                    toast.success("Server wallet transaction successful");
                    setOpenDialog(false)
                }
            } else {
                const wallet = wallets.find(
                    (wallet) => wallet.address === selectedWallet.address
                );
                if (!wallet) {
                    console.error("Wallet not found");
                    return;
                }

                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    console.error("Ethereum provider is undefined");
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
                setOpenDialog(false);
                setDestinationAddress("");
                setAmount("");
                return hash;
            }

        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Error sending transaction");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black mb-2 font-montserrat">SAVED WALLETS</h1>
                <p className="text-gray-600 font-montserrat">Manage your saved wallet addresses</p>
            </div>

            {/* Add Wallet Button */}
            <Button 
                onClick={() => setIsAddWalletDialogOpen(true)} 
                className="mb-8 bg-black text-white hover:bg-black/90 font-montserrat rounded-full px-6 py-2"
            >
                Add New Wallet
            </Button>

            <Dialog open={isAddWalletDialogOpen} onOpenChange={setIsAddWalletDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-black">
                    <DialogHeader>
                        <DialogTitle className="font-montserrat text-xl">Add Wallet</DialogTitle>
                        <DialogDescription className="font-montserrat">
                            Enter a nickname and wallet address to save the wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="font-montserrat">Nickname</Label>
                            <Input
                                type="text"
                                value={newWalletNickname}
                                onChange={(e) => setNewWalletNickname(e.target.value)}
                                className="mt-1 rounded-xl border-black"
                            />
                        </div>
                        <div>
                            <Label className="font-montserrat">Wallet Address</Label>
                            <Input
                                type="text"
                                value={newWalletAddress}
                                onChange={(e) => setNewWalletAddress(e.target.value)}
                                className="mt-1 rounded-xl border-black"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsAddWalletDialogOpen(false)}
                            className="rounded-full font-montserrat"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveWallet}
                            className="bg-black text-white hover:bg-black/90 rounded-full font-montserrat"
                        >
                            Save Wallet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Saved Wallets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWallets.length > 0 ? (
                    savedWallets.map((wallet, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-3xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border-2 border-black"
                        >
                            <div className="flex flex-col space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-black font-montserrat">{wallet.nickname}</h3>
                                    <p className="text-gray-500 font-mono mt-1">
                                        {truncateAddress(wallet.address)}
                                    </p>
                                </div>
                                
                                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                setDestinationAddress(wallet.address);
                                            }}
                                            className="w-full bg-black text-white hover:bg-black/90 font-montserrat rounded-full mt-4"
                                        >
                                            Send Transaction
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-black">
                                        <DialogHeader>
                                            <DialogTitle className="font-montserrat text-xl">Send Transaction</DialogTitle>
                                            <DialogDescription className="font-montserrat">
                                                Enter the amount and select a wallet to send ETH.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="font-montserrat">From</Label>
                                                <select
                                                    className="mt-1 block w-full border border-black rounded-xl p-2 font-montserrat"
                                                    onChange={(e) =>
                                                        setSelectedWallet(
                                                            walletBalances.find(
                                                                (wallet) => wallet.address === e.target.value
                                                            ) || serverWallet?.address === e.target.value
                                                                ? serverWallet
                                                                : null
                                                        )
                                                    }
                                                >
                                                    <option value="">Select a wallet</option>
                                                    <option value={serverWallet?.address}>
                                                        Server Wallet - ({serverWallet?.balance.toFixed(4)} ETH)
                                                    </option>
                                                    {walletBalances.map((wallet, index) => (
                                                        <option key={index} value={wallet.address}>
                                                            {getWalletName(wallet.clientType || '')} -
                                                            {truncateAddress(wallet.address)} (
                                                            {wallet.balance.toFixed(4)} ETH)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="font-montserrat">Amount (ETH)</Label>
                                                <Input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="mt-1 rounded-xl border-black"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setOpenDialog(false)}
                                                className="rounded-full font-montserrat"
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                onClick={sendTransaction}
                                                className="bg-black text-white hover:bg-black/90 rounded-full font-montserrat"
                                            >
                                                Send Transaction
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h3 className="text-lg font-medium text-black mb-1 font-montserrat">NO WALLETS SAVED</h3>
                        <p className="text-gray-500 font-montserrat text-center">Add a wallet address to get started</p>
                        <Button 
                            onClick={() => setIsAddWalletDialogOpen(true)} 
                            className="mt-6 bg-black text-white hover:bg-black/90 font-montserrat rounded-full"
                        >
                            Add Your First Wallet
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedWalletsPage;
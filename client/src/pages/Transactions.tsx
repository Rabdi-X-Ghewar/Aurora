import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { ScrollArea } from "../components/ui/scroll-area";
import { WalletIcon, ArrowRightIcon, LampIcon as GasPumpIcon, ClockIcon, HashIcon, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { fetchWallet } from "../apiClient";

// Define Transaction and ApiResponse interfaces
export interface Transaction {
    hash: string;
    nonce: string;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    gasUsed: string;
    fee: string;
    timestamp: string;
}

export interface ApiResponse {
    cursor: string | null;
    page_size: number;
    page: number;
    result: Array<{
        hash: string;
        nonce: string;
        transaction_index: string;
        from_address: string;
        to_address: string;
        value: string;
        gas: string;
        gas_price: string;
        receipt_gas_used: string;
        transaction_fee: string;
        block_timestamp: string;
    }>;
}

const TransactionPage = () => {
    const [selectedWallet, setSelectedWallet] = useState<string>("");
    const [serverWallet, setServerWallet] = useState<string>("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const { toast } = useToast();

    useEffect(() => {
        const fetchServerWalletData = async () => {
            try {
                console.log("Helllio");
                const wallet = await fetchWallet(user?.email?.address!);
                console.log(wallet);
                setServerWallet(wallet.wallet.address);
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
            }
        };

        fetchServerWalletData();
    }, []);
    console.log("My server Walllet: ", serverWallet);
    const fetchTransactions = async () => {
        if (!selectedWallet) {
            toast({
                title: "No wallet selected",
                description: "Please select a wallet to view transactions.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const provider = new ethers.JsonRpcProvider(
                'https://site1.moralis-nodes.com/sepolia/9efa625d2a0d4ec2b8f138ecce8da119'
            );

            const response: ApiResponse = await provider.send("eth_getTransactions", [
                { address: selectedWallet }
            ]);

            const formattedTransactions: Transaction[] = response.result.map((tx) => ({
                hash: tx.hash,
                nonce: tx.nonce,
                from: tx.from_address,
                to: tx.to_address,
                value: ethers.formatEther(tx.value),
                gasPrice: ethers.formatUnits(tx.gas_price, "gwei"),
                gasUsed: tx.receipt_gas_used,
                fee: tx.transaction_fee,
                timestamp: new Date(tx.block_timestamp).toLocaleString(),
            }));

            setTransactions(formattedTransactions);
            toast({
                title: "Transactions fetched",
                description: `Found ${formattedTransactions.length} transactions`,
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast({
                title: "Error",
                description: "Failed to fetch transactions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black mb-2 font-montserrat">TRANSACTIONS</h1>
                <p className="text-gray-600 font-montserrat">View and analyze your wallet transactions on the Sepolia network</p>
            </div>

            <Card className="w-full shadow-lg border-2 border-black rounded-3xl overflow-hidden mb-8">
                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full">
                            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-black font-montserrat">
                                    <SelectValue placeholder="Select a wallet" />
                                </SelectTrigger>
                                <SelectContent className="border-black rounded-xl">
                                    {serverWallet && (
                                        <SelectItem key={serverWallet} value={serverWallet} className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(serverWallet)}</span>
                                                <span className="text-gray-500 text-sm">
                                                    Server Wallet
                                                </span>
                                            </div>
                                        </SelectItem>
                                    )}

                                    {wallets.map((wallet) => (
                                        <SelectItem key={wallet.address} value={wallet.address} className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(wallet.address)}</span>
                                                <span className="text-gray-500 text-sm">
                                                    ({wallet.walletClientType})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={fetchTransactions}
                            disabled={loading || !selectedWallet}
                            className="w-full sm:w-auto bg-black text-white hover:bg-black/90 font-montserrat rounded-full h-12 px-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Fetch Transactions"
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="relative border-2 border-black rounded-3xl overflow-hidden">
                <ScrollArea className="h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-black text-white">
                                <TableHead className="font-montserrat"><div className="flex items-center gap-2"><HashIcon className="h-4 w-4" /> Hash</div></TableHead>
                                <TableHead className="font-montserrat">From</TableHead>
                                <TableHead className="font-montserrat">To</TableHead>
                                <TableHead className="font-montserrat">Value (ETH)</TableHead>
                                <TableHead className="font-montserrat"><div className="flex items-center gap-2"><GasPumpIcon className="h-4 w-4" /> Gas (Gwei)</div></TableHead>
                                <TableHead className="font-montserrat">Fee (ETH)</TableHead>
                                <TableHead className="font-montserrat"><div className="flex items-center gap-2"><ClockIcon className="h-4 w-4" /> Timestamp</div></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array(7).fill(0).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <WalletIcon className="h-12 w-12 text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-black mb-1 font-montserrat">NO TRANSACTIONS FOUND</p>
                                            <p className="text-gray-500 font-montserrat">Select a wallet and fetch transactions to view them here</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx, index) => (
                                    <TableRow key={index} className="hover:bg-gray-50 border-b border-gray-200">
                                        <TableCell className="font-mono text-sm">
                                            <a 
                                                href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-black hover:underline flex items-center"
                                            >
                                                {truncateAddress(tx.hash)}
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                {truncateAddress(tx.from)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                                                {truncateAddress(tx.to)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-montserrat font-medium">{parseFloat(tx.value).toFixed(6)}</TableCell>
                                        <TableCell className="font-montserrat">{parseFloat(tx.gasPrice).toFixed(2)}</TableCell>
                                        <TableCell className="font-montserrat">{parseFloat(tx.fee).toFixed(6)}</TableCell>
                                        <TableCell className="font-montserrat text-sm">{tx.timestamp}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </Card>
        </div>
    );
};

export default TransactionPage;
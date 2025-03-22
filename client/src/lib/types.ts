import { NetworkKey } from "./fetchWalletBalance";

export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
    network?: NetworkKey;
};
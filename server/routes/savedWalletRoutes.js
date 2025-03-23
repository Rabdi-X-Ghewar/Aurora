"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SavedWallet_1 = require("../models/SavedWallet"); // Import SavedWallet model
const express_1 = __importDefault(require("express"));
// Initialize Express app
const router = express_1.default.Router();
// Middleware setup
// API to fetch all saved wallets for a user
router.get('/saved-wallets/:email', async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const savedWallets = await SavedWallet_1.SavedWallet.find({ email });
        res.status(200).json({ wallets: savedWallets });
    }
    catch (error) {
        console.error('Error fetching saved wallets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// API to save a new wallet for a user
router.post('/saved-wallets', async (req, res) => {
    const { email, address, nickname } = req.body;
    if (!email || !address || !nickname) {
        return res.status(400).json({ message: 'Email, Wallet ID, and address are required' });
    }
    try {
        const wallet = await SavedWallet_1.SavedWallet.findOne({ email, address });
        if (wallet)
            return res.status(400).json({ message: 'Wallet already saved' });
        const newSavedWallet = new SavedWallet_1.SavedWallet({ email, address, nickname });
        await newSavedWallet.save();
        res.status(201).json({ message: 'Wallet saved successfully' });
    }
    catch (error) {
        console.error('Error saving wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// API to delete a saved wallet by ID
router.delete('/saved-wallets', async (req, res) => {
    const { email, address } = req.body;
    try {
        const result = await SavedWallet_1.SavedWallet.findOneAndDelete({ email, address });
        if (!result)
            return res.status(404).json({ message: 'Wallet not found' });
        res.status(200).json({ message: 'Wallet deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;

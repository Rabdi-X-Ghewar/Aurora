"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const walletService_1 = require("../services/walletService");
const router = express_1.default.Router();
router.post('/create-wallet', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    try {
        const wallet = await (0, walletService_1.createWallet)(email);
        res.status(200).json({ success: true, serverWallet: wallet });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/sign-message', async (req, res) => {
    const { email, message } = req.body;
    if (!email || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    try {
        const signature = await (0, walletService_1.signMessage)(email, message);
        res.status(200).json({ success: true, signature });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/send-transaction', async (req, res) => {
    const { email, to, valueInEth } = req.body;
    console.log(email, to, valueInEth);
    if (!email || !to || !valueInEth) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    try {
        const hash = await (0, walletService_1.sendTransaction)(email, to, valueInEth);
        res.status(200).json({ success: true, transactionHash: hash });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/fetch-wallet/:email', async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Missing address' });
    }
    try {
        const wallet = await (0, walletService_1.fetchWallet)(email);
        res.status(200).json({ success: true, wallet });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;

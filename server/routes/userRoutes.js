"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
// POST /api/add-user
router.post('/add-user', async (req, res) => {
    try {
        const { linkedAccounts } = req.body;
        const emailAccount = linkedAccounts.find((account) => account.type === 'email');
        if (!emailAccount || !emailAccount.address) {
            return res.status(400).json({ message: 'Email not found in linkedAccounts' });
        }
        const email = emailAccount.address;
        // Extract wallet details from linkedAccounts
        const wallets = linkedAccounts.filter(account => account.type === 'wallet');
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new User_1.User({ email, wallets });
        await newUser.save();
        res.status(201).json({ message: 'User added successfully', user: newUser });
    }
    catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

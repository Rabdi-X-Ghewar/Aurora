"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const serverWalletRoutes_1 = __importDefault(require("./routes/serverWalletRoutes"));
const savedWalletRoutes_1 = __importDefault(require("./routes/savedWalletRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.json({ message: 'Plutus Backend' });
});
app.use('/api', userRoutes_1.default);
app.use('/api', serverWalletRoutes_1.default);
app.use('/api', savedWalletRoutes_1.default);
mongoose_1.default.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

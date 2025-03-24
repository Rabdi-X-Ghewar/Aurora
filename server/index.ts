import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { User, IUser } from './models/User';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes';
import serverWalletRoutes from './routes/serverWalletRoutes'
import savedWalletRoutes from './routes/savedWalletRoutes';
import echleonRoutes from './routes/echleonRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

dotenv.config();

app.use(cors());
app.use(bodyParser.json());





app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Aurora Backend' });
});



app.use('/api', userRoutes);
app.use('/api', serverWalletRoutes);
app.use('/api', savedWalletRoutes);
app.use('', echleonRoutes);

mongoose.connect(process.env.MONGO_URI!).then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
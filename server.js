import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors'; // 1. CORS import kiya

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// 2. CORS Enable (Frontend se request allow karne ke liye)
app.use(cors({
    origin: '*', // Production mein security ke liye frontend domain daal sakte hain
    credentials: true
}));

// MongoDB Atlas Connection Setup
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB connected successfully!'))
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.log('MONGODB_URI environment variable not found.');
}

// 3. Data Schema & Model (Memory Store ke liye)
const UserSchema = new mongoose.Schema({
    senderRole: String,
    senderEmail: String,
    recipientEmail: String,
    recipientName: String,
    recipientRole: String,
    recipientCity: String,
    generatedUid: String,
    generatedPassword: String,
    subject: String,
    previewBody: String,
    status: { type: String, default: 'DELIVERED' },
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 4. API Endpoints

// Test API Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is working!', message: 'Backend connected successfully' });
});

// Root Route
app.get('/', (req, res) => {
    res.send('Backend API is running live!');
});

// Create/Save User API (Frontend yahan data bhejega)
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save(); // MongoDB mein save hoga
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Fetch All Users API (Database ka data load karne ke liye)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ timestamp: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

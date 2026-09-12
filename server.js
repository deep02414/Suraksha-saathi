import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB Atlas Connection Setup
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB connected successfully!'))
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.log('MONGODB_URI environment variable not found.');
}

// 1. React Frontend Build (Disabled because Frontend is deployed separately on Render)
// app.use(express.static(path.join(__dirname, 'dist')));

// 2. Test API Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is working!', message: 'Backend connected successfully' });
});

// Root Route
app.get('/', (req, res) => {
    res.send('Backend API is running live!');
});

// 3. React Frontend Routing SPA Fallback (Disabled)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

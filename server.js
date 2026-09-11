import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. React की Frontend Build (dist folder) को Serve करें
app.use(express.static(path.join(__dirname, 'dist')));

// 2. टेस्ट करने के लिए एक सैंपल API Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is working!', message: 'Backend connected successfully' });
});

// 3. React Frontend Routing (SPA Fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server is running on port ${PORT}');
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
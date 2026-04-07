import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173", // Allow requests from this origin
}));
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!', timestamp: new Date() });
});

app.post('/register', (req, res) => {
  const request = req.body;

  // Here you would typically save the user to a database
  // For now, we'll just simulate the process

  res.json({ status: 'User registered successfully!', request });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
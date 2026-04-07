require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow base64 photos

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'MasterLink API' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tradesmen', require('./routes/tradesmen'));
app.use('/api/jobs', require('./routes/jobs'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MasterLink API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

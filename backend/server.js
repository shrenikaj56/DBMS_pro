const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting'
  });
});

app.use('/api/projects', projectRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_registry')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

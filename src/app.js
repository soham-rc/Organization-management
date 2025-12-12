require('dotenv').config();
const express = require('express');
const { connectMasterDB } = require('./config/database');
const orgRoutes = require('./routes/org.routes');
const adminRoutes = require('./routes/admin.routes');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Organization Management Service API',
    version: '1.0.0',
  });
});

app.use('/org', orgRoutes);
app.use('/admin', adminRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectMasterDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}`);
    });
  } 
  catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();
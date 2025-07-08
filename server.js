const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

const app = express();
dotenv.config();
app.use(cors());  // Enable Cross-Origin Requests
app.use(bodyParser.json());  // Parse JSON bodies

// Use authentication routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const db = require('../../dbserver');
const authRoutes = require('./routes/auth'); // <--- import auth routes

const app = express();
const PORT = process.env.PORT || 3000;

// middleware to parse incoming json requests
app.use(express.json());

// mount your authentication routes
app.use('/api/auth', authRoutes);

// health check route
app.get('/', (req, res) => {
    res.json({ message: "API is running successfully!" });
});

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
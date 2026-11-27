/**
 * File: server.js
 * Purpose: Backend server instructions to make the node server function
 * Dependencies: express, ../../dbserver, cors, ./routes/auth. ./routes/tasks, ./routes/reminders, ./routes/categories, ./routes/events
 */

const express = require('express');
const db = require('./dbserver'); // import sqlite database connection instance
const cors = require('cors');
const authRoutes = require('./routes/auth'); // auth route 
const taskRoutes = require('./routes/tasks'); // task route
const reminderRoutes = require('./routes/reminders'); // reminder route
const categoryRoutes = require('./routes/categories'); // category route
const eventRoutes = require('./routes/events'); // event route

const app = express();
const PORT = process.env.PORT || 3000;

// enable CORS allowing frontend origins to call API
app.use(cors());

// middleware to parse incoming json requests
app.use(express.json());

// mount authentication routes
app.use('/api/auth', authRoutes);

// mount task routes
app.use('/api/tasks', taskRoutes);

// mount reminder routes
app.use('/api/reminders', reminderRoutes);

// mount category routes
app.use('/api/categories', categoryRoutes);

// mount event routes
app.use('/api/events', eventRoutes);

// health check route
app.get('/', (req, res) => {
    res.json({ message: "API is running successfully!" });
});

// starts the server for Railway or local use
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, db };
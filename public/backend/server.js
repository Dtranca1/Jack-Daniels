const express = require('express');
const db = require('../../dbserver');
const authRoutes = require('./routes/auth'); // auth route 
const taskRoutes = require('./routes/tasks'); // task route
const reminderRoutes = require('./routes/reminders'); // reminder route
const categoryRoutes = require('./routes/categories'); // category route
const eventRoutes = require('./routes/events'); // event route

const app = express();
const PORT = process.env.PORT || 3000;

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

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
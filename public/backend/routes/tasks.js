const express = require('express');
const router = express.Router();
const db = require('../../../dbserver');

// get all tasks for specific user
router.get('/:uID', (req, res) => {
    const { uID } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM Task WHERE uID = ?');
        const tasks = stmt.all(uID);
        res.json({ tasks });
    } catch (err) {
        res.status(500).json({ error: "Server error fetching tasks: " + err.message });
    }
});

// create new task
router.post('/create', (req, res) => {
    const { uID, cID, title, desc, recurring, location, deadline } = req.body;

    if (!uID || !title) {
        return res.status(400).json({ error: "User ID and title are required" });
    }

    try {
        const query = `INSERT INTO Task (uID, cID, title, desc, recurring, location, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(
            uID, 
            cID || null, 
            title, 
            desc || null, 
            recurring || false, 
            location || null, 
            deadline || null
        );

        res.status(201).json({ 
            message: "Task created successfully!", 
            tID: result.lastInsertRowid 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error creating task: " + err.message });
    }
});

module.exports = router;
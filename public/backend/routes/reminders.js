const express = require('express');
const router = express.Router();
const db = require('../../../dbserver');

// get all reminders for specific user
router.get('/:uID', (req, res) => {
    const { uID } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM Reminder WHERE uID = ?');
        const reminders = stmt.all(uID);
        res.json({ reminders });
    } catch (err) {
        res.status(500).json({ error: "Server error fetching reminders: " + err.message });
    }
});

// create new reminder
router.post('/create', (req, res) => {
    const { uID, cID, title, desc, dueRem, priority, recurring } = req.body;

    if (!uID || !title) {
        return res.status(400).json({ error: "User ID and title are required" });
    }

    try {
        const query = `INSERT INTO Reminder (uID, cID, title, desc, dueRem, priority, recurring) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(
            uID, 
            cID || null, 
            title, 
            desc || null, 
            dueRem || null, 
            priority || 'medium', 
            recurring || false
        );

        res.status(201).json({ 
            message: "Reminder created successfully!", 
            rID: result.lastInsertRowid 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error creating reminder: " + err.message });
    }
});

module.exports = router;
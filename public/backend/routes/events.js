const express = require('express');
const router = express.Router();
const db = require('../../../dbserver');

// get all events for specific user
router.get('/:uID', (req, res) => {
    const { uID } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM Event WHERE uID = ?');
        const events = stmt.all(uID);
        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: "Server error fetching events: " + err.message });
    }
});

// create new event
router.post('/create', (req, res) => {
    const { uID, cID, title, desc, startT, endT, recurring, location } = req.body;

    if (!uID || !title || !startT || !endT) {
        return res.status(400).json({ error: "User ID, title, start time, and end time are required" });
    }

    try {
        const query = `INSERT INTO Event (uID, cID, title, desc, startT, endT, recurring, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(
            uID, 
            cID || null, 
            title, 
            desc || null, 
            startT, 
            endT, 
            recurring || false, 
            location || null
        );

        res.status(201).json({ 
            message: "Event created successfully!", 
            eID: result.lastInsertRowid 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error creating event: " + err.message });
    }
});

module.exports = router;
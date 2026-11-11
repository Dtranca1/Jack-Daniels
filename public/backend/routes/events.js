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

// update existing event
router.put('/update/:eID', (req, res) => {
    const { eID } = req.params;
    const { cID, title, desc, startT, endT, recurring, location, doneE } = req.body;

    if (!title || !startT || !endT) {
        return res.status(400).json({ error: "Title, start time, and end time are required for updates" });
    }

    try {
        const query = `
            UPDATE Event 
            SET cID = ?, title = ?, desc = ?, startT = ?, endT = ?, recurring = ?, location = ?, doneE = ?, uAT = CURRENT_TIMESTAMP 
            WHERE eID = ?
        `;
        const stmt = db.prepare(query);
        const result = stmt.run(
            cID || null, 
            title, 
            desc || null, 
            startT, 
            endT, 
            recurring !== undefined ? recurring : false, 
            location || null, 
            doneE !== undefined ? doneE : false, 
            eID
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error updating event: " + err.message });
    }
});

// delete existing event by id
router.delete('/delete/:eID', (req, res) => {
    const { eID } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM Event WHERE eID = ?');
        const result = stmt.run(eID);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting event: " + err.message });
    }
});

module.exports = router;
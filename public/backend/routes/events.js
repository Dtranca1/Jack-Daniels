const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

// get all events for specific user [GET]
router.get('/:uID', (req, res) => {
    const { uID } = req.params;

    // try database query to get events
    try {
        const stmt = db.prepare('SELECT * FROM Event WHERE uID = ?');
        const events = stmt.all(uID);
        res.json({ events });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error fetching events: " + err.message });
    }
});

// create new event [POST]
router.post('/create', (req, res) => {
    const { uID, cID, title, desc, startT, endT, recurring, location } = req.body;

    // check if required fields are in request
    if (!uID || !title || !startT || !endT) {
        return res.status(400).json({ error: "User ID, title, start time, and end time are required" });
    }

    // try database insertion for new event
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

        // success message
        res.status(201).json({ 
            message: "Event created successfully!", 
            eID: result.lastInsertRowid 
        });
        // error message
    } catch (err) {
        res.status(500).json({ error: "Server error creating event: " + err.message });
    }
});

// update existing event [PUT]
router.put('/update/:eID', (req, res) => {
    const { eID } = req.params;
    const { cID, title, desc, startT, endT, recurring, location, doneE } = req.body;

    // check if required fields are in request
    if (!title || !startT || !endT) {
        return res.status(400).json({ error: "Title, start time, and end time are required for updates" });
    }

    // try database update of event
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

        // check if any row was modified/found
        if (result.changes === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        // success message
        res.json({ message: "Event updated successfully!" });
        // error message
    } catch (err) {
        res.status(500).json({ error: "Server error updating event: " + err.message });
    }
});

// delete existing event by id [DELETE]
router.delete('/delete/:eID', (req, res) => {
    const { eID } = req.params;

    // try database deletion of event
    try {
        const stmt = db.prepare('DELETE FROM Event WHERE eID = ?');
        const result = stmt.run(eID);

        // check if any row was modified/found
        if (result.changes === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        // success message
        res.json({ message: "Event deleted successfully!" });
        // error message
    } catch (err) {
        res.status(500).json({ error: "Server error deleting event: " + err.message });
    }
});

module.exports = router;
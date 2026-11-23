const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

// get all reminders for specific user [GET]
router.get('/:uID', (req, res) => {
    const { uID } = req.params;

    // try database query to get reminders
    try {
        const stmt = db.prepare('SELECT * FROM Reminder WHERE uID = ?');
        const reminders = stmt.all(uID);
        res.json({ reminders });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error fetching reminders: " + err.message });
    }
});

// create new reminder [POST]
router.post('/create', (req, res) => {
    const { uID, cID, title, desc, dueRem, priority, recurring } = req.body;

    // check if required fields are in request
    if (!uID || !title) {
        return res.status(400).json({ error: "User ID and title are required" });
    }

    // try database insertion for new reminder
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

        // success message
        res.status(201).json({ 
            message: "Reminder created successfully!", 
            rID: result.lastInsertRowid 
        });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error creating reminder: " + err.message });
    }
});

// update existing reminder [PUT]
router.put('/update/:rID', (req, res) => {
    const { rID } = req.params;
    const { cID, title, desc, dueRem, priority, recurring, doneR } = req.body;

    // check if required fields are in request
    if (!title) {
        return res.status(400).json({ error: "Reminder title is required for updates" });
    }

    // try database update of reminder
    try {
        const query = `
            UPDATE Reminder 
            SET cID = ?, title = ?, desc = ?, dueRem = ?, priority = ?, recurring = ?, doneR = ?, uAT = CURRENT_TIMESTAMP 
            WHERE rID = ?
        `;
        const stmt = db.prepare(query);
        const result = stmt.run(
            cID || null, 
            title, 
            desc || null, 
            dueRem || null, 
            priority || 'medium', 
            recurring !== undefined ? recurring : false, 
            doneR !== undefined ? doneR : false, 
            rID
        );

        // check if any row was modified/found
        if (result.changes === 0) {
            return res.status(404).json({ error: "Reminder not found" });
        }

        // success message
        res.json({ message: "Reminder updated successfully!" });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error updating reminder: " + err.message });
    }
});

// delete existing reminder by id [DELETE]
router.delete('/delete/:rID', (req, res) => {
    const { rID } = req.params;

    // try database deletion of reminder
    try {
        const stmt = db.prepare('DELETE FROM Reminder WHERE rID = ?');
        const result = stmt.run(rID);

        // check if any row was modified/found
        if (result.changes === 0) {
            return res.status(404).json({ error: "Reminder not found" });
        }
        
        // success message
        res.json({ message: "Reminder deleted successfully!" });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error deleting reminder: " + err.message });
    }
});

module.exports = router;
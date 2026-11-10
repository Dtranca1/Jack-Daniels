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

// update existing reminder
router.put('/update/:rID', (req, res) => {
    const { rID } = req.params;
    const { cID, title, desc, dueRem, priority, recurring, doneR } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Reminder title is required for updates" });
    }

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

        if (result.changes === 0) {
            return res.status(404).json({ error: "Reminder not found" });
        }

        res.json({ message: "Reminder updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error updating reminder: " + err.message });
    }
});

// delete existing reminder by id
router.delete('/delete/:rID', (req, res) => {
    const { rID } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM Reminder WHERE rID = ?');
        const result = stmt.run(rID);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Reminder not found" });
        }

        res.json({ message: "Reminder deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting reminder: " + err.message });
    }
});

module.exports = router;
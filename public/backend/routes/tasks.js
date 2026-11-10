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

// update existing task
router.put('/update/:tID', (req, res) => {
    const { tID } = req.params;
    const { cID, title, desc, recurring, location, doneT, deadline } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Task title is required for updates" });
    }

    try {
        const query = `
            UPDATE Task 
            SET cID = ?, title = ?, desc = ?, recurring = ?, location = ?, doneT = ?, deadline = ?, uAT = CURRENT_TIMESTAMP 
            WHERE tID = ?
        `;
        const stmt = db.prepare(query);
        const result = stmt.run(
            cID || null, 
            title, 
            desc || null, 
            recurring !== undefined ? recurring : false, 
            location || null, 
            doneT !== undefined ? doneT : false, 
            deadline || null, 
            tID
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error updating task: " + err.message });
    }
});

// delete existing task by id
router.delete('/delete/:tID', (req, res) => {
    const { tID } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM Task WHERE tID = ?');
        const result = stmt.run(tID);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting task: " + err.message });
    }
});

module.exports = router;
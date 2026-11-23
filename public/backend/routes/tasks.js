const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

// get all tasks for specific user [GET]
router.get('/:uID', (req, res) => {
    const { uID } = req.params;

    // try database query to get tasks
    try {
        const stmt = db.prepare('SELECT * FROM Task WHERE uID = ?');
        const tasks = stmt.all(uID);
        res.json({ tasks });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error fetching tasks: " + err.message });
    }
});

// create new task [POST]
router.post('/create', (req, res) => {
    const { uID, cID, title, desc, recurring, location, deadline } = req.body;

    // check if required fields are in request
    if (!uID || !title) {
        return res.status(400).json({ error: "User ID and title are required" });
    }

    // try database insertion for new task
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

        // success message
        res.status(201).json({ 
            message: "Task created successfully!", 
            tID: result.lastInsertRowid 
        });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error creating task: " + err.message });
    }
});

// update existing task [PUT]
router.put('/update/:tID', (req, res) => {
    const { tID } = req.params;
    const { cID, title, desc, recurring, location, doneT, deadline } = req.body;

    // check if required fields are in request
    if (!title) {
        return res.status(400).json({ error: "Task title is required for updates" });
    }

    // try database update of task
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

        // check if any row was modified/found
        if (result.changes === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        // success message
        res.json({ message: "Task updated successfully!" });
    // error message
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
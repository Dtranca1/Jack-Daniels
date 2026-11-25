/**
 * File: tasks.js
 * Purpose: Defines Express REST API routes for creating, retrieving,
 *          updatting, and deleting user tasks in the SQLite database.
 * Dependencies: express, ../../../dbserver
 */

const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

/**
 * @route   GET /api/tasks/:uID
 * @desc    Gets all tasks tied to a user ID
 * @param   {number} uID - User id from URL path
 * @returns {200} JSON object containing array of task records
 * @returns {500} DB query error message
 */
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

/**
 * @route   POST /api/tasks/create
 * @desc    Adds new task into Task table
 * @body    {number} uID - Required user foreign key
 * @body    {number} [cID] Optional category foreign key
 * @body    {string} title - Required task title
 * @body    {string} [desc] - Optional task description
 * @body    {boolean} [recurring=false] - Whether the task repeats
 * @body    {string} [location] - Optional task location
 * @body    {string} [deadline] - Optional due date & time 
 * @returns {201} JSON confirmation message and generated task ID (tID)
 * @returns {400|500} Missing required field or database insertion error 
 */
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

/**
 * @route   PUT /api/tasks/update/:tID
 * @desc    Updates an existing task's fields and refreshes its uAT timestamp
 * @param   {number} tID - Task ID from URL path
 * @body    {string} title - Required updated task title
 * @body    {number} [cID] - Optional category foreign key
 * @body    {string} [desc] - Optional task description
 * @body    {boolean} [recurring=false] - Recurrence flag
 * @body    {string} [location] - Optional task location
 * @body    {boolean} [doneT=false] - Task completion flag
 * @body    {string} [deadline] - Optional due date/time string
 * @returns {200} JSON confirmation message
 * @returns {400|404|500} Validation error, task not found, or database error
 */
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

/**
 * @route   DELETE /api/tasks/delete/:tID
 * @desc    Deletes a specific task record by its task ID
 * @param   {number} tID - Task ID from URL path
 * @returns {200} JSON confirmation message
 * @returns {404|500} Task not found or database deletion error
 */
router.delete('/delete/:tID', (req, res) => {
    const { tID } = req.params;

    // try database deletion of task
    try {
        const stmt = db.prepare('DELETE FROM Task WHERE tID = ?');
        const result = stmt.run(tID);

        // check if task exists
        if (result.changes === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        // success message
        res.json({ message: "Task deleted successfully!" });
    } catch (err) {
        // error message
        res.status(500).json({ error: "Server error deleting task: " + err.message });
    }
});

module.exports = router;
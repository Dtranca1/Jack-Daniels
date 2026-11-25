/**
 * File: reminders.js
 * Purpose: Defines Express REST API routes for creating, retrieving,
 *          updating, and deleting user reminders in the SQLite database
 * Dependencies: express, ../../../dbserver
 */

const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

/**
 * @route   GET /api/reminders/:uID
 * @desc    Retrieves all reminders associated with a specific user ID
 * @param   {number} uID - User ID from URL path
 * @returns {200} JSON object containing an array of reminder records ({ reminders })
 * @returns {500} Database query error message
 */
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

/**
 * @route   POST /api/reminders/create
 * @desc    Inserts a new reminder record into the Reminder table
 * @body    {number} uID - Required user foreign key
 * @body    {number} [cID] - Optional category foreign key
 * @body    {string} title - Required reminder title
 * @body    {string} [desc] - Optional reminder description
 * @body    {string} [dueRem] - Optional due date/time string
 * @body    {string} [priority='medium'] - Optional priority level
 * @body    {boolean} [recurring=false] - Whether the reminder repeats
 * @returns {201} JSON confirmation message and generated reminder ID (rID)
 * @returns {400|500} Missing required field or database insertion error
 */
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

/**
 * @route   PUT /api/reminders/update/:rID
 * @desc    Updates an existing reminder's fields and refreshes its uAT timestamp
 * @param   {number} rID - Reminder ID from URL path
 * @body    {string} title - Required updated reminder title
 * @body    {number} [cID] - Optional category foreign key
 * @body    {string} [desc] - Optional reminder description
 * @body    {string} [dueRem] - Optional due date/time string
 * @body    {string} [priority='medium'] - Optional priority level
 * @body    {boolean} [recurring=false] - Recurrence flag
 * @body    {boolean} [doneR=false] - Reminder completion flag
 * @returns {200} JSON confirmation message
 * @returns {400|404|500} Validation error, reminder not found, or database error
 */
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

/**
 * @route   DELETE /api/reminders/delete/:rID
 * @desc    Deletes a specific reminder record by its reminder ID
 * @param   {number} rID - Reminder ID from URL path
 * @returns {200} JSON confirmation message
 * @returns {404|500} Reminder not found or database deletion error
 */
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
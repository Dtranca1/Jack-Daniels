/**
 * File: events.js
 * Purpose: Defines Express REST API routes for creating, retrieving,
 *          updating, and deleting scheduled calendar events in the SQLite database
 * Dependencies: express, ../../../dbserver
 */

const express = require('express');
const router = express.Router();
const db = require('../dbserver'); // import sqlite database connection instance

/**
 * @route   GET /api/events/:uID
 * @desc    Retrieves all scheduled events associated with a specific user ID
 * @param   {number} uID - User ID from URL path
 * @returns {200} JSON object containing an array of event records ({ events })
 * @returns {500} Database query error message
 */
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

/**
 * @route   POST /api/events/create
 * @desc    Inserts a new event record into the Event table
 * @body    {number} uID - Required user foreign key
 * @body    {number} [cID] - Optional category foreign key
 * @body    {string} title - Required event title
 * @body    {string} [desc] - Optional event description
 * @body    {string} startT - Required start timestamp/string
 * @body    {string} endT - Required end timestamp/string
 * @body    {boolean} [recurring=false] - Whether the event repeats
 * @body    {string} [location] - Optional event location
 * @returns {201} JSON confirmation message and generated event ID (eID)
 * @returns {400|500} Missing required field or database insertion error
 */
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

/**
 * @route   PUT /api/events/update/:eID
 * @desc    Updates an existing event's fields and refreshes its uAT timestamp
 * @param   {number} eID - Event ID from URL path
 * @body    {string} title - Required updated event title
 * @body    {string} startT - Required updated start timestamp/string
 * @body    {string} endT - Required updated end timestamp/string
 * @body    {number} [cID] - Optional category foreign key
 * @body    {string} [desc] - Optional event description
 * @body    {boolean} [recurring=false] - Recurrence flag
 * @body    {string} [location] - Optional event location
 * @body    {boolean} [doneE=false] - Event completion flag
 * @returns {200} JSON confirmation message
 * @returns {400|404|500} Validation error, event not found, or database error
 */
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

/**
 * @route   DELETE /api/events/delete/:eID
 * @desc    Deletes a specific event record by its event ID
 * @param   {number} eID - Event ID from URL path
 * @returns {200} JSON confirmation message
 * @returns {404|500} Event not found or database deletion error
 */
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
/**
 * File: categories.js
 * Purpose: Defines Express REST API routes for creating, retrieving,
 *          updating, and deleting user color categories in the SQLite database
 * Dependencies: express, ../../../dbserver
 */

const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

/**
 * @route   GET /api/categories/:uID
 * @desc    Retrieves all categories associated with a specific user ID
 * @param   {number} uID - User ID from URL path
 * @returns {200} JSON object containing an array of category records ({ categories })
 * @returns {500} Database query error message
 */
router.get('/:uID', (req, res) => {
    const { uID } = req.params;

    // try database query to get categories
    try {
        // fetch categories matching user id
        const stmt = db.prepare('SELECT * FROM Category WHERE uID = ?');
        const categories = stmt.all(uID);
        res.json({ categories });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error fetching categories: " + err.message });
    }
});

/**
 * @route   POST /api/categories/create
 * @desc    Inserts a new category record into the Category table
 * @body    {number} uID - Required user foreign key
 * @body    {string} name - Required category name
 * @body    {string} [colorCat] - Optional hex/color identifier for the category
 * @returns {201} JSON confirmation message and generated category ID (cID)
 * @returns {400|500} Missing required field or database insertion error
 */
router.post('/create', (req, res) => {
    const { uID, name, colorCat } = req.body;

    // check if required fields are in request body
    if (!uID || !name) {
        return res.status(400).json({ error: "User ID and name are required" });
    }

    // try database insertion for new category
    try {
        const query = `INSERT INTO Category (uID, name, colorCat) VALUES (?, ?, ?)`;
        const stmt = db.prepare(query);
        // execute insert query, setting colorCat to null if left blank
        const result = stmt.run(uID, name, colorCat || null);

        // success message
        res.status(201).json({ 
            message: "Category created successfully!", 
            cID: result.lastInsertRowid 
        });
    // error message
    } catch (err) {
        res.status(500).json({ error: "Server error creating category: " + err.message });
    }
});

/**
 * @route   PUT /api/categories/update/:cID
 * @desc    Updates an existing category's name and color identifier
 * @param   {number} cID - Category ID from URL path
 * @body    {string} name - Required updated category name
 * @body    {string} [colorCat] - Optional updated color identifier
 * @returns {200} JSON confirmation message
 * @returns {400|404|500} Validation error, category not found, or database error
 */
router.put('/update/:cID', (req, res) => {
    const { cID } = req.params;
    const { name, colorCat } = req.body;

    // check if category name is provided before update
    if (!name) {
        return res.status(400).json({ error: "Category name is required for updates" });
    }

    // try database update for category
    try {
        const query = `
            UPDATE Category 
            SET name = ?, colorCat = ? 
            WHERE cID = ?
        `;
        const stmt = db.prepare(query);
        const result = stmt.run(name, colorCat || null, cID);

        // check if any row was modified/found
        if (result.changes === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        // success message
        res.json({ message: "Category updated successfully!" });
    } catch (err) {
        // error message
        res.status(500).json({ error: "Server error updating category: " + err.message });
    }
});

/**
 * @route   DELETE /api/categories/delete/:cID
 * @desc    Deletes a specific category record by its category ID
 * @param   {number} cID - Category ID from URL path
 * @returns {200} JSON confirmation message
 * @returns {404|500} Category not found or database deletion error
 */
router.delete('/delete/:cID', (req, res) => {
    const { cID } = req.params;

    // try database deletion of category
    try {
        const stmt = db.prepare('DELETE FROM Category WHERE cID = ?');
        const result = stmt.run(cID);

        // check if category exists to be deleted
        if (result.changes === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        // success message
        res.json({ message: "Category deleted successfully!" });
    } catch (err) {
        // error message
        res.status(500).json({ error: "Server error deleting category: " + err.message });
    }
});

module.exports = router;
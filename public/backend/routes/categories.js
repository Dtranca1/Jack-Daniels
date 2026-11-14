const express = require('express');
const router = express.Router();
const db = require('../../../dbserver'); // import sqlite database connection instance

// get all categories for specific user [GET]
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

// create new category [POST]
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

// update existing category [PUT]
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

// delete existing category by id [DELETE]
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
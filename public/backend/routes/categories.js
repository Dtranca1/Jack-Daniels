const express = require('express');
const router = express.Router();
const db = require('../../../dbserver');

// get all categories for specific user
router.get('/:uID', (req, res) => {
    const { uID } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM Category WHERE uID = ?');
        const categories = stmt.all(uID);
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: "Server error fetching categories: " + err.message });
    }
});

// create new category
router.post('/create', (req, res) => {
    const { uID, name, colorCat } = req.body;

    if (!uID || !name) {
        return res.status(400).json({ error: "User ID and name are required" });
    }

    try {
        const query = `INSERT INTO Category (uID, name, colorCat) VALUES (?, ?, ?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(uID, name, colorCat || null);

        res.status(201).json({ 
            message: "Category created successfully!", 
            cID: result.lastInsertRowid 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error creating category: " + err.message });
    }
});

// update existing category
router.put('/update/:cID', (req, res) => {
    const { cID } = req.params;
    const { name, colorCat } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Category name is required for updates" });
    }

    try {
        const query = `
            UPDATE Category 
            SET name = ?, colorCat = ? 
            WHERE cID = ?
        `;
        const stmt = db.prepare(query);
        const result = stmt.run(name, colorCat || null, cID);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error updating category: " + err.message });
    }
});

// delete existing category by id
router.delete('/delete/:cID', (req, res) => {
    const { cID } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM Category WHERE cID = ?');
        const result = stmt.run(cID);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting category: " + err.message });
    }
});

module.exports = router;
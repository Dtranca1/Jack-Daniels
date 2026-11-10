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

module.exports = router;
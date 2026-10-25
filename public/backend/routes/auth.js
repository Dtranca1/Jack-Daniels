const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db'); // Imports your SQLite database connection

// register route
router.post('/register', async (req, res) => {
    const { Username, Password } = req.body;

    // validate input fields
    if (!Username || !Password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // hash and salt password
        const saltRounds = 10;
        const passH = await bcrypt.hash(Password, saltRounds);

        // insert the new user into db
        // TODO make these line up with the SQL labels, probably in other places too
        const query = `INSERT INTO users (Username, passH) VALUES (?, ?)`;
        db.run(query, [Username, passH], function(err) {
            if (err) {
                // check if the username already exists
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username is already taken" });
                }
                return res.status(500).json({ error: err.message });
            }
            // success response with the generated user ID
            res.status(201).json({ 
                message: "User registered successfully!", 
                uID: this.lastID 
            });
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during registration" });
    }
});

// login route
router.post('/login', (req, res) => {
    const { Username, Password } = req.body;

    // validate input fields
    if (!Username || !Password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // find the user in the database by username
    const query = `SELECT * FROM users WHERE Username = ?`;
    db.get(query, [Username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // user doesnt exist
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        try {
            // compare submitted password with stored secure hash
            const match = await bcrypt.compare(Password, user.passH);
            if (!match) {
                return res.status(401).json({ error: "Invalid username or password" });
            }

            // login successful
            res.json({ 
                message: "Login successful", 
                user: { 
                    uID: user.uID, 
                    Username: user.Username 
                } 
            });
        } catch (err) {
            res.status(500).json({ error: "Server error during login" });
        }
    });
});

module.exports = router;
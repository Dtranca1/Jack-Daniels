/**
 * File: auth.js
 * Purpose: Defines Express REST API routes for user account registration and
 *          authentication using bcrypt password hashing and SQLite.
 * Dependencies: express, bcrypt, ../../../dbserver
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../dbserver'); // import sqlite database connection instance

/**
 * @route   POST /api/auth/register
 * @desc    Hashes the user's password and creates a new user record in the User table
 * @body    {string} firstN - Required user first name
 * @body    {string} lastN - Required user last name
 * @body    {string} email - Required unique user email address
 * @body    {string} Password - Required plaintext password (hashed via bcrypt before storage)
 * @returns {201} JSON confirmation message and generated user ID (uID)
 * @returns {400|500} Validation error, duplicate email error, or server error
 */
router.post('/register', async (req, res) => {
    const { firstN, lastN, email, Password } = req.body;

    // validate input fields
    if (!firstN || !lastN || !email || !Password) {
        return res.status(400).json({ error: "First name, last name, email, and password are required" });
    }

    // try user registration and password hash
    try {
        // hash and salt password
        const saltRounds = 10;
        const passH = await bcrypt.hash(Password, saltRounds);

        // insert the new user into db using native node:sqlite syntax
        const query = `INSERT INTO User (firstN, lastN, email, passH) VALUES (?, ?, ?, ?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(firstN, lastN, email, passH);

        // success response with the generated user ID
        res.status(201).json({ 
            message: "User registered successfully!", 
            uID: result.lastInsertRowid 
        });

    } catch (err) {
        // check if the email already exists (UNIQUE constraint)
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Email is already registered" });
        }
        // error message
        res.status(500).json({ error: "Server error during registration: " + err.message });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user by comparing their submitted password against the stored bcrypt hash
 * @body    {string} email - Required user email address
 * @body    {string} Password - Required plaintext password to verify
 * @returns {200} JSON confirmation message and public user profile object ({ uID, email, firstN, lastN })
 * @returns {400|401|500} Missing credentials, invalid email/password, or server error
 */
router.post('/login', async (req, res) => {
    const { email, Password } = req.body;

    // validate input fields
    if (!email || !Password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // try to auth user details
    try {
        // find the user in the database by email
        const query = `SELECT * FROM User WHERE email = ?`;
        const stmt = db.prepare(query);
        const user = stmt.get(email);
        
        // user doesn't exist
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // compare submitted password with stored secure hash
        const match = await bcrypt.compare(Password, user.passH);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // login successful
        res.json({ 
            message: "Login successful", 
            user: { 
                uID: user.uID, 
                email: user.email,
                firstN: user.firstN,
                lastN: user.lastN
            } 
        });
        // error message
    } catch (err) {
        res.status(500).json({ error: "Server error during login: " + err.message });
    }
});

module.exports = router;
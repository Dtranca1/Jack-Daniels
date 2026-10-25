const express = require('express');
const db = require('./models/db');
const authRoutes = require('./routes/auth'); // <--- Import auth routes

const app = express();
const PORT = process.env.PORT || 3000;
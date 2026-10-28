// imports sqlite 3 package so the node.js can work with the SQL Database
const {DatabaseSync} = require("node:sqlite");
//opens SQL Databse file names remindme.db
//if it doesn't exist it will create a new one
const db = new DatabaseSync("./remindme.db");

//makes sqlite enforce relationships
db.exec("PRAGMA foreign_keys = ON;");

//print output to know we are connected to the DB
console.log(" You are connected to the SQLite DATATABASE.");



//creates USER table 
db.exec(`
    CREATE TABLE IF NOT EXISTS User (
    -- stores a unique ID for each user
        uID INTEGER PRIMARY KEY AUTOINCREMENT,
    --stores first name
        firstN TEXT NOT NULL,
    --stores last name
        lastN TEXT NOT NULL,
    --stores email address / unique prevents users from having the same email
        email TEXT NOT NULL UNIQUE,
    --stores user hash password
        passH TEXT NOT NULL
    )
`);

//creates category table
db.exec(`
    CREATE TABLE IF NOT EXISTS Category (
    --ID for each category
        cID INTEGER PRIMARY KEY AUTOINCREMENT,
    --identifies the user who owns the cat
        uID INTEGER NOT NULL,
    --stores name of the category
        name TEXT NOT NULL,
    --stores the color that can be used visually to identify to cat
        colorCat TEXT,
    --stores date and time when created
        CreatedD DATETIME DEFAULT CURRENT_TIMESTAMP,
    --connects Category.uID to User.uID
        FOREIGN KEY (uID) REFERENCES User(uID)
    )
`);

//creates Reminder table
db.exec(`
    CREATE TABLE IF NOT EXISTS Reminder (
    --id for each reminder
        rID INTEGER PRIMARY KEY AUTOINCREMENT,
    --dentifies the user who owns the reminder
        uID INTEGER NOT NULL,
    --identifies the category the reminder belongs
        cID INTEGER,
    --title of reminder
        title TEXT NOT NULL,
    --description of reminder
        desc TEXT,
    -- stores date/time when reminder is due
        dueRem DATETIME,
    --stores high,medium,low priority level
        priority TEXT,
    -- stores whether the reminder is repeating
        recurring BOOLEAN DEFAULT FALSE,
    --stores wether the reminder is completed
        doneR BOOLEAN DEFAULT FALSE,
    --stores date and time when reminder was last updated
        uAT DATETIME DEFAULT CURRENT_TIMESTAMP,

    --connects the reminder to a user
        FOREIGN KEY (uID) REFERENCES User(uID),
    --connects the reminder to a category
        FOREIGN KEY (cID) REFERENCES Category(cID)
    )
`);

//creates Task table
db.exec(`
    CREATE TABLE IF NOT EXISTS Task (
    --id for each task
        tID INTEGER PRIMARY KEY AUTOINCREMENT,
    --which user owns the task
        uID INTEGER NOT NULL,
    --category the task belongs to
        cID INTEGER,
    --title of the task
        title TEXT NOT NULL,
    --desc of the task
        desc TEXT,
    --stores whether the task is repeating
        recurring BOOLEAN DEFAULT FALSE,
    --stores optional location for the task
        location TEXT,
    --stores whether the task is done
        doneT BOOLEAN DEFAULT FALSE,
    --stores date and time when task was created
        cAT DATETIME DEFAULT CURRENT_TIMESTAMP,
    --stores date and time when task was last updated
        uAT DATETIME DEFAULT CURRENT_TIMESTAMP,
    --stores deadline of the task
        deadline DATETIME,
    --connects task to user
        FOREIGN KEY (uID) REFERENCES User(uID),
    --connects task to category
        FOREIGN KEY (cID) REFERENCES Category(cID)
    )
`);

//create event table
db.exec(`
    CREATE TABLE IF NOT EXISTS Event (
    --id for each event
        eID INTEGER PRIMARY KEY AUTOINCREMENT,
    --which user the event belongs to
        uID INTEGER NOT NULL,
    --category the event belongs to
        cID INTEGER,
    --title of the event
        title TEXT NOT NULL,
    --desc of the event
        desc TEXT,
    --start time of the event 
        startT DATETIME NOT NULL,
    --stores event end
        endT DATETIME NOT NULL,
    --stores whether the event is repeating
        recurring BOOLEAN DEFAULT FALSE,
    --stores optional location for event
        location TEXT,
    --stores whether the event is finished
        doneE BOOLEAN DEFAULT FALSE,
    --stores date and time event was last updated
        uAT DATETIME DEFAULT CURRENT_TIMESTAMP,

    --connects event to a user
        FOREIGN KEY (uID) REFERENCES User(uID),
    --connects event to a category
        FOREIGN KEY (cID) REFERENCES Category(cID)
    )
`);
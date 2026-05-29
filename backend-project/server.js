const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'smartpark_secret_key';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SmartPark'
});

db.connect(err => {
    if (err) console.error('DB Error:', err);
    else console.log('Connected to MySQL');
});

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        jwt.verify(token, SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || password.length < 6) {
        return res.status(400).json({ message: 'Weak credentials' });
    }
    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO Users (username, password) VALUES (?, ?)',
        [username, hashed], (err) => {
            if (err) return res.status(400).json({ message: 'User exists' });
            res.json({ message: 'Registered successfully' });
        });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, results[0].password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: results[0].id }, SECRET, { expiresIn: '1d' });
        res.json({ token, username });
    });
});

// Spare Parts CRUD
app.get('/api/spareparts', authMiddleware, (req, res) => {
    db.query('SELECT * FROM Spare_Part', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/spareparts', authMiddleware, (req, res) => {
    const { Name, Category, Quantity, UnitPrice } = req.body;
    const TotalPrice = Quantity * UnitPrice;
    db.query('INSERT INTO Spare_Part VALUES (?, ?, ?, ?, ?)',
        [Name, Category, Quantity, UnitPrice, TotalPrice], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Added' });
        });
});

// Stock In
app.get('/api/stockin', authMiddleware, (req, res) => {
    db.query('SELECT * FROM Stock_In', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/stockin', authMiddleware, (req, res) => {
    const { Name, StockInQuantity, StockInDate } = req.body;
    db.query('INSERT INTO Stock_In (Name, StockInQuantity, StockInDate) VALUES (?, ?, ?)',
        [Name, StockInQuantity, StockInDate], (err) => {
            if (err) return res.status(500).json(err);
            db.query('UPDATE Spare_Part SET Quantity = Quantity + ?, TotalPrice = (Quantity + ?) * UnitPrice WHERE Name = ?',
                [StockInQuantity, StockInQuantity, Name]);
            res.json({ message: 'Stock In recorded' });
        });
});

// Stock Out
app.get('/api/stockout', authMiddleware, (req, res) => {
    db.query('SELECT * FROM Stock_Out', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/stockout', authMiddleware, (req, res) => {
    const { Name, StockOutQuantity, StockOutUnitPrice, StockOutDate } = req.body;
    const StockOutTotalPrice = StockOutQuantity * StockOutUnitPrice;
    db.query('INSERT INTO Stock_Out (Name, StockOutQuantity, StockOutUnitPrice, StockOutTotalPrice, StockOutDate) VALUES (?, ?, ?, ?, ?)',
        [Name, StockOutQuantity, StockOutUnitPrice, StockOutTotalPrice, StockOutDate], (err) => {
            if (err) return res.status(500).json(err);
            db.query('UPDATE Spare_Part SET Quantity = Quantity - ? WHERE Name = ?',
                [StockOutQuantity, Name]);
            res.json({ message: 'Stock Out recorded' });
        });
});

app.put('/api/stockout/:id', authMiddleware, (req, res) => {
    const { StockOutQuantity, StockOutUnitPrice, StockOutDate } = req.body;
    const total = StockOutQuantity * StockOutUnitPrice;
    db.query('UPDATE Stock_Out SET StockOutQuantity=?, StockOutUnitPrice=?, StockOutTotalPrice=?, StockOutDate=? WHERE StockOutID=?',
        [StockOutQuantity, StockOutUnitPrice, total, StockOutDate, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Updated' });
        });
});

app.delete('/api/stockout/:id', authMiddleware, (req, res) => {
    db.query('DELETE FROM Stock_Out WHERE StockOutID=?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Deleted' });
    });
});

// Daily Report
app.get('/api/report/daily/:date', authMiddleware, (req, res) => {
    db.query(`SELECT so.*, sp.Category FROM Stock_Out so 
              JOIN Spare_Part sp ON so.Name = sp.Name 
              WHERE so.StockOutDate = ?`, [req.params.date], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(5000, () => console.log('Server on port 5000'));
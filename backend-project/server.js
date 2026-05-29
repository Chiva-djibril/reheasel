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

// Spare Parts
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

// Stock Out - GET
app.get('/api/stockout', authMiddleware, (req, res) => {
    db.query('SELECT * FROM Stock_Out', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Stock Out - POST
// Stock Out - POST (with quantity check)
app.post('/api/stockout', authMiddleware, (req, res) => {
    const { Name, StockOutQuantity, StockOutUnitPrice, StockOutDate } = req.body;
    
    // First check available quantity
    db.query('SELECT Quantity FROM Spare_Part WHERE Name = ?', [Name], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Spare part not found' });
        }
        
        const availableQty = results[0].Quantity;
        const requestedQty = parseInt(StockOutQuantity);
        
        if (requestedQty > availableQty) {
            return res.status(400).json({ 
                message: `Insufficient stock! Available: ${availableQty}, Requested: ${requestedQty}` 
            });
        }
        
        if (requestedQty <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }
        
        const StockOutTotalPrice = requestedQty * StockOutUnitPrice;
        
        db.query(
            'INSERT INTO Stock_Out (Name, StockOutQuantity, StockOutUnitPrice, StockOutTotalPrice, StockOutDate) VALUES (?, ?, ?, ?, ?)',
            [Name, requestedQty, StockOutUnitPrice, StockOutTotalPrice, StockOutDate],
            (err) => {
                if (err) return res.status(500).json({ message: 'Insert failed', error: err.message });
                
                db.query(
                    'UPDATE Spare_Part SET Quantity = Quantity - ?, TotalPrice = (Quantity - ?) * UnitPrice WHERE Name = ?',
                    [requestedQty, requestedQty, Name],
                    (err) => {
                        if (err) console.error('Update error:', err);
                        res.json({ message: 'Stock Out recorded successfully' });
                    }
                );
            }
        );
    });
});

// Stock Out - PUT (Update with check)
app.put('/api/stockout/:id', authMiddleware, (req, res) => {
    const { StockOutQuantity, StockOutUnitPrice, StockOutDate } = req.body;
    const id = req.params.id;
    
    // Get original record
    db.query('SELECT * FROM Stock_Out WHERE StockOutID = ?', [id], (err, oldResults) => {
        if (err || oldResults.length === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }
        
        const oldRecord = oldResults[0];
        const oldQty = oldRecord.StockOutQuantity;
        const newQty = parseInt(StockOutQuantity);
        const diff = newQty - oldQty;
        
        // Check available stock
        db.query('SELECT Quantity FROM Spare_Part WHERE Name = ?', [oldRecord.Name], (err, partResults) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            
            const available = partResults[0].Quantity;
            
            if (diff > available) {
                return res.status(400).json({ 
                    message: `Insufficient stock! Available: ${available}, Additional needed: ${diff}` 
                });
            }
            
            if (newQty <= 0) {
                return res.status(400).json({ message: 'Quantity must be greater than 0' });
            }
            
            const total = newQty * StockOutUnitPrice;
            
            db.query(
                'UPDATE Stock_Out SET StockOutQuantity=?, StockOutUnitPrice=?, StockOutTotalPrice=?, StockOutDate=? WHERE StockOutID=?',
                [newQty, StockOutUnitPrice, total, StockOutDate, id],
                (err) => {
                    if (err) return res.status(500).json({ message: 'Update failed' });
                    
                    // Adjust Spare_Part quantity
                    db.query(
                        'UPDATE Spare_Part SET Quantity = Quantity - ?, TotalPrice = (Quantity - ?) * UnitPrice WHERE Name = ?',
                        [diff, diff, oldRecord.Name],
                        () => res.json({ message: 'Updated successfully' })
                    );
                }
            );
        });
    });
});

// Stock Out - DELETE (FIXED)
app.delete('/api/stockout/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    console.log('Delete request for ID:', id);

    db.query('SELECT * FROM Stock_Out WHERE StockOutID = ?', [id], (err, results) => {
        if (err) {
            console.error('Select error:', err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        const record = results[0];

        db.query('DELETE FROM Stock_Out WHERE StockOutID = ?', [id], (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({ message: 'Delete failed', error: err.message });
            }

            db.query(
                'UPDATE Spare_Part SET Quantity = Quantity + ? WHERE Name = ?',
                [record.StockOutQuantity, record.Name],
                (err) => {
                    if (err) console.error('Update error:', err);
                    console.log('Deleted successfully:', id);
                    res.json({ message: 'Deleted successfully' });
                }
            );
        });
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
import { useState, useEffect } from 'react';

function StockIn() {
    const [parts, setParts] = useState([]);
    const [stockIns, setStockIns] = useState([]);
    const [partForm, setPartForm] = useState({ Name: '', Category: '', Quantity: '', UnitPrice: '' });
    const [stockForm, setStockForm] = useState({ Name: '', StockInQuantity: '', StockInDate: '' });

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const loadData = async () => {
        const p = await fetch('http://localhost:5000/api/spareparts', { headers }).then(r => r.json());
        const s = await fetch('http://localhost:5000/api/stockin', { headers }).then(r => r.json());
        setParts(p);
        setStockIns(s);
    };

    useEffect(() => { loadData(); }, []);

    const addPart = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/spareparts', {
            method: 'POST', headers, body: JSON.stringify(partForm)
        });
        setPartForm({ Name: '', Category: '', Quantity: '', UnitPrice: '' });
        loadData();
    };

    const addStockIn = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/stockin', {
            method: 'POST', headers, body: JSON.stringify(stockForm)
        });
        setStockForm({ Name: '', StockInQuantity: '', StockInDate: '' });
        loadData();
    };

    return (
        <div className="page">
            <h2>Spare Parts Management</h2>
            <form onSubmit={addPart} className="form">
                <input placeholder="Name" value={partForm.Name} onChange={e => setPartForm({ ...partForm, Name: e.target.value })} required />
                <input placeholder="Category" value={partForm.Category} onChange={e => setPartForm({ ...partForm, Category: e.target.value })} required />
                <input type="number" placeholder="Quantity" value={partForm.Quantity} onChange={e => setPartForm({ ...partForm, Quantity: e.target.value })} required />
                <input type="number" step="0.01" placeholder="Unit Price" value={partForm.UnitPrice} onChange={e => setPartForm({ ...partForm, UnitPrice: e.target.value })} required />
                <button type="submit">Add Part</button>
            </form>

            <table>
                <thead><tr><th>Name</th><th>Category</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                    {parts.map(p => (
                        <tr key={p.Name}><td>{p.Name}</td><td>{p.Category}</td><td>{p.Quantity}</td><td>{p.UnitPrice}</td><td>{p.TotalPrice}</td></tr>
                    ))}
                </tbody>
            </table>

            <h2>Stock In</h2>
            <form onSubmit={addStockIn} className="form">
                <select value={stockForm.Name} onChange={e => setStockForm({ ...stockForm, Name: e.target.value })} required>
                    <option value="">Select Part</option>
                    {parts.map(p => <option key={p.Name}>{p.Name}</option>)}
                </select>
                <input type="number" placeholder="Quantity" value={stockForm.StockInQuantity} onChange={e => setStockForm({ ...stockForm, StockInQuantity: e.target.value })} required />
                <input type="date" value={stockForm.StockInDate} onChange={e => setStockForm({ ...stockForm, StockInDate: e.target.value })} required />
                <button type="submit">Record Stock In</button>
            </form>

            <table>
                <thead><tr><th>ID</th><th>Name</th><th>Quantity</th><th>Date</th></tr></thead>
                <tbody>
                    {stockIns.map(s => (
                        <tr key={s.StockInID}><td>{s.StockInID}</td><td>{s.Name}</td><td>{s.StockInQuantity}</td><td>{s.StockInDate?.split('T')[0]}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default StockIn;
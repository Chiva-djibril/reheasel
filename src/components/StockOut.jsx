import { useState, useEffect } from 'react';

function StockOut() {
    const [parts, setParts] = useState([]);
    const [stockOuts, setStockOuts] = useState([]);
    const [form, setForm] = useState({ Name: '', StockOutQuantity: '', StockOutUnitPrice: '', StockOutDate: '' });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const loadData = async () => {
        try {
            const p = await fetch('http://localhost:5000/api/spareparts', { headers }).then(r => r.json());
            const s = await fetch('http://localhost:5000/api/stockout', { headers }).then(r => r.json());
            setParts(p);
            setStockOuts(s);
        } catch (err) {
            console.error('Load error:', err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
    e.preventDefault();
    try {
        const url = editId 
            ? `http://localhost:5000/api/stockout/${editId}` 
            : 'http://localhost:5000/api/stockout';
        const method = editId ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(form)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            alert(data.message || 'Operation failed');
            return;
        }
        
        alert(data.message);
        setEditId(null);
        setForm({ Name: '', StockOutQuantity: '', StockOutUnitPrice: '', StockOutDate: '' });
        loadData();
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

    const remove = async (id) => {
        if (!window.confirm('Are you sure you want to delete?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/stockout/${id}`, {
                method: 'DELETE',
                headers
            });

            const data = await res.json();

            if (!res.ok) {
                alert('Error: ' + (data.message || 'Delete failed'));
                console.error(data);
                return;
            }

            alert('Deleted successfully!');
            loadData();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Network error: ' + err.message);
        }
    };

    const edit = (s) => {
        setEditId(s.StockOutID);
        setForm({
            Name: s.Name,
            StockOutQuantity: s.StockOutQuantity,
            StockOutUnitPrice: s.StockOutUnitPrice,
            StockOutDate: s.StockOutDate?.split('T')[0]
        });
    };

    return (
        <div className="page">
            <h2>Stock Out Management</h2>
            <form onSubmit={submit} className="form">
                <select value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} required disabled={editId}>
                    <option value="">Select Part</option>
                    {parts.map(p => <option key={p.Name}>{p.Name}</option>)}
                </select>
                <input type="number" placeholder="Quantity" value={form.StockOutQuantity} onChange={e => setForm({ ...form, StockOutQuantity: e.target.value })} required />
                <input type="number" step="0.01" placeholder="Unit Price" value={form.StockOutUnitPrice} onChange={e => setForm({ ...form, StockOutUnitPrice: e.target.value })} required />
                <input type="date" value={form.StockOutDate} onChange={e => setForm({ ...form, StockOutDate: e.target.value })} required />
                <button type="submit">{editId ? 'Update' : 'Record'} Stock Out</button>
                {editId && <button type="button" onClick={() => { setEditId(null); setForm({ Name: '', StockOutQuantity: '', StockOutUnitPrice: '', StockOutDate: '' }); }}>Cancel</button>}
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Date</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stockOuts.map(s => (
                        <tr key={s.StockOutID}>
                            <td>{s.StockOutID}</td>
                            <td>{s.Name}</td>
                            <td>{s.StockOutQuantity}</td>
                            <td>{s.StockOutUnitPrice}</td>
                            <td>{s.StockOutTotalPrice}</td>
                            <td>{s.StockOutDate?.split('T')[0]}</td>
                            <td>
                                <button onClick={() => edit(s)}>Edit</button>
                                <button onClick={() => remove(s.StockOutID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StockOut;
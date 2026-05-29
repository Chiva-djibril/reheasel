import { useState, useEffect } from 'react';

function StockOut() {
    const [parts, setParts] = useState([]);
    const [stockOuts, setStockOuts] = useState([]);
    const [form, setForm] = useState({ Name: '', StockOutQuantity: '', StockOutUnitPrice: '', StockOutDate: '' });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const loadData = async () => {
        const p = await fetch('http://localhost:5000/api/spareparts', { headers }).then(r => r.json());
        const s = await fetch('http://localhost:5000/api/stockout', { headers }).then(r => r.json());
        setParts(p);
        setStockOuts(s);
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        const url = editId ? `http://localhost:5000/api/stockout/${editId}` : 'http://localhost:5000/api/stockout';
        const method = editId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) return alert(data.message);
        alert(data.message);
        setEditId(null);
        setForm({ Name: '', StockOutQuantity: '', StockOutUnitPrice: '', StockOutDate: '' });
        loadData();
    };

    const remove = async (id) => {
        if (!window.confirm('Delete?')) return;
        const res = await fetch(`http://localhost:5000/api/stockout/${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        alert(data.message);
        loadData();
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
        <div>
            <h2 className="text-lg font-bold mb-2">Stock Out</h2>
            <form onSubmit={submit} className="mb-4">
                <select value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} required disabled={editId} className="border p-1 mr-2">
                    <option value="">Select Part</option>
                    {parts.map(p => <option key={p.Name}>{p.Name}</option>)}
                </select>
                <input type="number" placeholder="Quantity" value={form.StockOutQuantity} onChange={e => setForm({ ...form, StockOutQuantity: e.target.value })} required className="border p-1 mr-2" />
                <input type="number" placeholder="Unit Price" value={form.StockOutUnitPrice} onChange={e => setForm({ ...form, StockOutUnitPrice: e.target.value })} required className="border p-1 mr-2" />
                <input type="date" value={form.StockOutDate} onChange={e => setForm({ ...form, StockOutDate: e.target.value })} required className="border p-1 mr-2" />
                <button type="submit" className="bg-green-500 text-white px-3 py-1 mr-2">
                    {editId ? 'Update' : 'Save'}
                </button>
                {editId && (
                    <button type="button" onClick={() => { setEditId(null); setForm({ Name: '', StockOutQuantity: '', StockOutUnitPrice: '', StockOutDate: '' }); }} className="bg-gray-400 text-white px-3 py-1">
                        Cancel
                    </button>
                )}
            </form>

            <table className="border-collapse border w-full">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Qty</th>
                        <th className="border p-2">Unit Price</th>
                        <th className="border p-2">Total</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stockOuts.map(s => (
                        <tr key={s.StockOutID}>
                            <td className="border p-2">{s.StockOutID}</td>
                            <td className="border p-2">{s.Name}</td>
                            <td className="border p-2">{s.StockOutQuantity}</td>
                            <td className="border p-2">{s.StockOutUnitPrice}</td>
                            <td className="border p-2">{s.StockOutTotalPrice}</td>
                            <td className="border p-2">{s.StockOutDate?.split('T')[0]}</td>
                            <td className="border p-2">
                                <button onClick={() => edit(s)} className="bg-blue-500 text-white px-2 py-1 mr-1">Edit</button>
                                <button onClick={() => remove(s.StockOutID)} className="bg-red-500 text-white px-2 py-1">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default StockOut;
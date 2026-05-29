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
        <div>
            <h2 className="text-lg font-bold mb-2">Spare Parts</h2>
            <form onSubmit={addPart} className="mb-4">
                <input placeholder="Name" value={partForm.Name} onChange={e => setPartForm({ ...partForm, Name: e.target.value })} required className="border p-1 mr-2" />
                <input placeholder="Category" value={partForm.Category} onChange={e => setPartForm({ ...partForm, Category: e.target.value })} required className="border p-1 mr-2" />
                <input type="number" placeholder="Quantity" value={partForm.Quantity} onChange={e => setPartForm({ ...partForm, Quantity: e.target.value })} required className="border p-1 mr-2" />
                <input type="number" placeholder="Unit Price" value={partForm.UnitPrice} onChange={e => setPartForm({ ...partForm, UnitPrice: e.target.value })} required className="border p-1 mr-2" />
                <button type="submit" className="bg-green-500 text-white px-3 py-1">Add Part</button>
            </form>

            <table className="border-collapse border w-full mb-5">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Unit Price</th>
                        <th className="border p-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map(p => (
                        <tr key={p.Name}>
                            <td className="border p-2">{p.Name}</td>
                            <td className="border p-2">{p.Category}</td>
                            <td className="border p-2">{p.Quantity}</td>
                            <td className="border p-2">{p.UnitPrice}</td>
                            <td className="border p-2">{p.TotalPrice}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="text-lg font-bold mb-2">Stock In</h2>
            <form onSubmit={addStockIn} className="mb-4">
                <select value={stockForm.Name} onChange={e => setStockForm({ ...stockForm, Name: e.target.value })} required className="border p-1 mr-2">
                    <option value="">Select Part</option>
                    {parts.map(p => <option key={p.Name}>{p.Name}</option>)}
                </select>
                <input type="number" placeholder="Quantity" value={stockForm.StockInQuantity} onChange={e => setStockForm({ ...stockForm, StockInQuantity: e.target.value })} required className="border p-1 mr-2" />
                <input type="date" value={stockForm.StockInDate} onChange={e => setStockForm({ ...stockForm, StockInDate: e.target.value })} required className="border p-1 mr-2" />
                <button type="submit" className="bg-green-500 text-white px-3 py-1">Save</button>
            </form>

            <table className="border-collapse border w-full">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {stockIns.map(s => (
                        <tr key={s.StockInID}>
                            <td className="border p-2">{s.StockInID}</td>
                            <td className="border p-2">{s.Name}</td>
                            <td className="border p-2">{s.StockInQuantity}</td>
                            <td className="border p-2">{s.StockInDate?.split('T')[0]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default StockIn;
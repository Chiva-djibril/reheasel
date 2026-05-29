import { useState } from 'react';

function Reports() {
    const [date, setDate] = useState('');
    const [report, setReport] = useState([]);
    const token = localStorage.getItem('token');

    const loadReport = async () => {
        if (!date) return;
        const res = await fetch(`http://localhost:5000/api/report/daily/${date}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setReport(await res.json());
    };

    const total = report.reduce((sum, r) => sum + Number(r.StockOutTotalPrice), 0);

    return (
        <div>
            <h2 className="text-lg font-bold mb-2">Daily Report</h2>
            <div className="mb-4">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-1 mr-2" />
                <button onClick={loadReport} className="bg-blue-500 text-white px-3 py-1">Show Report</button>
            </div>

            {report.length > 0 && (
                <div>
                    <table className="border-collapse border w-full mb-3">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Category</th>
                                <th className="border p-2">Quantity</th>
                                <th className="border p-2">Unit Price</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map(r => (
                                <tr key={r.StockOutID}>
                                    <td className="border p-2">{r.Name}</td>
                                    <td className="border p-2">{r.Category}</td>
                                    <td className="border p-2">{r.StockOutQuantity}</td>
                                    <td className="border p-2">{r.StockOutUnitPrice}</td>
                                    <td className="border p-2">{r.StockOutTotalPrice}</td>
                                    <td className="border p-2">{r.StockOutDate?.split('T')[0]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="font-bold">Total: {total.toFixed(2)} RWF</p>
                </div>
            )}
        </div>
    );
}
export default Reports;
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
        <div className="page">
            <h2>Daily Stock Out Report</h2>
            <div className="form">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                <button onClick={loadReport}>Generate Report</button>
            </div>

            {report.length > 0 && (
                <>
                    <table>
                        <thead><tr><th>Name</th><th>Category</th><th>Quantity</th><th>Unit Price</th><th>Total</th><th>Date</th></tr></thead>
                        <tbody>
                            {report.map(r => (
                                <tr key={r.StockOutID}>
                                    <td>{r.Name}</td><td>{r.Category}</td><td>{r.StockOutQuantity}</td>
                                    <td>{r.StockOutUnitPrice}</td><td>{r.StockOutTotalPrice}</td>
                                    <td>{r.StockOutDate?.split('T')[0]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h3>Grand Total: {total.toFixed(2)} RWF</h3>
                </>
            )}
        </div>
    );
}
export default Reports;
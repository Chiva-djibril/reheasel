function Navbar({ setPage, logout }) {
    const username = localStorage.getItem('username');
    return (
        <div className="bg-gray-200 p-3 border-b">
            <h2 className="font-bold inline-block mr-5">SmartPark SIMS</h2>
            <button onClick={() => setPage('stockin')} className="bg-blue-500 text-white px-2 py-1 mr-2">Stock In</button>
            <button onClick={() => setPage('stockout')} className="bg-blue-500 text-white px-2 py-1 mr-2">Stock Out</button>
            <button onClick={() => setPage('reports')} className="bg-blue-500 text-white px-2 py-1 mr-2">Reports</button>
            <span className="mr-3">{username}</span>
            <button onClick={logout} className="bg-red-500 text-white px-2 py-1">Logout</button>
        </div>
    );
}
export default Navbar;
function Navbar({ setPage, logout }) {
    const username = localStorage.getItem('username');
    return (
        <nav className="navbar">
            <h2>Stock&Inventory Management System</h2>
            <div className="nav-links">
                <button onClick={() => setPage('stockin')}>Stock In</button>
                <button onClick={() => setPage('stockout')}>Stock Out</button>
                <button onClick={() => setPage('reports')}>Reports</button>
                <span>{username} Logged in</span>
                <button onClick={logout} className="logout">Logout</button>
            </div>
        </nav>
    );
}
export default Navbar;
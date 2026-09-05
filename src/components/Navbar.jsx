import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        🌍 <span>AI Tourist Planner</span>
      </Link>

      <div className="nav-links">
        <a href="/#home">Home</a>
        <a href="/#features">Features</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#about">About</a>
      </div>

      <Link to="/planner" className="nav-button">
        Start Planning
      </Link>

    </nav>
  );
}

export default Navbar;
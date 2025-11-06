import React from "react";
import { Link } from "react-router-dom";
import { FaTint } from "react-icons/fa";
import "../App.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>
        <FaTint /> Blood Portal
      </h2>
      <div>
        <Link to="/">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}

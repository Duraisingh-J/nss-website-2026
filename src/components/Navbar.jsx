import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        <div className="logo">
          <img src="/images/nss-horizontal.png" alt="NSS Logo" />

        </div>
        <span>National Service Scheme MIT</span>
      </NavLink>

      <ul className="nav-links">
        <li><NavLink to="/"        end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
        <li><NavLink to="/about"       className={({ isActive }) => isActive ? "active" : ""}>About</NavLink></li>
        <li><NavLink to="/sessions"    className={({ isActive }) => isActive ? "active" : ""}>Sessions</NavLink></li>
        <li><NavLink to="/events"      className={({ isActive }) => isActive ? "active" : ""}>Events</NavLink></li>
        <li><NavLink to="/people"      className={({ isActive }) => isActive ? "active" : ""}>People</NavLink></li>
      </ul>
    </nav>
  );
}

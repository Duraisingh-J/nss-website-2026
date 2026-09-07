import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-about">
          <div className="footer-logo">
            <div className="footer-logo-mark">NSS</div>
            <div>
              <div className="footer-logo-title">National Service Scheme</div>
              <div className="footer-logo-sub">Not Me, But You</div>
            </div>
          </div>
          <p>Our NSS unit is dedicated to community service, social responsibility, and youth empowerment through meaningful action since 1969.</p>
          <div className="footer-contact-items">
            <div className="footer-contact-item">
              <span className="contact-icon">📍</span>
              <span>NSS Office, Admin Block, Our Institution, City – 600001</span>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📧</span>
              <a href="mailto:nss@institution.edu.in">nss@institution.edu.in</a>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📞</span>
              <a href="tel:+910000000000">+91 00000 00000</a>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/about">About NSS</a>
          <a href="/sessions">Sessions</a>
          <a href="/events">Events</a>
          <a href="/people">People</a>
        </div>

        <div className="footer-col">
          <h4>Follow Us</h4>
          <a href="#!">Instagram</a>
          <a href="#!">Facebook</a>
          <a href="#!">YouTube</a>
          <a href="#!">Twitter / X</a>
        </div>

        <div className="footer-col">
          <h4>Working Hours</h4>
          <p className="hours-text">Monday – Saturday</p>
          <p className="hours-time">9:00 AM – 5:00 PM</p>
          <div className="gov-badge">
            <span>Government of India</span>
            <span>Ministry of Youth Affairs & Sports</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 NSS – National Service Scheme. All rights reserved.</span>
        <span className="footer-motto">✦ Not Me, But You ✦</span>
      </div>
    </footer>
  );
}

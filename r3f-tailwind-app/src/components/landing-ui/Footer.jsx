import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <div className="footer-title">IntelliSpace</div>
        <div className="footer-sub">From requirements to an editable interior.</div>
      </div>
      <div className="footer-links">
        <span>Product</span>
        <span>Workspace</span>
        <span>Contact</span>
      </div>
      <div className="footer-copy">© {new Date().getFullYear()} IntelliSpace</div>
    </footer>
  );
}
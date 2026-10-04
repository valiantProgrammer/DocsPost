"use client";

import Link from "next/link";
import { IoLogoDribbble } from "react-icons/io";
import { FiGithub, FiTwitter, FiLinkedin, FiDisc, FiHeart } from "react-icons/fi";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="docspost-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo">
            <span className="footer-logo-icon">
              <IoLogoDribbble size={28} />
            </span>
            <span className="footer-logo-text">DocsPost</span>
          </Link>
          <p className="footer-tagline">
            Share knowledge, Build the future.
          </p>
          <p className="footer-desc">
            A modern knowledge platform for developers, students and technical creators to write, publish, and master engineering concepts.
          </p>
          <div className="footer-social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FiTwitter size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FiLinkedin size={18} />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <FiDisc size={18} />
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-links-list">
              <li><Link href="/explore">Explore</Link></li>
              <li><Link href="/workspace/new">Create</Link></li>
              <li><Link href="/learning">Learning</Link></li>
              <li><Link href="/categories">Categories</Link></li>
              <li><Link href="/workspace">Workspace</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links-list">
              <li><Link href="/explore">Documentation</Link></li>
              <li><Link href="/explore?type=Guide">Guides & Tutorials</Link></li>
              <li><Link href="/bookmarks">Saved Items</Link></li>
              <li><Link href="/dashboard">Analytics</Link></li>
              <li><Link href="/search">Advanced Search</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links-list">
              <li><Link href="/about">About DocsPost</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/contact">Contact Support</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            © {new Date().getFullYear()} DocsPost. All rights reserved.
          </p>
          <div className="footer-status-pill">
            <span className="status-dot"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

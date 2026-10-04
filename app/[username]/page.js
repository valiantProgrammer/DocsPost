"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
    FiMapPin,
    FiGlobe,
    FiMail,
    FiClock,
    FiEye,
    FiCheck,
    FiBookOpen,
    FiStar,
    FiArrowRight
} from "react-icons/fi";
import "./profile.css";

const RECENT_DOCUMENTS = [
    {
        id: "doc-1",
        title: "Python Async Programming Design",
        readTime: "13 min read",
        views: "3.8K views",
        thumbnail: "/thumb-async-design.jpg",
        slug: "mastering-python-asyncio-deep-dive"
    },
    {
        id: "doc-2",
        title: "Python Async Programming Basics",
        readTime: "12 min read",
        views: "1.8K views",
        thumbnail: "/thumb-async-basics.jpg",
        slug: "mastering-python-asyncio-deep-dive"
    },
    {
        id: "doc-3",
        title: "Machine Learning Roadmap Basics",
        readTime: "15 min read",
        views: "2.2K views",
        thumbnail: "/thumb-ml-roadmap.jpg",
        slug: "docker-kubernetes-production-guide"
    }
];

const ALL_DOCUMENTS = [
    ...RECENT_DOCUMENTS,
    {
        id: "doc-4",
        title: "Production Docker & Kubernetes Deployment Guide",
        readTime: "14 min read",
        views: "5.1K views",
        thumbnail: "/thumb-async-design.jpg",
        slug: "docker-kubernetes-production-guide"
    },
    {
        id: "doc-5",
        title: "React 19 Server Actions & Architecture Patterns",
        readTime: "10 min read",
        views: "4.2K views",
        thumbnail: "/thumb-async-basics.jpg",
        slug: "react-19-server-actions-architecture"
    },
    {
        id: "doc-6",
        title: "PostgreSQL Query Optimization & Indexing Strategies",
        readTime: "16 min read",
        views: "3.1K views",
        thumbnail: "/thumb-ml-roadmap.jpg",
        slug: "postgresql-query-optimization-indexing"
    }
];

export default function PublicProfilePage() {
    const params = useParams();
    const rawParam = params?.username ? String(params.username) : "rupayan";
    const username = decodeURIComponent(rawParam);

    const displayName = (username && username.toLowerCase() !== "rupayan")
        ? username.split(/[-_.]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "Rupayan Dey";

    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(128);
    const [activeTab, setActiveTab] = useState("overview");

    const toggleFollow = () => {
        if (isFollowing) {
            setIsFollowing(false);
            setFollowerCount((prev) => prev - 1);
        } else {
            setIsFollowing(true);
            setFollowerCount((prev) => prev + 1);
        }
    };

    return (
        <div className="profile-page-wrapper">
            <Header />

            <main className="profile-main-content">
                <div className="profile-container" style={{ paddingTop: 24 }}>
                    {/* Header Card (with Mountain Banner) */}
                    <div className="profile-card-container">
                        <div className="profile-cover-banner">
                            <img src="/mountain-banner.jpg" alt="Mountain Cover Banner" />
                        </div>

                        <div className="profile-info-section">
                            <div className="profile-avatar-and-actions">
                                <div className="profile-avatar-wrapper">
                                    <div className="profile-main-avatar">
                                        <img
                                            src="/rupayan-avatar.jpg"
                                            alt={displayName}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/rupayan-avatar.jpg";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="profile-action-buttons">
                                    <button
                                        className={`btn-profile-follow ${isFollowing ? "following" : ""}`}
                                        onClick={toggleFollow}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <FiCheck size={16} /> Following
                                            </>
                                        ) : (
                                            "Follow"
                                        )}
                                    </button>
                                    <button
                                        className="btn-profile-message"
                                        onClick={() => {
                                            window.location.href = "mailto:contact@rupayandey.dev?subject=Hello from DocsPost";
                                        }}
                                    >
                                        <FiMail size={16} /> Message
                                    </button>
                                </div>
                            </div>

                            <div className="profile-user-details">
                                <h1 className="profile-user-name">{displayName}</h1>
                                <p className="profile-user-handle">@{username.toLowerCase()}</p>
                                <p className="profile-user-role">Full Stack Developer</p>
                                <p className="profile-user-bio">
                                    Building systems, AI apps & developer tools. Sharing knowledge through detailed guides and tutorials.
                                </p>

                                <div className="profile-user-meta">
                                    <span className="meta-info-item">
                                        <FiMapPin size={15} /> Kolkata, India
                                    </span>
                                    <span className="meta-info-item">
                                        <FiGlobe size={15} />
                                        <a
                                            href="https://rupayandey.dev"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="meta-link"
                                        >
                                            rupayandey.dev
                                        </a>
                                    </span>
                                </div>
                            </div>

                            <div className="profile-stats-pill-row">
                                <div className="profile-stat-box">
                                    <span className="stat-bold-count">{followerCount}</span>
                                    <span className="stat-sub-label">Followers</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="stat-bold-count">45</span>
                                    <span className="stat-sub-label">Following</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="stat-bold-count">24</span>
                                    <span className="stat-sub-label">Documents</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="profile-nav-tabs-wrap">
                        <button
                            className={`profile-tab-pill ${activeTab === "overview" ? "active" : ""}`}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`profile-tab-pill ${activeTab === "documents" ? "active" : ""}`}
                            onClick={() => setActiveTab("documents")}
                        >
                            Documents
                        </button>
                        <button
                            className={`profile-tab-pill ${activeTab === "analytics" ? "active" : ""}`}
                            onClick={() => setActiveTab("analytics")}
                        >
                            Analytics
                        </button>
                        <button
                            className={`profile-tab-pill ${activeTab === "about" ? "active" : ""}`}
                            onClick={() => setActiveTab("about")}
                        >
                            About
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "overview" && (
                        <div className="overview-tab-content">
                            <h2 className="recent-docs-section-heading">Recent Documents</h2>

                            <div className="recent-docs-horizontal-grid">
                                {RECENT_DOCUMENTS.map((doc) => (
                                    <Link key={doc.id} href={`/doc/${doc.slug}`} className="recent-doc-card-h">
                                        <div className="recent-doc-thumb-box">
                                            <img src={doc.thumbnail} alt={doc.title} />
                                        </div>
                                        <div className="recent-doc-info-col">
                                            <h3>{doc.title}</h3>
                                            <div className="recent-doc-meta-row">
                                                <span>
                                                    <FiClock size={13} /> {doc.readTime}
                                                </span>
                                                <span>
                                                    <FiEye size={13} /> {doc.views}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div className="documents-tab-content">
                            <h2 className="recent-docs-section-heading">All Documents ({ALL_DOCUMENTS.length})</h2>
                            <div className="recent-docs-horizontal-grid">
                                {ALL_DOCUMENTS.map((doc) => (
                                    <Link key={doc.id} href={`/doc/${doc.slug}`} className="recent-doc-card-h">
                                        <div className="recent-doc-thumb-box">
                                            <img src={doc.thumbnail} alt={doc.title} />
                                        </div>
                                        <div className="recent-doc-info-col">
                                            <h3>{doc.title}</h3>
                                            <div className="recent-doc-meta-row">
                                                <span>
                                                    <FiClock size={13} /> {doc.readTime}
                                                </span>
                                                <span>
                                                    <FiEye size={13} /> {doc.views}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div className="analytics-tab-content">
                            <h2 className="recent-docs-section-heading">Audience & Performance</h2>
                            <div className="profile-about-card">
                                <p>Total impressions across all guides: <strong>48.2K</strong></p>
                                <p>Average read completion rate: <strong>76.4%</strong></p>
                                <p>Top performing topic: <strong>Python Concurrency & AsyncIO</strong></p>
                            </div>
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div className="about-tab-content">
                            <div className="profile-about-card">
                                <h3>About {displayName}</h3>
                                <p>
                                    Building systems, AI apps & developer tools. Sharing knowledge through detailed guides and tutorials.
                                </p>
                                <h4 style={{ margin: "16px 0 8px 0", fontSize: "1rem", fontWeight: 700 }}>
                                    Core Technologies
                                </h4>
                                <div className="tech-stack-wrap">
                                    <span className="tech-pill">Python</span>
                                    <span className="tech-pill">TypeScript</span>
                                    <span className="tech-pill">Next.js</span>
                                    <span className="tech-pill">Node.js</span>
                                    <span className="tech-pill">PostgreSQL</span>
                                    <span className="tech-pill">Docker</span>
                                    <span className="tech-pill">Kubernetes</span>
                                    <span className="tech-pill">AWS</span>
                                    <span className="tech-pill">PyTorch</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

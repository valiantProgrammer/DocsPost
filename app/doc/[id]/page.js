"use client"
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import DocEngagement from "../../components/DocEngagement";
import { MdExpandMore } from "react-icons/md";
import { MdShare } from "react-icons/md";
import { LuMessageCircle } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { MdMoreVert } from "react-icons/md";

const DOC_CONTENT = {
    "dsa-tutorial": {
        title: "DSA Tutorial",
        navTitle: "DSA Tutorial",
        lastUpdated: "14 Apr, 2026",
    },
};

function getTitleFromSlug(slug = "") {
    return slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function Home() {
    const params = useParams();
    const rawId = typeof params?.id === "string" ? params.id : "dsa-tutorial";

    const [isDark, setIsDark] = useState(false);
    const [expandedSection, setExpandedSection] = useState("DSA Fundamentals");
    const [shareStatus, setShareStatus] = useState("");
    const shareStatusTimerRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialDark = savedTheme ? savedTheme === "dark" : prefersDark;
        setIsDark(initialDark);
        document.documentElement.setAttribute("data-theme", initialDark ? "dark" : "light");
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        const theme = newDark ? "dark" : "light";
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    };

    useEffect(() => {
        return () => {
            if (shareStatusTimerRef.current) {
                clearTimeout(shareStatusTimerRef.current);
            }
        };
    }, []);

    const showShareStatus = (message) => {
        setShareStatus(message);
        if (shareStatusTimerRef.current) {
            clearTimeout(shareStatusTimerRef.current);
        }
        shareStatusTimerRef.current = setTimeout(() => {
            setShareStatus("");
        }, 2200);
    };

    const currentDoc = DOC_CONTENT[rawId] ?? {
        title: getTitleFromSlug(rawId),
        navTitle: getTitleFromSlug(rawId),
        lastUpdated: "14 Apr, 2026",
    };

    const categoryLinks = [
        currentDoc.navTitle,
        "Interview Questions",
        "Quizzes",
        "Must Do",
        "Advanced DSA",
        "System Design",
        "Aptitude",
        "Puzzles",
        "Interview Corner",
        "DSA Python",
    ];

    const sidebarSections = [
        { title: "DSA Fundamentals" },
        { title: "Data Structures" },
        { title: "Algorithms" },
        { title: "Advanced" },
        { title: "Interview Preparation" },
    ];

    const tutorialContent = {
        title: currentDoc.title,
        lastUpdated: currentDoc.lastUpdated,
        description: "DSA stands for Data Structures and Algorithms. Data structures manage how data is stored and accessed. Algorithms focus on processing this data. Examples of data structures are Array, Linked List, Tree and Heap, and examples of algorithms are Binary Search, Quick Sort and Merge Sort.",
        bulletPoints: [
            "Foundation for almost every software like GPS, Search Engines, AI ChatBots, Gaming Apps, Databases, Web Applications, etc",
            "Top Companies like Google, Microsoft, Amazon, Apple, Meta and many other heavily focus on DSA in interviews.",
            "Learning DSA boosts your problem-solving abilities and make you a stronger programmer.",
        ],
        stepByStepHeading: "Step by Step Learning",
        stepByStepText: "It is advised to skip the hard problems of every section in the first iteration if you are a complete beginner.",
        fundamentalsHeading: "Fundamentals",
        fundamentals: [
            { text: "Programming : ", links: ["Input and Output", "Conditional Statements", "For loop", "While loop", "Function", "Classes and Objects"] },
            { text: "Complexity Analysis : ", links: ["Order of Growth", "Asymptotic Analysis", "Big-O", "Theta", "Big - O", "Time Complexity", "Space Complexity"] },
        ],
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: tutorialContent.title,
            text: `Read this article: ${tutorialContent.title}`,
            url,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showShareStatus("Shared successfully");
                return;
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                showShareStatus("Link copied");
                return;
            }

            showShareStatus("Sharing not supported");
        } catch {
            showShareStatus("Share cancelled");
        }
    };

    const quickLinks = [
        "Overview",
        "Why Learn DSA",
        "Step by Step Learning",
        "Fundamentals",
        "Complexity Analysis",
    ];

    const rightHighlights = [
        "Most asked in top interviews",
        "Beginner to advanced roadmap",
        "Recommended practice sequence",
    ];

    return (
        <main className="learning-page" data-theme={isDark ? "dark" : "light"}>
            <Header isDark={isDark} toggleTheme={toggleTheme} />

            <div className="category-strip" role="navigation" aria-label="Topics">
                <div className="category-strip-inner">
                    {categoryLinks.map((item) => (
                        <a key={item} href="#" className="category-link">
                            {item}
                        </a>
                    ))}
                </div>
            </div>

            <div className="tutorial-container">
                <aside className="tutorial-sidebar">
                    <div className="sidebar-section-header">Share Your Experiences</div>

                    {sidebarSections.map((section) => (
                        <div key={section.title} className="sidebar-item">
                            <button
                                className="sidebar-item-button"
                                onClick={() => setExpandedSection(expandedSection === section.title ? "" : section.title)}
                            >
                                <span>{section.title}</span>
                                <MdExpandMore className={`expand-icon ${expandedSection === section.title ? "expanded" : ""}`} />
                            </button>
                        </div>
                    ))}
                </aside>

                <section className="tutorial-content">
                    <div className="content-header">
                        <div>
                            <h1>{tutorialContent.title}</h1>
                            <p className="last-updated">Last Updated : {tutorialContent.lastUpdated}</p>
                        </div>
                        <div className="content-actions">
                            <button className="action-btn" type="button" aria-label="Share" onClick={handleShare}><MdShare size={20} /></button>
                            <button className="action-btn" type="button" aria-label="Comments"><LuMessageCircle size={20} /></button>
                            <button className="action-btn" type="button" aria-label="Edit"><MdEdit size={20} /></button>
                            <button className="action-btn" type="button" aria-label="More"><MdMoreVert size={20} /></button>
                            <DocEngagement docId={rawId} />
                            <span className="share-status" role="status" aria-live="polite">{shareStatus}</span>
                        </div>
                    </div>

                    <p className="content-description">{tutorialContent.description}</p>

                    <ul className="bullet-list">
                        {tutorialContent.bulletPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                        ))}
                    </ul>

                    <h2 className="section-heading">{tutorialContent.stepByStepHeading}</h2>
                    <p className="section-text">{tutorialContent.stepByStepText}</p>

                    <h2 className="section-heading">{tutorialContent.fundamentalsHeading}</h2>
                    {tutorialContent.fundamentals.map((item, idx) => (
                        <p key={idx} className="fundamentals-text">
                            {item.text}
                            {item.links.map((link, linkIdx) => (
                                <span key={linkIdx}>
                                    <a href="#" className="link-text">{link}</a>
                                    {linkIdx < item.links.length - 1 && ", "}
                                </span>
                            ))}
                        </p>
                    ))}
                </section>

                <aside className="tutorial-rightbar" aria-label="Article side panel">
                    <section className="rightbar-card">
                        <h3>On this page</h3>
                        <ul className="rightbar-list">
                            {quickLinks.map((item) => (
                                <li key={item}>
                                    <a href="#">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rightbar-card">
                        <h3>Highlights</h3>
                        <ul className="rightbar-list muted">
                            {rightHighlights.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>
                </aside>
            </div>
        </main>
    );
}

"use client"
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Notification from "../../components/Notification";
import ReportModal from "../../components/ReportModal";
import CodeBlock from "../../components/CodeBlock";
import { FaRegEye } from "react-icons/fa";
import { MdShare } from "react-icons/md";
import { FiThumbsUp, FiFlag } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./page.css";

// Custom heading renderer with IDs for TOC links
const HeadingRenderer = ({ level, children }) => {
    const id = children?.[0]
        ?.toString()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    const HeadingTag = `h${level}`;
    return <HeadingTag id={id}>{children}</HeadingTag>;
};

export default function DocumentView() {
    const params = useParams();
    const slug = typeof params?.id === "string" ? params.id : "";

    const [isDark, setIsDark] = useState(false);
    const [docData, setDocData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [relatedDocs, setRelatedDocs] = useState([]);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [notification, setNotification] = useState({ message: "", type: "success" });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialDark = savedTheme ? savedTheme === "dark" : prefersDark;
        setIsDark(initialDark);
        document.documentElement.setAttribute("data-theme", initialDark ? "dark" : "light");
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }, [isDark]);

    useEffect(() => {
        if (!slug) return;

        const fetchDocument = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/documents/get-document?slug=${encodeURIComponent(slug)}`
                );

                if (!response.ok) {
                    throw new Error("Document not found");
                }

                const data = await response.json();
                setDocData(data.document);
                setViewCount(data.document.views || 0);

                // Log view activity to analytics for tracking article views
                const userEmail = localStorage.getItem("docspost-email") || "";
                if (userEmail) {
                    try {
                        await fetch("/api/docs/log-view", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                docId: slug,
                                userEmail,
                            }),
                        });
                    } catch (err) {
                        console.error("Error logging view activity:", err);
                    }
                }
            } catch (err) {
                console.error("Error fetching document:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [slug]);

    useEffect(() => {
        return () => {
            // Cleanup if needed
        };
    }, []);

    // Extract headings from content after render
    useEffect(() => {
        if (!contentRef.current) return;

        const headingElements = contentRef.current.querySelectorAll("h2, h3");
        const extractedHeadings = Array.from(headingElements).map((el, index) => ({
            id: el.id || `heading-${index}`,
            text: el.textContent,
            level: parseInt(el.tagName[1]),
        }));

        setHeadings(extractedHeadings);
    }, [docData?.content]);

    // Fetch related documents by category
    useEffect(() => {
        if (!docData?.category) return;

        const fetchRelatedDocs = async () => {
            try {
                const response = await fetch(
                    `/api/documents/user-documents?category=${encodeURIComponent(docData.category)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    // Filter out current document and limit to 10
                    const filtered = data.documents
                        .filter(doc => doc.slug !== slug)
                        .slice(0, 10);
                    setRelatedDocs(filtered);
                }
            } catch (err) {
                console.error("Error fetching related docs:", err);
            }
        };

        fetchRelatedDocs();
    }, [docData?.category, slug]);

    // Fetch upvote data after document loads
    useEffect(() => {
        if (!slug) return;

        const fetchUpvoteData = async () => {
            try {
                const userEmail = localStorage.getItem("userEmail") || "";
                const response = await fetch(
                    `/api/docs/upvote?docId=${slug}&userEmail=${encodeURIComponent(userEmail)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setUpvoteCount(data.upvoteCount || 0);
                    setIsUpvoted(data.isUpvoted || false);
                }
            } catch (err) {
                console.error("Error fetching upvote data:", err);
            }
        };

        fetchUpvoteData();
    }, [slug]);

    const toggleTheme = () => {
        if (typeof window === "undefined") return;
        const newDark = !isDark;
        setIsDark(newDark);
        const theme = newDark ? "dark" : "light";
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    };

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: docData?.title,
            text: `Read this: ${docData?.title}`,
            url,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showNotification("Shared successfully", "success");
                return;
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                showNotification("Link copied to clipboard", "success");
                return;
            }

            showNotification("Sharing not supported on your device", "info");
        } catch {
            showNotification("Share cancelled", "info");
        }
    };

    const handleUpvote = async () => {
        if (!docData) return;

        const userEmail = localStorage.getItem("userEmail") || "anonymous";

        try {
            const response = await fetch(`/api/docs/upvote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    docId: slug,
                    userEmail,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsUpvoted(data.isUpvoted);

                // Log upvote/like activity
                if (data.isUpvoted) {
                    try {
                        await fetch("/api/analytics/log-activity", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                userEmail: userEmail === "anonymous" ? "" : userEmail,
                                type: "vote",
                                voteType: "like",
                                articleId: docData._id,
                                articleTitle: docData.title,
                            }),
                        });
                    } catch (err) {
                        console.error("Error logging upvote activity:", err);
                    }
                }

                // Fetch updated count
                const countResponse = await fetch(
                    `/api/docs/upvote?docId=${slug}&userEmail=${encodeURIComponent(userEmail)}`
                );
                if (countResponse.ok) {
                    const countData = await countResponse.json();
                    setUpvoteCount(countData.upvoteCount || 0);
                }
                showNotification(data.isUpvoted ? "Upvoted!" : "Upvote removed", "success");
            } else {
                showNotification("Error updating upvote", "error");
            }
        } catch (err) {
            console.error("Error upvoting:", err);
            showNotification("Failed to upvote", "error");
        }
    };

    const handleReport = () => {
        setIsReportModalOpen(true);
    };

    const handleReportSubmit = async (reportData) => {
        if (!docData) return;

        const userEmail = localStorage.getItem("userEmail") || "anonymous";
        setIsSubmittingReport(true);

        try {
            const response = await fetch(`/api/docs/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    docId: slug,
                    userEmail,
                    reason: reportData.reason,
                    description: reportData.description,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.message || "Report submitted successfully!", "success");
                setIsReportModalOpen(false);
            } else {
                const error = await response.json();
                showNotification(error.error || "Error submitting report", "error");
            }
        } catch (err) {
            console.error("Error reporting doc:", err);
            showNotification("Failed to submit report. Please try again.", "error");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    if (isLoading) {
        return (
            <main className="doc-view" data-theme={isDark ? "dark" : "light"}>
                <Header isDark={isDark} toggleTheme={toggleTheme} />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading document...</p>
                </div>
            </main>
        );
    }

    if (error || !docData) {
        return (
            <main className="doc-view" data-theme={isDark ? "dark" : "light"}>
                <Header isDark={isDark} toggleTheme={toggleTheme} />
                <div className="error-container">
                    <h2>Document Not Found</h2>
                    <p>{error || "The document you're looking for doesn't exist."}</p>
                    <a href="/learning" className="btn btn-primary">
                        Back to Learning
                    </a>
                </div>
            </main>
        );
    }

    const formattedDate = new Date(docData.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <main className="doc-view" data-theme={isDark ? "dark" : "light"}>
            <Header isDark={isDark} toggleTheme={toggleTheme} />

            <div className="doc-container-three-col">
                {/* Left Sidebar - Related Topics */}
                <aside className="left-sidebar">
                    <section className="sidebar-card">
                        <h3>Related Topics</h3>
                        {relatedDocs.length > 0 ? (
                            <ul className="related-docs-list">
                                {relatedDocs.map((doc) => (
                                    <li key={doc._id} className="related-doc-item">
                                        <a href={`/doc/${doc.slug}`} className="related-doc-link">
                                            <h4>{doc.title}</h4>
                                            <span className="difficulty-badge" style={{
                                                background: doc.difficulty === 'Beginner' ? 'rgba(34, 197, 94, 0.15)' :
                                                    doc.difficulty === 'Intermediate' ? 'rgba(59, 130, 246, 0.15)' :
                                                        'rgba(239, 68, 68, 0.15)',
                                                color: doc.difficulty === 'Beginner' ? '#22c55e' :
                                                    doc.difficulty === 'Intermediate' ? '#3b82f6' :
                                                        '#ef4444',
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                marginTop: '4px'
                                            }}>
                                                {doc.difficulty}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="sidebar-empty">No related topics</p>
                        )}
                    </section>
                </aside>

                {/* Middle - Article */}
                <article className="doc-article">
                    <header className="doc-header">
                        <div className="doc-header-content">
                            <div className="doc-badges">
                                <span className={`difficulty-badge difficulty-${docData.difficulty.toLowerCase()}`}>
                                    {docData.difficulty}
                                </span>
                                <span className="category-badge">{docData.category}</span>
                            </div>
                            <h1>{docData.title}</h1>
                            <div className="doc-meta">
                                <span>{docData.userEmail}</span>
                                <span>•</span>
                                <span>Updated {formattedDate}</span>
                            </div>
                        </div>

                        <div className="doc-actions">
                            <button
                                className="action-btn"
                                type="button"
                                aria-label="Share"
                                onClick={handleShare}
                                title="Share this document"
                            >
                                <MdShare size={20} />
                            </button>
                            <button
                                className={`action-btn ${isUpvoted ? "active" : ""}`}
                                type="button"
                                aria-label="Upvote"
                                onClick={handleUpvote}
                                title="Upvote this document"
                            >
                                <div className="btn-content">
                                    <FiThumbsUp size={18} />
                                </div>
                                {upvoteCount > 0 && <span className="btn-count">{upvoteCount}</span>}
                            </button>
                            <button
                                className="action-btn"
                                type="button"
                                aria-label="Views"
                                title="Document views"
                                disabled
                            >
                                <div className="btn-content">
                                    <span><FaRegEye /></span>
                                </div>
                                {viewCount > 0 && <span className="btn-count">{viewCount}</span>}
                            </button>
                            <button
                                className="action-btn"
                                type="button"
                                aria-label="Report"
                                onClick={handleReport}
                                title="Report this document"
                            >
                                <FiFlag size={20} />
                            </button>
                        </div>
                    </header>

                    <div className="doc-description">
                        {docData.description}
                    </div>

                    <div className="doc-content markdown-body" ref={contentRef}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
                                h2: ({ children }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
                                h3: ({ children }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
                                h4: ({ children }) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
                                h5: ({ children }) => <HeadingRenderer level={5}>{children}</HeadingRenderer>,
                                h6: ({ children }) => <HeadingRenderer level={6}>{children}</HeadingRenderer>,
                                code: CodeBlock,
                            }}
                        >
                            {docData.content || "No content yet."}
                        </ReactMarkdown>
                    </div>

                    <footer className="doc-footer">
                        <div className="footer-info">
                            <span className="view-count">
                                <FaRegEye /> {docData.views || 0} views
                            </span>
                        </div>
                        <div className="footer-actions">
                            <a href="/learning" className="back-link">
                                ← Back to Learning
                            </a>
                        </div>
                    </footer>
                </article>

                {/* Right Sidebar - TOC and Info */}
                <aside className="right-sidebar">
                    <section className="sidebar-card">
                        <h3>Table of Contents</h3>
                        {headings.length > 0 ? (
                            <ul className="toc-list">
                                {headings.map((heading) => (
                                    <li
                                        key={heading.id}
                                        className={`toc-item toc-level-${heading.level}`}
                                    >
                                        <button
                                            className="toc-link"
                                            onClick={() => scrollToHeading(heading.id)}
                                        >
                                            {heading.text}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="toc-empty">No sections found</p>
                        )}
                    </section>

                    <section className="sidebar-card">
                        <h3>Document Info</h3>
                        <ul className="info-list">
                            <li>
                                <span>Category:</span>
                                <strong>{docData.category}</strong>
                            </li>
                            <li>
                                <span>Level:</span>
                                <strong>{docData.difficulty}</strong>
                            </li>
                            <li>
                                <span>Author:</span>
                                {docData.authorUsername ? (
                                    <strong className="truncate">
                                        <Link href={`/${docData.authorUsername}`} className="author-link">
                                            {docData.authorUsername}
                                        </Link>
                                    </strong>
                                ) : (
                                    <strong className="truncate">{docData.userEmail}</strong>
                                )}
                            </li>
                            <li>
                                <span>Created:</span>
                                <strong>
                                    {new Date(docData.createdAt).toLocaleDateString()}
                                </strong>
                            </li>
                        </ul>
                    </section>
                </aside>
            </div>

            <Notification message={notification.message} type={notification.type} />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReportSubmit}
                isLoading={isSubmittingReport}
            />
        </main>
    );
}

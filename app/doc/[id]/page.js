"use client";
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
import { useTheme } from "../../providers/ThemeProvider";
import "./page.css";

// ================= HELPERS =================

const getTextFromHTML = (html) => {
    if (!html || typeof document === "undefined") return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
};

const stringifyChildren = (children) => {
    if (children == null) return "";
    if (typeof children === "string" || typeof children === "number")
        return String(children);
    if (Array.isArray(children)) return children.map(stringifyChildren).join("");
    if (typeof children === "object" && children?.props?.children) {
        return stringifyChildren(children.props.children);
    }
    return "";
};

const generateHeadingId = (text, index = 0) => {
    const base = (text || "heading")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    return `${base || "heading"}-${index}`;
};

const parseCodeBlockContent = (content) => {
    if (!content) return { language: "javascript", code: "" };
    const idx = content.indexOf("\n");
    if (idx === -1) return { language: "javascript", code: content };
    return {
        language: content.slice(0, idx),
        code: content.slice(idx + 1),
    };
};

const getVideoEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        try {
            if (url.includes("youtu.be/")) {
                const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
                return id ? `https://www.youtube.com/embed/${id}` : url;
            }
            const parsed = new URL(url);
            const id = parsed.searchParams.get("v");
            return id ? `https://www.youtube.com/embed/${id}` : url;
        } catch {
            return url;
        }
    }

    if (url.includes("vimeo.com")) {
        const id = url.split("/").pop();
        return id ? `https://player.vimeo.com/video/${id}` : url;
    }

    return url;
};

// ================= MAIN =================

export default function DocumentView() {
    const params = useParams();
    const slug = typeof params?.id === "string" ? params.id : "";
    const { isDark } = useTheme();

    const [docData, setDocData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeHeadingId, setActiveHeadingId] = useState("");
    const [relatedDocs, setRelatedDocs] = useState([]);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [notification, setNotification] = useState({
        message: "",
        type: "success",
    });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const contentRef = useRef(null);

    const hasBlocks = Array.isArray(docData?.blocks) && docData.blocks.length > 0;

    useEffect(() => {
        if (typeof window === "undefined") return;
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }, [isDark]);

    // ================= FETCH DOC =================
    useEffect(() => {
        if (!slug) return;

        const fetchDocument = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/documents/get-document?slug=${encodeURIComponent(slug)}`
                );

                if (!response.ok) throw new Error("Document not found");

                const data = await response.json();
                setDocData(data.document);
                setViewCount(data.document.views || 0);

                const userEmail = localStorage.getItem("docspost-email") || "";
                if (userEmail) {
                    try {
                        await fetch("/api/docs/log-view-optimized", {
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
                setError(err.message || "Failed to load document");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [slug]);

    // ================= EXTRACT HEADINGS FOR TOC =================
    useEffect(() => {
        if (!contentRef.current) return;

        let rafId = 0;

        const extractHeadings = () => {
            const headingElements = contentRef.current?.querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            );

            if (!headingElements || headingElements.length === 0) {
                setHeadings([]);
                setActiveHeadingId("");
                return;
            }

            const extracted = Array.from(headingElements)
                .map((el, index) => {
                    const text = (el.textContent || "").trim();
                    if (!text) return null;

                    const id = el.id || generateHeadingId(text, index);
                    el.id = id;

                    return {
                        id,
                        text,
                        level: Number(el.tagName[1]),
                    };
                })
                .filter(Boolean);

            // Prefer h2+ in TOC
            let toc = extracted.filter((h) => h.level >= 2);

            // fallback to h1 (except likely page title as first heading)
            if (toc.length === 0) {
                toc = extracted.filter((h) => h.level === 1).slice(1);
            }

            setHeadings(toc);
            setActiveHeadingId(toc[0]?.id || "");
        };

        rafId = requestAnimationFrame(extractHeadings);
        return () => cancelAnimationFrame(rafId);
    }, [docData?.content, docData?.blocks]);

    // ================= INTERSECTION OBSERVER FOR ACTIVE TOC =================
    useEffect(() => {
        if (!headings.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible[0]?.target?.id) {
                    setActiveHeadingId(visible[0].target.id);
                }
            },
            {
                rootMargin: "-90px 0px -70% 0px",
                threshold: 0.1,
            }
        );

        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    // ================= RELATED DOCS =================
    useEffect(() => {
        if (!docData?.category) return;

        const fetchRelatedDocs = async () => {
            try {
                const response = await fetch(
                    `/api/documents/user-documents?category=${encodeURIComponent(
                        docData.category
                    )}`
                );
                if (response.ok) {
                    const data = await response.json();
                    const filtered = (data.documents || [])
                        .filter((doc) => doc.slug !== slug)
                        .slice(0, 10);
                    setRelatedDocs(filtered);
                }
            } catch (err) {
                console.error("Error fetching related docs:", err);
            }
        };

        fetchRelatedDocs();
    }, [docData?.category, slug]);

    // ================= UPVOTE STATE =================
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

    // ================= ACTIONS =================
    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (!element) return;

        const offset = 120;
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });

        setActiveHeadingId(id);
        element.classList.add("active-heading");
        setTimeout(() => element.classList.remove("active-heading"), 1200);
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId: slug, userEmail }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsUpvoted(data.isUpvoted);

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
                headers: { "Content-Type": "application/json" },
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
                const err = await response.json();
                showNotification(err.error || "Error submitting report", "error");
            }
        } catch (err) {
            console.error("Error reporting doc:", err);
            showNotification("Failed to submit report. Please try again.", "error");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    // ================= RENDER BLOCKS =================
    const renderBlock = (block, index) => {
        if (!block) return null;

        switch (block.type) {
            case "paragraph":
                return (
                    <p
                        key={block.id || index}
                        dangerouslySetInnerHTML={{ __html: block.content || "" }}
                    />
                );

            case "heading1":
            case "heading2":
            case "heading3": {
                const level = Number(block.type.replace("heading", ""));
                const text = getTextFromHTML(block.content);
                const headingId = generateHeadingId(text, index);
                const Tag = `h${level}`;

                return (
                    <Tag
                        key={block.id || index}
                        id={headingId}
                        dangerouslySetInnerHTML={{ __html: block.content || "" }}
                    />
                );
            }

            case "quote":
                return (
                    <blockquote
                        key={block.id || index}
                        dangerouslySetInnerHTML={{ __html: block.content || "" }}
                    />
                );

            case "bulletList":
                return (
                    <ul key={block.id || index}>
                        {(block.content || "")
                            .split("\n")
                            .filter((item) => item.trim() !== "")
                            .map((item, i) => (
                                <li key={i}>{item.trim()}</li>
                            ))}
                    </ul>
                );

            case "numberedList":
                return (
                    <ol key={block.id || index}>
                        {(block.content || "")
                            .split("\n")
                            .filter((item) => item.trim() !== "")
                            .map((item, i) => (
                                <li key={i}>{item.trim()}</li>
                            ))}
                    </ol>
                );

            case "image":
                return (
                    <div key={block.id || index} className="doc-media-wrap">
                        <img src={block.content} alt="Document media" />
                    </div>
                );

            case "video": {
                const url = block.content || "";
                const embedUrl = getVideoEmbedUrl(url);
                const isEmbed =
                    embedUrl.includes("youtube.com/embed/") ||
                    embedUrl.includes("player.vimeo.com/video/");

                return (
                    <div key={block.id || index} className="doc-media-wrap">
                        {isEmbed ? (
                            <iframe
                                src={embedUrl}
                                width="100%"
                                height="420"
                                frameBorder="0"
                                allowFullScreen
                                title={`Video-${index}`}
                            />
                        ) : (
                            <video controls src={url} />
                        )}
                    </div>
                );
            }

            case "code": {
                const parsed = parseCodeBlockContent(block.content);
                return (
                    <div key={block.id || index} className="doc-code-wrap">
                        <CodeBlock inline={false} className={`language-${parsed.language}`}>
                            {parsed.code}
                        </CodeBlock>
                    </div>
                );
            }

            case "divider":
                return <hr key={block.id || index} className="doc-divider" />;

            default:
                return null;
        }
    };

    // ================= UI STATES =================
    if (isLoading) {
        return (
            <main className="doc-view" data-theme={isDark ? "dark" : "light"}>
                <Header />
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
                <Header />
                <div className="error-container">
                    <h2>Document Not Found</h2>
                    <p>{error || "The document you're looking for doesn't exist."}</p>
                    <Link href="/learning" className="btn btn-primary">
                        ← Back to Learning
                    </Link>
                </div>
            </main>
        );
    }

    const formattedDate = new Date(docData.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const shouldShowDescription = Boolean(docData.description) && !hasBlocks;

    return (
        <main className="doc-view" data-theme={isDark ? "dark" : "light"}>
            <Header />

            <div className="doc-container-three-col">
                {/* Left Sidebar - Related Topics */}
                <aside className="left-sidebar">
                    <section className="sidebar-card">
                        <h3>Related Topics</h3>
                        {relatedDocs.length > 0 ? (
                            <ul className="related-docs-list">
                                {relatedDocs.map((doc) => (
                                    <li key={doc._id} className="related-doc-item">
                                        <Link href={`/doc/${doc.slug}`} className="related-doc-link">
                                            <h4>{doc.title}</h4>
                                            <span
                                                className="difficulty-badge"
                                                style={{
                                                    background:
                                                        doc.difficulty === "Beginner"
                                                            ? "rgba(34, 197, 94, 0.15)"
                                                            : doc.difficulty === "Intermediate"
                                                                ? "rgba(59, 130, 246, 0.15)"
                                                                : "rgba(239, 68, 68, 0.15)",
                                                    color:
                                                        doc.difficulty === "Beginner"
                                                            ? "#22c55e"
                                                            : doc.difficulty === "Intermediate"
                                                                ? "#3b82f6"
                                                                : "#ef4444",
                                                    fontSize: "0.7rem",
                                                    padding: "2px 8px",
                                                    borderRadius: "4px",
                                                    display: "inline-block",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {doc.difficulty}
                                            </span>
                                        </Link>
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
                                <span
                                    className={`difficulty-badge difficulty-${docData.difficulty
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                >
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
                                    <span>
                                        <FaRegEye />
                                    </span>
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

                    {shouldShowDescription && (
                        <div className="doc-description">{docData.description}</div>
                    )}

                    <div className="doc-content markdown-body" ref={contentRef}>
                        {hasBlocks ? (
                            docData.blocks.map((block, idx) => renderBlock(block, idx))
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ children }) => {
                                        const text = stringifyChildren(children);
                                        const id = generateHeadingId(text, 0);
                                        return <h1 id={id}>{children}</h1>;
                                    },
                                    h2: ({ children }) => {
                                        const text = stringifyChildren(children);
                                        const id = generateHeadingId(text, 1);
                                        return <h2 id={id}>{children}</h2>;
                                    },
                                    h3: ({ children }) => {
                                        const text = stringifyChildren(children);
                                        const id = generateHeadingId(text, 2);
                                        return <h3 id={id}>{children}</h3>;
                                    },
                                    h4: ({ children }) => {
                                        const text = stringifyChildren(children);
                                        const id = generateHeadingId(text, 3);
                                        return <h4 id={id}>{children}</h4>;
                                    },
                                    h5: ({ children }) => {
                                        const text = stringifyChildren(children);
                                        const id = generateHeadingId(text, 4);
                                        return <h5 id={id}>{children}</h5>;
                                    },
                                    h6: ({ children }) => {
                                        const text = stringifyChildren(children);
                                        const id = generateHeadingId(text, 5);
                                        return <h6 id={id}>{children}</h6>;
                                    },
                                    code: CodeBlock,
                                }}
                            >
                                {docData.content || "No content yet."}
                            </ReactMarkdown>
                        )}
                    </div>

                    <footer className="doc-footer">
                        <div className="footer-info">
                            <span className="view-count">
                                <FaRegEye /> {docData.views || 0} views
                            </span>
                        </div>
                        <div className="footer-actions">
                            <Link href="/learning" className="back-link">
                                ← Back to Learning
                            </Link>
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
                                            className={`toc-link ${activeHeadingId === heading.id ? "active" : ""
                                                }`}
                                            onClick={() => scrollToHeading(heading.id)}
                                            title={heading.text}
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
                                <strong>{new Date(docData.createdAt).toLocaleDateString()}</strong>
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
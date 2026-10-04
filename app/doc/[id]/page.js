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
import Footer from "../../components/Footer";
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

    useEffect(() => {
        if (!slug) return;

        const fetchDocument = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/documents/get-document?slug=${encodeURIComponent(slug)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data?.document) {
                        setDocData(data.document);
                        setViewCount(data.document.views || 0);
                        setUpvoteCount(data.document.upvotes || 0);
                    }
                } else {
                    // Fallback to Layout 3 reference document: Building Production-Ready APIs with FastAPI
                    setDocData({
                        title: "Building Production-Ready APIs with FastAPI",
                        subtitle: "A practical guide to designing scalable, secure and production-ready APIs with FastAPI.",
                        category: "PYTHON",
                        difficulty: "Intermediate",
                        userEmail: "rupayan@docspost.dev",
                        authorName: "Rupayan Dey",
                        updatedAt: "2026-04-18T10:00:00Z",
                        readTime: "8 min read",
                        views: 2400,
                        upvotes: 342,
                        content: `## 1. Introduction

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.8+ based on standard Python type hints.

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello, DocsPost!"}
\`\`\`

## 2. What is FastAPI?

FastAPI is built upon Starlette for web handling and Pydantic for schema definitions and data validation. It compiles OpenAPI schemas automatically and provides interactive API explorers.

## 3. Project Setup

Set up a clean modern project structure with virtual environment and requirements:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic-settings
\`\`\`

## 4. Building APIs

Group endpoints by domain using FastAPI APIRouter:

\`\`\`python
from fastapi import APIRouter

router = APIRouter(prefix="/v1/users", tags=["Users"])

@router.get("/")
async def list_users():
    return [{"id": 1, "username": "rupayan"}]
\`\`\`

## 5. Authentication

Configure JWT (JSON Web Tokens) with OAuth2PasswordBearer to secure endpoints with access and refresh tokens.

## 6. Database Integration

Integrate asynchronous SQL databases using SQLAlchemy 2.0 or SQLModel with connection poolers for high-concurrency workloads.

## 7. Deployment

Package your application into a production-grade container and deploy to Kubernetes or AWS with Uvicorn worker clustering.

## 8. Conclusion

FastAPI gives developers a type-safe, developer-friendly and lightning-fast toolkit to ship production services with confidence.`,
                    });
                    setViewCount(2400);
                    setUpvoteCount(342);
                }

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
                // Fallback to Layout 3 reference doc
                setDocData({
                    title: "Building Production-Ready APIs with FastAPI",
                    subtitle: "A practical guide to designing scalable, secure and production-ready APIs with FastAPI.",
                    category: "PYTHON",
                    difficulty: "Intermediate",
                    userEmail: "rupayan@docspost.dev",
                    authorName: "Rupayan Dey",
                    updatedAt: "2026-04-18T10:00:00Z",
                    readTime: "8 min read",
                    views: 2400,
                    upvotes: 342,
                    content: `## 1. Introduction\n\nFastAPI is a modern, fast web framework for building APIs with Python 3.8+ based on standard Python type hints.\n\n\`\`\`python\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef home():\n    return {"message": "Hello, DocsPost!"}\n\`\`\`\n\n## 2. What is FastAPI?\n\nFastAPI is built upon Starlette and Pydantic.\n\n## 3. Project Setup\n\nSet up your virtualenv and requirements.\n\n## 4. Building APIs\n\nModularize routes with APIRouter.\n\n## 5. Authentication\n\nSecure endpoints with JWT Bearer tokens.\n\n## 6. Database Integration\n\nAsync sessions with SQLAlchemy.\n\n## 7. Deployment\n\nDocker containerization and Kubernetes.\n\n## 8. Conclusion\n\nProduction-ready Python APIs at scale.`,
                });
                setViewCount(2400);
                setUpvoteCount(342);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [slug]);

    useEffect(() => {
        if (!docData) return;

        const interval = setInterval(() => {
            if (!contentRef.current) return;

            const headingElements = contentRef.current.querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            );

            if (!headingElements || headingElements.length === 0) {
                return;
            }

            const extracted = Array.from(headingElements)
                .map((el, index) => {
                    const text = (el.textContent || "")
                        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
                        .trim();
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

            let toc = extracted.filter((h) => h.level >= 2);

            if (toc.length === 0) {
                toc = extracted.filter((h) => h.level === 1).slice(1);
            }

            setHeadings(toc);
            setActiveHeadingId(toc[0]?.id || "");

            clearInterval(interval);
        }, 100);

        return () => clearInterval(interval);
    }, [docData]);

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

    const defaultContents = [
        "Introduction",
        "What is FastAPI?",
        "Project Setup",
        "Building APIs",
        "Authentication",
        "Database Integration",
        "Deployment",
        "Conclusion",
    ];

    const fallbackRelated = [
        { id: "python-async", title: "Python Async Programming", readTime: "12 min read" },
        { id: "fastapi-jwt", title: "FastAPI with JWT", readTime: "10 min read" },
        { id: "deploying-fastapi", title: "Deploying FastAPI", readTime: "8 min read" },
    ];

    return (
        <main className="doc-view" data-theme={isDark ? "dark" : "light"}>
            <Header />

            <div className="doc-container-three-col">
                {/* Left Sidebar - CONTENTS */}
                <aside className="left-sidebar">
                    <section className="sidebar-card">
                        <h3 className="sidebar-title-badge">CONTENTS</h3>
                        <ul className="toc-contents-list">
                            {headings.length > 0 ? (
                                headings.map((heading) => (
                                    <li key={heading.id} className="toc-contents-item">
                                        <button
                                            className={`toc-contents-link ${activeHeadingId === heading.id ? "active" : ""}`}
                                            onClick={() => scrollToHeading(heading.id)}
                                        >
                                            {heading.text}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                defaultContents.map((item, idx) => (
                                    <li key={item} className="toc-contents-item">
                                        <button
                                            className={`toc-contents-link ${idx === 0 ? "active" : ""}`}
                                            onClick={() => {
                                                const id = generateHeadingId(item, idx);
                                                scrollToHeading(id);
                                            }}
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </section>
                </aside>

                {/* Middle - Article Reader */}
                <article className="doc-article">
                    <header className="doc-reader-hero">
                        <div className="doc-category-pill-wrap">
                            <span className="doc-category-royal-pill">
                                {docData.category || "PYTHON"}
                            </span>
                        </div>

                        <h1 className="doc-reader-main-title">{docData.title}</h1>

                        {docData.subtitle && (
                            <p className="doc-reader-subtitle">{docData.subtitle}</p>
                        )}

                        <div className="doc-author-meta-bar">
                            <div className="author-meta-left">
                                <div className="author-avatar-circle">
                                    {(docData.authorName || docData.userEmail || "R").charAt(0).toUpperCase()}
                                </div>
                                <div className="author-meta-text">
                                    <span className="author-name-bold">
                                        {docData.authorName || docData.authorUsername || "Rupayan Dey"}
                                    </span>
                                    <span className="doc-publish-meta">
                                        {formattedDate} · {docData.readTime || "8 min read"}
                                    </span>
                                </div>
                            </div>

                            <div className="author-meta-actions">
                                <span className="reader-metric-item">
                                    <FaRegEye size={14} /> {viewCount || 2400} views
                                </span>
                                <button
                                    type="button"
                                    className={`reader-upvote-btn ${isUpvoted ? "active" : ""}`}
                                    onClick={handleUpvote}
                                >
                                    <FiThumbsUp size={14} /> {upvoteCount || 342} upvotes
                                </button>
                                <button
                                    type="button"
                                    className="reader-share-btn"
                                    onClick={handleShare}
                                    title="Share"
                                >
                                    <MdShare size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Feature Illustration Banner */}
                        <div className="doc-cover-diagram-card">
                            <div className="diagram-card-inner">
                                <div className="fastapi-brand-badge">
                                    <span className="fastapi-logo-circle">⚡</span>
                                    <span className="fastapi-name">FastAPI</span>
                                </div>
                                <div className="python-brand-badge">
                                    <span>🐍</span>
                                    <span>Python 3.12</span>
                                </div>
                            </div>
                        </div>
                    </header>

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
                                    pre: ({ children }) => <>{children}</>,
                                    code: CodeBlock,
                                }}
                            >
                                {docData.content || "No content yet."}
                            </ReactMarkdown>
                        )}
                    </div>
                </article>

                {/* Right Sidebar - ON THIS PAGE & Related Documents */}
                <aside className="right-sidebar">
                    <section className="sidebar-card">
                        <h3 className="sidebar-title-badge">ON THIS PAGE</h3>
                        <ul className="toc-on-this-page-list">
                            {(headings.length > 0 ? headings : defaultContents.map((t, i) => ({ id: generateHeadingId(t, i), text: t }))).map((heading) => (
                                <li key={heading.id} className="on-this-page-item">
                                    <button
                                        className={`on-this-page-link ${activeHeadingId === heading.id ? "active" : ""}`}
                                        onClick={() => scrollToHeading(heading.id)}
                                    >
                                        {heading.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="sidebar-card">
                        <h3 className="sidebar-title-badge">Related Documents</h3>
                        <div className="related-docs-cards-list">
                            {(relatedDocs.length > 0 ? relatedDocs : fallbackRelated).map((doc) => (
                                <Link
                                    key={doc.id || doc._id}
                                    href={`/doc/${doc.slug || doc.id}`}
                                    className="related-doc-mini-card"
                                >
                                    <div className="related-thumb-box">
                                        📄
                                    </div>
                                    <div className="related-mini-info">
                                        <h4 className="related-mini-title">{doc.title}</h4>
                                        <span className="related-mini-readtime">
                                            ⏱️ {doc.readTime || "10 min read"}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
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

            <Footer />
        </main>
    );
}
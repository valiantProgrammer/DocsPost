"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
    FiEye,
    FiEdit2,
    FiMoreVertical,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiCopy,
    FiShare2,
    FiMoon,
    FiSun,
    FiSliders,
    FiCode,
    FiLayers,
    FiCpu,
    FiBox,
    FiZap,
    FiGitBranch,
    FiFileText,
    FiClock,
    FiBookmark,
    FiCheckCircle,
    FiFolder,
    FiRotateCcw,
    FiUsers,
    FiCheck,
    FiAlertCircle,
    FiSend
} from "react-icons/fi";
import "./UserWorkspace.css";

const REFERENCE_SAMPLE_DOCS = [
    {
        _id: "ref-sample-1",
        slug: "python-async-programming",
        title: "Python Async Programming",
        category: "Python",
        status: "Draft",
        words: "1,240 words",
        relativeTime: "Edited 2m ago",
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        isBookmarked: true,
        isRecent: true,
        isShared: false,
        isTrash: false,
    },
    {
        _id: "ref-sample-2",
        slug: "system-design-notes",
        title: "System Design Notes",
        category: "System Design",
        status: "Published",
        words: "2,150 words",
        relativeTime: "Edited 1h ago",
        updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: true,
        isShared: true,
        sharedWith: [{ name: "Alex Chen", role: "Editor", avatar: "A" }],
        isTrash: false,
    },
    {
        _id: "ref-sample-3",
        slug: "ml-deployment-guide",
        title: "ML Deployment Guide",
        category: "Machine Learning",
        status: "Draft",
        words: "1,890 words",
        relativeTime: "Edited yesterday",
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        isBookmarked: true,
        isRecent: true,
        isShared: false,
        isTrash: false,
    },
    {
        _id: "ref-sample-4",
        slug: "docker-complete-guide",
        title: "Docker Complete Guide",
        category: "DevOps",
        status: "Published",
        words: "3,400 words",
        relativeTime: "Edited 2 days ago",
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: true,
        isShared: true,
        sharedWith: [
            { name: "Dev Team", role: "Editor", avatar: "D" },
            { name: "Sarah K.", role: "Viewer", avatar: "S" }
        ],
        isTrash: false,
    },
    {
        _id: "ref-sample-5",
        slug: "react-hooks-in-depth",
        title: "React Hooks in Depth",
        category: "JavaScript",
        status: "Published",
        words: "1,620 words",
        relativeTime: "Edited 3 days ago",
        updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: true,
        isRecent: true,
        isShared: false,
        isTrash: false,
    },
    {
        _id: "ref-sample-6",
        slug: "postgresql-query-optimization",
        title: "PostgreSQL Query Optimization & Indexing",
        category: "Databases",
        status: "Published",
        words: "2,400 words",
        relativeTime: "Edited 4 days ago",
        updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: true,
        isShared: false,
        isTrash: false,
    },
    {
        _id: "ref-sample-7",
        slug: "kubernetes-production-architecture",
        title: "Kubernetes Production Architecture",
        category: "DevOps",
        status: "Draft",
        words: "1,950 words",
        relativeTime: "Edited 5 days ago",
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: true,
        isShared: true,
        sharedWith: [{ name: "Infra Lead", role: "Editor", avatar: "I" }],
        isTrash: false,
    },
    {
        _id: "ref-sample-8",
        slug: "typescript-advanced-generics",
        title: "TypeScript Advanced Generics & Patterns",
        category: "TypeScript",
        status: "Published",
        words: "1,800 words",
        relativeTime: "Edited 6 days ago",
        updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: true,
        isRecent: true,
        isShared: false,
        isTrash: false,
    },
    {
        _id: "ref-sample-9",
        slug: "graphql-federation-at-scale",
        title: "GraphQL Federation at Scale",
        category: "Architecture",
        status: "Draft",
        words: "2,100 words",
        relativeTime: "Edited 1 week ago",
        updatedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: true,
        sharedWith: [{ name: "Core Team", role: "Editor", avatar: "C" }],
        isTrash: false,
    },
    {
        _id: "ref-sample-10",
        slug: "building-microservices-with-go",
        title: "Building High-Throughput Microservices with Go",
        category: "Go",
        status: "Published",
        words: "3,100 words",
        relativeTime: "Edited 1 week ago",
        updatedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: false,
        isTrash: false,
    },
    {
        _id: "ref-sample-11",
        slug: "redis-caching-design-patterns",
        title: "Redis Caching Strategies & Write-Back Patterns",
        category: "Databases",
        status: "Published",
        words: "1,750 words",
        relativeTime: "Edited 2 weeks ago",
        updatedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: true,
        sharedWith: [{ name: "Backend Group", role: "Viewer", avatar: "B" }],
        isTrash: false,
    },
    {
        _id: "ref-sample-12",
        slug: "oauth2-openid-connect-flow",
        title: "OAuth2 & OpenID Connect Deep Dive",
        category: "Security",
        status: "Draft",
        words: "2,600 words",
        relativeTime: "Edited 2 weeks ago",
        updatedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: false,
        isTrash: false,
    },
    // Trashed reference documents
    {
        _id: "ref-trash-1",
        slug: "legacy-rest-api-v1-notes",
        title: "Legacy REST API v1 Architecture Notes",
        category: "Architecture",
        status: "Draft",
        words: "940 words",
        relativeTime: "Deleted 2 days ago",
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: false,
        isTrash: true,
        purgeDays: 28,
    },
    {
        _id: "ref-trash-2",
        slug: "old-redux-saga-boilerplate",
        title: "Old Redux Saga Implementation & Patterns",
        category: "JavaScript",
        status: "Draft",
        words: "1,120 words",
        relativeTime: "Deleted 5 days ago",
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: false,
        isTrash: true,
        purgeDays: 25,
    },
    {
        _id: "ref-trash-3",
        slug: "deprecated-mongo-migration-scripts",
        title: "Deprecated MongoDB 4.0 Migration Scripts",
        category: "Databases",
        status: "Published",
        words: "780 words",
        relativeTime: "Deleted 1 week ago",
        updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        isBookmarked: false,
        isRecent: false,
        isShared: false,
        isTrash: true,
        purgeDays: 23,
    }
];

function getDocBadge(category, title, index) {
    const cat = (category || "").toLowerCase();
    const t = (title || "").toLowerCase();

    if (cat.includes("python") || t.includes("python")) {
        return {
            bg: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            icon: <FiCode size={22} />
        };
    }
    if (cat.includes("system") || t.includes("system") || cat.includes("architecture")) {
        return {
            bg: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
            icon: <FiLayers size={22} />
        };
    }
    if (cat.includes("ml") || cat.includes("machine") || cat.includes("ai") || t.includes("deployment")) {
        return {
            bg: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
            icon: <FiCpu size={22} />
        };
    }
    if (cat.includes("devops") || cat.includes("docker") || t.includes("docker") || cat.includes("cloud")) {
        return {
            bg: "linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)",
            icon: <FiBox size={22} />
        };
    }
    if (cat.includes("javascript") || cat.includes("react") || t.includes("react") || cat.includes("frontend")) {
        return {
            bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            icon: <FiZap size={22} />
        };
    }
    if (cat.includes("dsa") || t.includes("tree") || t.includes("list")) {
        return {
            bg: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
            icon: <FiGitBranch size={22} />
        };
    }

    const fallbacks = [
        { bg: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)", icon: <FiFileText size={22} /> },
        { bg: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)", icon: <FiLayers size={22} /> },
        { bg: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)", icon: <FiCpu size={22} /> },
        { bg: "linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)", icon: <FiBox size={22} /> },
        { bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)", icon: <FiZap size={22} /> },
    ];
    return fallbacks[index % fallbacks.length];
}

function formatRelativeTime(dateValue, sampleRelativeTime) {
    if (sampleRelativeTime) return sampleRelativeTime;
    if (!dateValue) return "Edited recently";
    const diff = Date.now() - new Date(dateValue).getTime();
    if (isNaN(diff) || diff < 0) return "Edited recently";
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "Edited 2m ago";
    if (minutes < 60) return `Edited ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Edited ${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Edited yesterday";
    if (days < 30) return `Edited ${days} days ago`;
    return new Date(dateValue).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

export default function UserWorkspace({
    userEmail,
    initialTab = "all",
    pageTitle,
    pageDescription
}) {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState(initialTab.toLowerCase());
    const [menuOpenFor, setMenuOpenFor] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const effectiveEmail =
        userEmail ||
        (typeof window !== "undefined"
            ? localStorage.getItem("docspost-email") || localStorage.getItem("userEmail") || ""
            : "") ||
        "rupayandey134@gmail.com";

    // Sync tab when prop changes
    useEffect(() => {
        if (initialTab && ["all", "recent", "drafts", "published", "bookmarked", "shared", "trash"].includes(initialTab.toLowerCase())) {
            setActiveTab(initialTab.toLowerCase());
        }
    }, [initialTab]);

    // Handle initial tab from URL query if present
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get("tab");
            if (tabParam && ["all", "recent", "drafts", "published", "bookmarked", "shared", "trash"].includes(tabParam.toLowerCase())) {
                setActiveTab(tabParam.toLowerCase());
            }
        }
    }, []);

    // Fetch real user documents from MongoDB backend
    const fetchUserDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/documents/user-documents?email=${encodeURIComponent(effectiveEmail)}`
            );

            let realDocs = [];
            if (response.ok) {
                const data = await response.json();
                if (data.documents && Array.isArray(data.documents)) {
                    realDocs = data.documents.map((doc) => {
                        const wordCount = doc.content
                            ? doc.content.trim().split(/\s+/).filter(Boolean).length
                            : 850;
                        return {
                            _id: doc._id,
                            slug: doc.slug || doc._id,
                            title: doc.title || "Untitled Document",
                            category: doc.category || "General",
                            status: doc.status || (doc.published ? "Published" : "Draft"),
                            words: `${wordCount.toLocaleString()} words`,
                            updatedAt: doc.updatedAt || doc.createdAt,
                            isBookmarked: Boolean(doc.isBookmarked),
                            isRecent: true,
                            isShared: Boolean(doc.isShared),
                            isTrash: Boolean(doc.isTrash),
                        };
                    });
                }
            }

            // Combine real documents with reference sample documents (avoiding duplicates)
            const combined = [...realDocs];
            const existingTitles = new Set(realDocs.map((d) => d.title.toLowerCase()));

            for (const sample of REFERENCE_SAMPLE_DOCS) {
                if (!existingTitles.has(sample.title.toLowerCase())) {
                    combined.push(sample);
                }
            }

            setDocuments(combined);
        } catch (error) {
            console.error("Error fetching user documents:", error);
            setDocuments(REFERENCE_SAMPLE_DOCS);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDocuments();
    }, [effectiveEmail]);

    // Calculate dynamic tab counts across all 7 views
    const tabCounts = useMemo(() => {
        const activeDocs = documents.filter((d) => !d.isTrash);
        const trashDocs = documents.filter((d) => d.isTrash);
        const sharedDocs = activeDocs.filter((d) => d.isShared);
        const recentDocs = activeDocs.filter((d) => d.isRecent);
        const draftDocs = activeDocs.filter(
            (d) => (d.status || "").toLowerCase() === "draft"
        );
        const publishedDocs = activeDocs.filter(
            (d) => (d.status || "").toLowerCase() === "published"
        );
        const bookmarkedDocs = activeDocs.filter((d) => d.isBookmarked);

        return {
            all: activeDocs.length,
            recent: recentDocs.length,
            drafts: draftDocs.length,
            published: publishedDocs.length,
            bookmarked: bookmarkedDocs.length,
            shared: sharedDocs.length,
            trash: trashDocs.length,
        };
    }, [documents]);

    // Filter documents by active tab and search query
    const filteredDocuments = useMemo(() => {
        const lowerQuery = query.toLowerCase().trim();

        return documents.filter((doc) => {
            // Trash view ONLY shows items in trash
            if (activeTab === "trash") {
                if (!doc.isTrash) return false;
            } else {
                // All other views ONLY show non-trash items
                if (doc.isTrash) return false;

                if (activeTab === "recent" && !doc.isRecent) return false;
                if (activeTab === "drafts" && (doc.status || "").toLowerCase() !== "draft") return false;
                if (activeTab === "published" && (doc.status || "").toLowerCase() !== "published") return false;
                if (activeTab === "bookmarked" && !doc.isBookmarked) return false;
                if (activeTab === "shared" && !doc.isShared) return false;
            }

            // Search filter
            if (lowerQuery) {
                const matchTitle = doc.title?.toLowerCase().includes(lowerQuery);
                const matchCategory = doc.category?.toLowerCase().includes(lowerQuery);
                const matchStatus = doc.status?.toLowerCase().includes(lowerQuery);
                if (!matchTitle && !matchCategory && !matchStatus) return false;
            }

            return true;
        });
    }, [documents, activeTab, query]);

    // Actions
    const handleMoveToTrash = async (docId) => {
        setDocuments((prev) =>
            prev.map((d) => (d._id === docId ? { ...d, isTrash: true, relativeTime: "Deleted just now" } : d))
        );
        setMenuOpenFor("");
        showToast("Document moved to Trash");
    };

    const handleRestore = (docId) => {
        setDocuments((prev) =>
            prev.map((d) => (d._id === docId ? { ...d, isTrash: false, relativeTime: "Restored just now" } : d))
        );
        showToast("Document restored to Workspace");
    };

    const handlePermanentDelete = async (docId) => {
        if (!confirm("Are you sure you want to permanently delete this document? This cannot be undone.")) return;

        try {
            await fetch("/api/documents/delete-document", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId }),
            });
        } catch (error) {
            console.error("Permanent delete error:", error);
        }
        setDocuments((prev) => prev.filter((d) => d._id !== docId));
        setMenuOpenFor("");
        showToast("Document permanently deleted");
    };

    const handleEmptyTrash = async () => {
        if (!confirm("Are you sure you want to permanently clear all items from Trash?")) return;
        setDocuments((prev) => prev.filter((d) => !d.isTrash));
        showToast("Trash has been emptied");
    };

    const handleToggleBookmark = (docId, e) => {
        if (e) e.stopPropagation();
        setDocuments((prev) =>
            prev.map((d) => {
                if (d._id === docId) {
                    const nextVal = !d.isBookmarked;
                    showToast(nextVal ? "Added to Bookmarks" : "Removed from Bookmarks");
                    return { ...d, isBookmarked: nextVal };
                }
                return d;
            })
        );
    };

    const handleDuplicate = async (doc) => {
        const newDoc = {
            ...doc,
            _id: `dup-${Date.now()}`,
            title: `${doc.title} (Copy)`,
            status: "Draft",
            relativeTime: "Edited just now",
            updatedAt: new Date().toISOString(),
            isTrash: false
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setMenuOpenFor("");
        showToast("Document duplicated to Drafts");
    };

    const handleShare = async (doc) => {
        const link = `${window.location.origin}/doc/${doc.slug || doc._id}`;
        try {
            await navigator.clipboard.writeText(link);
            showToast("Share link copied to clipboard");
        } catch {
            prompt("Copy share link:", link);
        } finally {
            setMenuOpenFor("");
        }
    };

    const handlePublishDraft = (docId, e) => {
        if (e) e.stopPropagation();
        setDocuments((prev) =>
            prev.map((d) => (d._id === docId ? { ...d, status: "Published", relativeTime: "Published just now" } : d))
        );
        showToast("Document published successfully!");
    };

    const handleTabClick = (tabKey) => {
        setActiveTab(tabKey);
        if (typeof window !== "undefined") {
            const newPath = tabKey === "all" ? "/workspace" : `/workspace/${tabKey}`;
            window.history.pushState(null, "", newPath);
        }
    };

    // Header info mapping
    const getHeadingInfo = () => {
        if (pageTitle) {
            return {
                title: pageTitle,
                description: pageDescription || "Manage and organize your documentation."
            };
        }
        switch (activeTab) {
            case "recent":
                return {
                    title: "Recent Documents",
                    description: "Pick up right where you left off. Documents sorted by recent activity."
                };
            case "drafts":
                return {
                    title: "Draft Documents",
                    description: "Work in progress documents ready to be edited, finalized, and published."
                };
            case "published":
                return {
                    title: "Published Articles",
                    description: "Live technical articles visible to your readers with metrics and sharing."
                };
            case "bookmarked":
                return {
                    title: "Bookmarked Documents",
                    description: "Quick access to your curated guides, references, and saved tutorials."
                };
            case "shared":
                return {
                    title: "Shared Documents",
                    description: "Documents shared with you or your team members with active permissions."
                };
            case "trash":
                return {
                    title: "Trash",
                    description: "Deleted documents. Items will be automatically purged after 30 days."
                };
            case "all":
            default:
                return {
                    title: "Workspace",
                    description: "Manage, edit, and organize all your documentation in one place."
                };
        }
    };

    const heading = getHeadingInfo();

    return (
        <div className="workspace-main-container">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="workspace-floating-toast">
                    <FiCheck size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Workspace Header */}
            <div className="workspace-top-header">
                <div>
                    <h1 className="workspace-title">{heading.title}</h1>
                    <p className="workspace-subtitle-desc">{heading.description}</p>
                </div>

                <div className="workspace-header-actions">
                    <button
                        className="workspace-top-btn"
                        title="Filter Options"
                        onClick={() => {}}
                    >
                        <FiSliders size={17} />
                    </button>
                    <button
                        className="workspace-top-btn"
                        onClick={toggleTheme}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
                    </button>
                </div>
            </div>

            {/* Search Input & + New Document Action Bar */}
            <div className="workspace-search-action-bar">
                <div className="workspace-search-input-wrap">
                    <FiSearch className="workspace-search-icon" size={17} />
                    <input
                        type="text"
                        className="workspace-search-input"
                        placeholder={`Search in ${heading.title.toLowerCase()}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {activeTab === "trash" ? (
                    filteredDocuments.length > 0 && (
                        <button
                            className="workspace-empty-trash-btn"
                            onClick={handleEmptyTrash}
                        >
                            <FiTrash2 size={16} />
                            Empty Trash
                        </button>
                    )
                ) : (
                    <button
                        className="workspace-new-doc-btn"
                        onClick={() => router.push("/workspace/new")}
                    >
                        <FiPlus size={18} />
                        New Document
                    </button>
                )}
            </div>

            {/* Filter Tabs Bar: All 7 Views matching user reference */}
            <div className="workspace-filter-tabs">
                <button
                    className={`workspace-filter-tab ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => handleTabClick("all")}
                >
                    All ({tabCounts.all})
                </button>
                <button
                    className={`workspace-filter-tab ${activeTab === "recent" ? "active" : ""}`}
                    onClick={() => handleTabClick("recent")}
                >
                    Recent ({tabCounts.recent})
                </button>
                <button
                    className={`workspace-filter-tab ${activeTab === "drafts" ? "active" : ""}`}
                    onClick={() => handleTabClick("drafts")}
                >
                    Drafts ({tabCounts.drafts})
                </button>
                <button
                    className={`workspace-filter-tab ${activeTab === "published" ? "active" : ""}`}
                    onClick={() => handleTabClick("published")}
                >
                    Published ({tabCounts.published})
                </button>
                <button
                    className={`workspace-filter-tab ${activeTab === "bookmarked" ? "active" : ""}`}
                    onClick={() => handleTabClick("bookmarked")}
                >
                    Bookmarked ({tabCounts.bookmarked})
                </button>
                <button
                    className={`workspace-filter-tab ${activeTab === "shared" ? "active" : ""}`}
                    onClick={() => handleTabClick("shared")}
                >
                    Shared ({tabCounts.shared})
                </button>
                <button
                    className={`workspace-filter-tab ${activeTab === "trash" ? "active" : ""}`}
                    onClick={() => handleTabClick("trash")}
                >
                    Trash ({tabCounts.trash})
                </button>
            </div>

            {/* Trash Advisory Banner */}
            {activeTab === "trash" && (
                <div className="workspace-trash-alert-banner">
                    <div className="trash-alert-content">
                        <FiAlertCircle className="trash-alert-icon" size={19} />
                        <span>Items in the Trash will be permanently deleted automatically after 30 days.</span>
                    </div>
                </div>
            )}

            {/* Document Rows List matching user reference image */}
            <div className="workspace-doc-rows-list">
                {isLoading ? (
                    <div className="workspace-loading-state">
                        <div className="workspace-spinner"></div>
                        <p>Loading documents...</p>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="workspace-empty-state">
                        <FiFolder size={44} />
                        <h3>No documents found</h3>
                        <p>
                            {query
                                ? `No documents matching "${query}"`
                                : `No documents in ${heading.title.toLowerCase()} currently.`}
                        </p>
                    </div>
                ) : (
                    filteredDocuments.map((doc, index) => {
                        const badgeInfo = getDocBadge(doc.category, doc.title, index);
                        const isDraft = (doc.status || "").toLowerCase() === "draft";
                        const isTrashTab = activeTab === "trash";

                        return (
                            <div
                                key={doc._id || index}
                                className={`workspace-doc-row ${isTrashTab ? "trash-row" : ""}`}
                                onClick={() => {
                                    if (!isTrashTab) {
                                        router.push(`/doc/${doc.slug || doc._id}`);
                                    }
                                }}
                            >
                                {/* Left Icon Badge */}
                                <div
                                    className="doc-icon-badge"
                                    style={{ background: badgeInfo.bg }}
                                >
                                    {badgeInfo.icon}
                                </div>

                                {/* Middle Content */}
                                <div className="doc-row-content">
                                    <div className="doc-title-row">
                                        <h3 className="doc-row-title">{doc.title}</h3>
                                        {!isTrashTab && (
                                            <button
                                                className={`doc-inline-bookmark-btn ${doc.isBookmarked ? "active" : ""}`}
                                                onClick={(e) => handleToggleBookmark(doc._id, e)}
                                                title={doc.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                                aria-label="Bookmark"
                                            >
                                                <FiBookmark size={15} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="doc-row-meta">
                                        <span
                                            className={`status-indicator ${
                                                isDraft ? "draft" : "published"
                                            }`}
                                        >
                                            <span className="status-dot"></span>
                                            {isDraft ? "Draft" : "Published"}
                                        </span>
                                        <span className="meta-sep">•</span>
                                        <span className="doc-category-name">
                                            {doc.category || "General"}
                                        </span>
                                        {doc.words && (
                                            <>
                                                <span className="meta-sep">•</span>
                                                <span className="doc-word-count">
                                                    {doc.words}
                                                </span>
                                            </>
                                        )}

                                        {/* Shared collaborator tags */}
                                        {doc.isShared && doc.sharedWith && (
                                            <>
                                                <span className="meta-sep">•</span>
                                                <span className="doc-shared-tag">
                                                    <FiUsers size={12} />
                                                    <span>{doc.sharedWith.length} shared</span>
                                                </span>
                                            </>
                                        )}

                                        {/* Trash days countdown */}
                                        {doc.isTrash && (
                                            <>
                                                <span className="meta-sep">•</span>
                                                <span className="trash-countdown-tag">
                                                    Purges in {doc.purgeDays || 30} days
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div
                                    className="doc-row-right"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="doc-edited-time">
                                        {formatRelativeTime(doc.updatedAt, doc.relativeTime)}
                                    </span>

                                    {/* Action buttons depending on view */}
                                    {isTrashTab ? (
                                        <div className="trash-row-actions">
                                            <button
                                                className="btn-trash-restore"
                                                onClick={() => handleRestore(doc._id)}
                                                title="Restore document"
                                            >
                                                <FiRotateCcw size={14} />
                                                <span>Restore</span>
                                            </button>
                                            <button
                                                className="btn-trash-perm-delete"
                                                onClick={() => handlePermanentDelete(doc._id)}
                                                title="Delete permanently"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="active-row-actions">
                                            {isDraft && (
                                                <button
                                                    className="btn-quick-publish"
                                                    onClick={(e) => handlePublishDraft(doc._id, e)}
                                                    title="Publish now"
                                                >
                                                    <FiSend size={13} />
                                                    <span>Publish</span>
                                                </button>
                                            )}

                                            <div className="doc-menu-container">
                                                <button
                                                    className="doc-menu-trigger-btn"
                                                    onClick={() =>
                                                        setMenuOpenFor(
                                                            menuOpenFor === doc._id ? "" : doc._id
                                                        )
                                                    }
                                                    aria-label="More options"
                                                >
                                                    <FiMoreVertical size={18} />
                                                </button>

                                                {menuOpenFor === doc._id && (
                                                    <div className="doc-actions-dropdown">
                                                        <button
                                                            onClick={() => {
                                                                setMenuOpenFor("");
                                                                router.push(`/workspace/${doc._id}`);
                                                            }}
                                                        >
                                                            <FiEdit2 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setMenuOpenFor("");
                                                                router.push(`/doc/${doc.slug || doc._id}`);
                                                            }}
                                                        >
                                                            <FiEye size={14} /> View
                                                        </button>
                                                        <button onClick={() => handleDuplicate(doc)}>
                                                            <FiCopy size={14} /> Duplicate
                                                        </button>
                                                        <button onClick={() => handleShare(doc)}>
                                                            <FiShare2 size={14} /> Share Link
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleMoveToTrash(doc._id)}
                                                        >
                                                            <FiTrash2 size={14} /> Move to Trash
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

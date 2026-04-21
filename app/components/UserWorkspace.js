"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
    FiEye,
    FiEdit2,
    FiGrid,
    FiList,
    FiMoreVertical,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiCopy,
    FiShare2,
    FiChevronLeft,
    FiChevronRight,
    FiMoon,
    FiSun,
    FiFilter,
    FiDownload,
} from "react-icons/fi";
import "./UserWorkspace.css";

const PAGE_SIZE = 6;

export default function UserWorkspace({ userEmail }) {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("Recently Updated");
    const [view, setView] = useState("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [menuOpenFor, setMenuOpenFor] = useState("");

    const fetchUserDocuments = async () => {
        if (!userEmail) return;

        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/documents/user-documents?email=${encodeURIComponent(userEmail)}`
            );
            if (!response.ok) {
                throw new Error("Failed to load documents");
            }

            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            alert("Unable to load your documents right now.");
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUserDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userEmail]);

    const filteredDocuments = useMemo(() => {
        const lowerQuery = query.toLowerCase();

        const filtered = documents.filter((doc) => {
            const statusMatches =
                statusFilter === "All" ||
                (statusFilter === "Draft" && (doc.status || "Draft") === "Draft") ||
                (statusFilter === "Published" && (doc.status || "Draft") === "Published");

            const textMatches =
                doc.title?.toLowerCase().includes(lowerQuery) ||
                doc.tags?.join(" ")?.toLowerCase().includes(lowerQuery) ||
                doc.content?.toLowerCase().includes(lowerQuery);

            return statusMatches && (!lowerQuery || textMatches);
        });

        const sorted = [...filtered];
        if (sortBy === "Recently Updated") {
            sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else if (sortBy === "Oldest") {
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === "Most Viewed") {
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        return sorted;
    }, [documents, query, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));
    const pagedDocuments = filteredDocuments.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );


    const handleDelete = async (docId) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            const response = await fetch("/api/documents/delete-document", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId }),
            });

            if (!response.ok) throw new Error("Delete failed");

            setMenuOpenFor("");
            await fetchUserDocuments();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Could not delete document.");
        }
    };

    const handleDuplicate = async (doc) => {
        try {
            const response = await fetch("/api/documents/create-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail,
                    title: `${doc.title} (Copy)`,
                    description: doc.description,
                    content: doc.content,
                    category: doc.category,
                    status: "Draft",
                    visibility: doc.visibility || "Public",
                    tags: doc.tags || [],
                    featuredImage: doc.featuredImage || "",
                }),
            });

            if (!response.ok) throw new Error("Duplicate failed");

            setMenuOpenFor("");
            await fetchUserDocuments();
        } catch (error) {
            console.error("Duplicate error:", error);
            alert("Could not duplicate document.");
        }
    };

    const handleShare = async (doc) => {
        const link = `${window.location.origin}/doc/${doc.slug}`;

        try {
            await navigator.clipboard.writeText(link);
            alert("Share link copied to clipboard");
        } catch {
            alert(link);
        } finally {
            setMenuOpenFor("");
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";
        return new Date(dateValue).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="user-workspace-v2">
            {/* Header Section */}
            <div className="workspace-header-v2">
                <div className="header-content">
                    <h2>My Documents</h2>
                    <p>Create, manage, and publish your content from one place.</p>
                </div>
                <div className="header-actions">
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>
                    <button
                        className="workspace-primary-btn"
                        onClick={() => router.push("/workspace/new")}
                    >
                        <FiPlus size={18} />
                        New Document
                    </button>
                </div>
            </div>

            {/* Controls Section */}
            <div className="workspace-controls-section">
                <div className="workspace-controls">
                    <label className="workspace-search">
                        <FiSearch size={18} />
                        <input
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by title, tags, or content"
                        />
                    </label>

                    <div className="controls-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="filter-select"
                        >
                            <option>All</option>
                            <option>Draft</option>
                            <option>Published</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                            className="sort-select"
                        >
                            <option>Recently Updated</option>
                            <option>Oldest</option>
                            <option>Most Viewed</option>
                        </select>

                        <div className="view-toggle-group">
                            <button
                                className={view === "grid" ? "active" : ""}
                                onClick={() => setView("grid")}
                                title="Grid view"
                            >
                                <FiGrid />
                            </button>
                            <button
                                className={view === "list" ? "active" : ""}
                                onClick={() => setView("list")}
                                title="List view"
                            >
                                <FiList />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="results-info">
                    <span>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Documents Section */}
            <div className="workspace-documents-section">
                {isLoading ? (
                    <div className="workspace-loading">
                        <div className="spinner"></div>
                        <p>Loading your documents...</p>
                    </div>
                ) : pagedDocuments.length === 0 ? (
                    <div className="workspace-empty">
                        <FiPlus size={48} />
                        <h3>No documents found</h3>
                        <p>{query || statusFilter !== "All" ? "Try adjusting your filters." : "Create your first document to get started!"}</p>
                        <button className="workspace-primary-btn" onClick={() => router.push("/workspace/new")}>
                            <FiPlus size={16} /> Create Document
                        </button>
                    </div>
                ) : (
                    <div className={view === "grid" ? "documents-grid-v2" : "documents-list-v2"}>
                        {pagedDocuments.map((doc) => (
                            <article key={doc._id} className="workspace-doc-card">
                                {doc.featuredImage && (
                                    <div className="doc-featured-image">
                                        <img src={doc.featuredImage} alt={doc.title} />
                                    </div>
                                )}

                                <div className="workspace-doc-top">
                                    <div className="doc-title-section">
                                        <h3>{doc.title}</h3>
                                        <p>{doc.description || "No description"}</p>
                                    </div>
                                    <span className={`status-pill ${(doc.status || "Draft").toLowerCase()}`}>
                                        {doc.status || "Draft"}
                                    </span>
                                </div>

                                <div className="workspace-doc-meta">
                                    <span>📅 {formatDate(doc.updatedAt)}</span>
                                    <span>👁 {doc.views || 0}</span>
                                    {doc.category && <span>📂 {doc.category}</span>}
                                </div>

                                {doc.tags && doc.tags.length > 0 && (
                                    <div className="doc-tags">
                                        {doc.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="doc-tag">{tag}</span>
                                        ))}
                                        {doc.tags.length > 3 && <span className="doc-tag-more">+{doc.tags.length - 3}</span>}
                                    </div>
                                )}

                                <div className="workspace-doc-actions">
                                    <button
                                        onClick={() => router.push(`/workspace/${doc._id}`)}
                                        className="action-btn edit-btn"
                                        title="Edit document"
                                    >
                                        <FiEdit2 size={15} /> Edit
                                    </button>
                                    <button
                                        onClick={() => window.open(`/doc/${doc.slug}`, "_blank")}
                                        className="action-btn preview-btn"
                                        title="Preview document"
                                    >
                                        <FiEye size={15} /> Preview
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        className="action-btn delete-btn"
                                        title="Delete document"
                                    >
                                        <FiTrash2 size={15} />
                                    </button>
                                    <div className="more-wrapper">
                                        <button
                                            onClick={() => setMenuOpenFor(menuOpenFor === doc._id ? "" : doc._id)}
                                            className="action-btn more-btn"
                                            title="More options"
                                        >
                                            <FiMoreVertical size={15} />
                                        </button>
                                        {menuOpenFor === doc._id && (
                                            <div className="more-menu">
                                                <button
                                                    onClick={() => handleDuplicate(doc)}
                                                    className="more-menu-item"
                                                >
                                                    <FiCopy size={14} /> Duplicate
                                                </button>
                                                <button
                                                    onClick={() => handleShare(doc)}
                                                    className="more-menu-item"
                                                >
                                                    <FiShare2 size={14} /> Share
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="workspace-pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="pagination-btn"
                    >
                        <FiChevronLeft size={16} /> Previous
                    </button>
                    <div className="pagination-info">
                        <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="pagination-btn"
                    >
                        Next <FiChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

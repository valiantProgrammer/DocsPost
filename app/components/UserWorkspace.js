"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "react-icons/fi";
import "./UserWorkspace.css";

const PAGE_SIZE = 6;

export default function UserWorkspace({ userEmail }) {
    const router = useRouter();
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
            <div className="workspace-header-v2">
                <div>
                    <h2>My Documents</h2>
                    <p>Manage, edit, and publish your content from one place.</p>
                </div>
                <button className="workspace-primary-btn" onClick={() => router.push("/workspace/new")}>
                    <FiPlus size={18} />
                    New Document
                </button>
            </div>

            <div className="workspace-controls">
                <label className="workspace-search">
                    <FiSearch />
                    <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by title, tags, or content"
                    />
                </label>

                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option>All</option>
                    <option>Draft</option>
                    <option>Published</option>
                </select>

                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
                    <option>Recently Updated</option>
                    <option>Oldest</option>
                    <option>Most Viewed</option>
                </select>

                <div className="view-toggle-group">
                    <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>
                        <FiGrid />
                    </button>
                    <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
                        <FiList />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="workspace-empty">Loading documents...</div>
            ) : pagedDocuments.length === 0 ? (
                <div className="workspace-empty">No documents found for the current filters.</div>
            ) : (
                <div className={view === "grid" ? "documents-grid-v2" : "documents-list-v2"}>
                    {pagedDocuments.map((doc) => (
                        <article key={doc._id} className="workspace-doc-card">
                            <div className="workspace-doc-top">
                                <div>
                                    <h3>{doc.title}</h3>
                                    <p>{doc.description || "No description"}</p>
                                </div>
                                <span className={`status-pill ${(doc.status || "Draft").toLowerCase()}`}>
                                    {doc.status || "Draft"}
                                </span>
                            </div>

                            <div className="workspace-doc-meta">
                                <span>Updated {formatDate(doc.updatedAt)}</span>
                                <span>{doc.views || 0} views</span>
                            </div>

                            <div className="workspace-doc-actions">
                                <button onClick={() => router.push(`/workspace/${doc._id}`)}>
                                    <FiEdit2 size={15} /> Edit
                                </button>
                                <button onClick={() => handleDelete(doc._id)}>
                                    <FiTrash2 size={15} /> Delete
                                </button>
                                <button onClick={() => window.open(`/doc/${doc.slug}`, "_blank") }>
                                    <FiEye size={15} /> Preview
                                </button>
                                <div className="more-wrapper">
                                    <button onClick={() => setMenuOpenFor(menuOpenFor === doc._id ? "" : doc._id)}>
                                        <FiMoreVertical />
                                    </button>
                                    {menuOpenFor === doc._id && (
                                        <div className="more-menu">
                                            <button onClick={() => handleDuplicate(doc)}><FiCopy size={14} /> Duplicate</button>
                                            <button onClick={() => handleShare(doc)}><FiShare2 size={14} /> Share link</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <div className="workspace-pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    <FiChevronLeft /> Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    Next <FiChevronRight />
                </button>
            </div>
        </div>
    );
}

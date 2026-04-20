"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiArrowRight, FiFileText } from "react-icons/fi";
import DocumentEditor from "./DocumentEditor";
import "./UserWorkspace.css";

export default function UserWorkspace({ userEmail }) {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        category: "DSA",
        difficulty: "Beginner",
    });

    useEffect(() => {
        fetchUserDocuments();
    }, [userEmail]);

    const fetchUserDocuments = async () => {
        try {
            const response = await fetch(
                `/api/documents/user-documents?email=${encodeURIComponent(userEmail)}`
            );
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingDoc(null);
        setFormData({
            title: "",
            description: "",
            content: "",
            category: "DSA",
            difficulty: "Beginner",
        });
        setShowCreateModal(true);
    };

    const handleEdit = (doc) => {
        setEditingDoc(doc);
        setFormData({
            title: doc.title,
            description: doc.description,
            content: doc.content || "",
            category: doc.category,
            difficulty: doc.difficulty,
        });
        setShowCreateModal(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.description.trim()) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const endpoint = editingDoc
                ? `/api/documents/update-document`
                : `/api/documents/create-document`;
            const method = editingDoc ? "PUT" : "POST";

            const payload = {
                ...formData,
                userEmail,
                ...(editingDoc && { documentId: editingDoc._id }),
            };

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Log creation activity for contribution heatmap (only for new documents)
                if (!editingDoc) {
                    try {
                        await fetch("/api/analytics/log-activity", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                userEmail,
                                type: "create",
                                articleTitle: formData.title,
                            }),
                        });
                    } catch (err) {
                        console.error("Error logging creation activity:", err);
                    }
                }

                setShowCreateModal(false);
                fetchUserDocuments();
                alert(editingDoc ? "Document updated!" : "Document created!");
            } else {
                alert("Failed to save document");
            }
        } catch (error) {
            console.error("Error saving document:", error);
            alert("Error saving document");
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            const response = await fetch(`/api/documents/delete-document`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId }),
            });

            if (response.ok) {
                fetchUserDocuments();
                alert("Document deleted!");
            } else {
                alert("Failed to delete document");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Error deleting document");
        }
    };

    return (
        <div className="user-workspace">
            <div className="workspace-header">
                <div>
                    <h2>Your Workspace</h2>
                    <p>Create, edit, and manage your documentation</p>
                </div>
                <button className="btn btn-primary create-btn" onClick={handleCreateNew}>
                    <FiPlus size={20} />
                    Create New Document
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading your documents...</div>
            ) : documents.length === 0 ? (
                <div className="empty-state">
                    <FiFileText size={48} />
                    <h3>No documents yet</h3>
                    <p>Start creating your first documentation</p>
                    <button className="btn btn-primary" onClick={handleCreateNew}>
                        <FiPlus size={18} />
                        Create Your First Document
                    </button>
                </div>
            ) : (
                <div className="documents-grid">
                    {documents.map((doc) => (
                        <div key={doc._id} className="document-card">
                            <div className="card-header">
                                <div className="card-title">
                                    <h3>{doc.title}</h3>
                                    <span className={`difficulty-badge difficulty-${doc.difficulty.toLowerCase()}`}>
                                        {doc.difficulty}
                                    </span>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="action-btn edit"
                                        onClick={() => handleEdit(doc)}
                                        title="Edit"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(doc._id)}
                                        title="Delete"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="card-description">{doc.description}</p>

                            <div className="card-meta">
                                <span className="category-tag">{doc.category}</span>
                                <span className="view-count">
                                    <FiEye size={14} />
                                    {doc.views || 0} views
                                </span>
                            </div>

                            <a href={`/doc/${doc.slug}`} className="card-link">
                                View Document <FiArrowRight size={16} />
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingDoc ? "Edit Document" : "Create New Document"}</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    placeholder="Document title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Brief description of your document"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                    >
                                        <option>DSA</option>
                                        <option>Web Development</option>
                                        <option>System Design</option>
                                        <option>Database</option>
                                        <option>DevOps</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) =>
                                            setFormData({ ...formData, difficulty: e.target.value })
                                        }
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Content</label>
                                <DocumentEditor
                                    initialContent={formData.content}
                                    onChange={(newContent) =>
                                        setFormData({ ...formData, content: newContent })
                                    }
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingDoc ? "Update Document" : "Create Document"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

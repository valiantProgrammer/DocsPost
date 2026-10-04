"use client";

import React, { useState, useEffect } from "react";
import { FiSearch, FiX, FiFileText, FiCompass, FiExternalLink } from "react-icons/fi";
import Link from "next/link";

export default function SearchPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setResults([]);
            return;
        }

        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/documents/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.documents || []);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "15vh",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "560px",
                    backgroundColor: "var(--editor-card)",
                    borderRadius: "14px",
                    border: "1px solid var(--editor-border)",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 18px",
                        borderBottom: "1px solid var(--editor-border)",
                    }}
                >
                    <FiSearch style={{ fontSize: "18px", color: "var(--editor-muted)" }} />
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search documentation, topics, or creators..."
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            fontSize: "15px",
                            color: "var(--editor-text)",
                            fontFamily: "inherit",
                        }}
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--editor-muted)",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <FiX />
                    </button>
                </div>

                <div style={{ maxHeight: "320px", overflowY: "auto", padding: "8px" }}>
                    {loading ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "var(--editor-muted)", fontSize: "13px" }}>
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        results.map((doc) => (
                            <Link
                                key={doc._id || doc.slug}
                                href={doc.slug ? `/docs/${doc.slug}` : `/workspace/${doc._id}`}
                                onClick={onClose}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px 12px",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    color: "var(--editor-text)",
                                    transition: "background 0.15s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--editor-outline-hover)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                <FiFileText style={{ color: "var(--editor-primary)", fontSize: "16px" }} />
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                    <div style={{ fontSize: "13.5px", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                        {doc.title}
                                    </div>
                                    {doc.description && (
                                        <div style={{ fontSize: "12px", color: "var(--editor-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                            {doc.description}
                                        </div>
                                    )}
                                </div>
                                <FiExternalLink style={{ color: "var(--editor-muted-light)", fontSize: "13px" }} />
                            </Link>
                        ))
                    ) : query.trim() ? (
                        <div style={{ padding: "24px", textAlign: "center", color: "var(--editor-muted)", fontSize: "13px" }}>
                            No results found for &quot;{query}&quot;
                        </div>
                    ) : (
                        <div style={{ padding: "16px 12px", color: "var(--editor-muted)", fontSize: "12.5px" }}>
                            <div style={{ fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
                                Quick Navigation
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <Link
                                    href="/workspace"
                                    onClick={onClose}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--editor-text)", textDecoration: "none", padding: "6px 8px", borderRadius: "6px" }}
                                >
                                    <FiCompass /> My Workspace Documents
                                </Link>
                                <Link
                                    href="/categories"
                                    onClick={onClose}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--editor-text)", textDecoration: "none", padding: "6px 8px", borderRadius: "6px" }}
                                >
                                    <FiCompass /> Browse Categories
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        padding: "8px 16px",
                        borderTop: "1px solid var(--editor-border-subtle)",
                        backgroundColor: "var(--editor-border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11.5px",
                        color: "var(--editor-muted)",
                    }}
                >
                    <span>Press <strong>ESC</strong> to close</span>
                    <span>DocsPost Search</span>
                </div>
            </div>
        </div>
    );
}

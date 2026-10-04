"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiFileText, FiChevronsLeft, FiChevronsRight, FiList } from "react-icons/fi";

export default function OutlinePane({
    headings = [],
    activeId = "",
    onHeadingClick,
    onAddSection,
}) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("docspost-outline-collapsed");
            if (saved !== null) {
                setCollapsed(saved === "true");
            }
        }
    }, []);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        if (typeof window !== "undefined") {
            localStorage.setItem("docspost-outline-collapsed", String(next));
        }
    };

    if (collapsed) {
        return (
            <aside className="outline-card-pane collapsed" aria-label="Document Outline Collapsed">
                <button
                    type="button"
                    onClick={toggleCollapse}
                    className="outline-rail-btn"
                    title="Expand outline"
                    aria-label="Expand outline"
                >
                    <FiChevronsRight />
                </button>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", marginTop: "12px" }}>
                    <button
                        type="button"
                        onClick={onAddSection}
                        className="outline-rail-btn"
                        title="Add section"
                        aria-label="Add section"
                    >
                        <FiPlus />
                    </button>
                    <div style={{ color: "var(--editor-muted)", fontSize: "14px", marginTop: "8px" }}>
                        <FiList />
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="outline-card-pane" aria-label="Document Outline">
            <div className="outline-header">
                <h2 className="outline-title">Document Outline</h2>
                <button
                    type="button"
                    onClick={onAddSection}
                    className="outline-add-icon-btn"
                    title="Add section"
                    aria-label="Add section"
                >
                    <FiPlus />
                </button>
            </div>

            <div className="outline-tree-list">
                {headings.length === 0 ? (
                    <div style={{ padding: "16px 8px", fontSize: "12.5px", color: "var(--editor-muted-light)", textAlign: "center" }}>
                        No headings yet. Start typing # or ## in the editor.
                    </div>
                ) : (
                    headings.map((h) => {
                        const isActive = activeId === h.id;
                        const isH3 = h.level === 3;

                        return (
                            <div
                                key={h.id}
                                className={`outline-item ${isH3 ? "outline-item-h3" : ""} ${isActive ? "active" : ""}`}
                                onClick={() => onHeadingClick(h)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        onHeadingClick(h);
                                    }
                                }}
                            >
                                {isH3 ? (
                                    <FiFileText className="outline-h3-icon" />
                                ) : (
                                    <span className="outline-chip">
                                        H{h.level}
                                    </span>
                                )}
                                <span className="outline-item-text" title={h.text}>
                                    {h.text}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="outline-footer">
                <button
                    type="button"
                    onClick={onAddSection}
                    className="outline-add-sec-btn"
                >
                    <FiPlus />
                    <span>Add Section</span>
                </button>

                <button
                    type="button"
                    onClick={toggleCollapse}
                    className="outline-collapse-btn"
                >
                    <FiChevronsLeft />
                    <span>Collapse</span>
                </button>
            </div>
        </aside>
    );
}

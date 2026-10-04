"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    FiFolder,
    FiEye,
    FiEyeOff,
    FiUpload,
    FiMoreVertical,
    FiCopy,
    FiFileText,
    FiDownload,
    FiPrinter,
    FiArchive,
    FiTrash2,
    FiCheckSquare,
} from "react-icons/fi";
import SaveStatus from "./SaveStatus";
import TagInput from "./TagInput";

function formatDate(date) {
    if (!date) return "Apr 20, 2025";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function DocumentHeader({
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    tags,
    onTagsChange,
    saveState,
    lastSavedAt,
    onRetrySave,
    isPreview,
    onTogglePreview,
    onPublish,
    publishStatus, // "Draft" or "Published"
    isPublishDisabled,
    publishTooltip,
    updatedAt,
    wordCount = 0,
    onCopyLink,
    onDuplicate,
    onExportMarkdown,
    onDelete,
    onUnpublish,
    spellcheckEnabled,
    onToggleSpellcheck,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const titleTextareaRef = useRef(null);

    // Auto-grow title textarea
    useEffect(() => {
        if (titleTextareaRef.current) {
            titleTextareaRef.current.style.height = "auto";
            titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
        }
    }, [title]);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <section className="doc-header-card" aria-label="Document Header">
            <div className="doc-header-top-row">
                <div className="doc-header-left">
                    {/* Breadcrumbs */}
                    <nav className="doc-breadcrumbs" aria-label="Breadcrumb">
                        <FiFolder className="doc-breadcrumb-folder" />
                        <Link href="/workspace" className="doc-breadcrumb-link">
                            Workspace
                        </Link>
                        <span className="doc-breadcrumb-sep">&gt;</span>
                        <Link href="/workspace" className="doc-breadcrumb-link">
                            My Documents
                        </Link>
                        <span className="doc-breadcrumb-sep">&gt;</span>
                        <span className="doc-breadcrumb-current" title={title || "Untitled Document"}>
                            {title || "Untitled Document"}
                        </span>
                    </nav>

                    {/* Auto-growing Title Textarea (32px bold, no truncation) */}
                    <textarea
                        ref={titleTextareaRef}
                        rows={1}
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Untitled Document"
                        className="doc-inline-title"
                        aria-label="Document Title"
                        spellCheck="false"
                    />

                    {/* Inline Description / Subtitle (truncates when not focused) */}
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Add a brief subtitle or description..."
                        className="doc-inline-subtitle"
                        aria-label="Document Description"
                        spellCheck="false"
                    />

                    {/* Tags row */}
                    <TagInput tags={tags} onChange={onTagsChange} max={8} />
                </div>

                {/* Right side status, buttons & metadata */}
                <div className="doc-header-right">
                    <div className="doc-header-action-group">
                        <SaveStatus
                            saveState={saveState}
                            lastSavedAt={lastSavedAt}
                            onRetry={onRetrySave}
                        />

                        <button
                            type="button"
                            onClick={onTogglePreview}
                            className={`btn-preview-toggle ${isPreview ? "active" : ""}`}
                            aria-label={isPreview ? "Back to Write Mode" : "Preview Document"}
                        >
                            {isPreview ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                            <span>Preview</span>
                        </button>

                        <button
                            type="button"
                            onClick={onPublish}
                            disabled={isPublishDisabled}
                            title={publishTooltip || (publishStatus === "Published" ? "Update Document" : "Publish Document")}
                            className="btn-publish-main"
                        >
                            <FiUpload style={{ fontSize: "16px" }} />
                            <span>{publishStatus === "Published" ? "Update" : "Publish"}</span>
                        </button>

                        {/* More Menu (⋮) */}
                        <div style={{ position: "relative" }} ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="btn-more-dots"
                                aria-label="More document options"
                                aria-expanded={menuOpen}
                            >
                                <FiMoreVertical />
                            </button>

                            {menuOpen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "100%",
                                        marginTop: "8px",
                                        width: "210px",
                                        background: "var(--editor-card)",
                                        border: "1px solid var(--editor-border)",
                                        borderRadius: "10px",
                                        boxShadow: "var(--editor-shadow-md)",
                                        padding: "6px",
                                        zIndex: 100,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => { onCopyLink(); setMenuOpen(false); }}
                                        className="slash-item-btn"
                                    >
                                        <FiCopy className="slash-item-icon" /> Copy link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { onDuplicate(); setMenuOpen(false); }}
                                        className="slash-item-btn"
                                    >
                                        <FiFileText className="slash-item-icon" /> Duplicate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { onExportMarkdown(); setMenuOpen(false); }}
                                        className="slash-item-btn"
                                    >
                                        <FiDownload className="slash-item-icon" /> Export Markdown
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { window.print(); setMenuOpen(false); }}
                                        className="slash-item-btn"
                                    >
                                        <FiPrinter className="slash-item-icon" /> Print / Save as PDF
                                    </button>
                                    {onToggleSpellcheck && (
                                        <button
                                            type="button"
                                            onClick={() => { onToggleSpellcheck(); setMenuOpen(false); }}
                                            className="slash-item-btn"
                                        >
                                            <FiCheckSquare className="slash-item-icon" /> Spellcheck: {spellcheckEnabled ? "On" : "Off"}
                                        </button>
                                    )}
                                    {publishStatus === "Published" && (
                                        <button
                                            type="button"
                                            onClick={() => { onUnpublish(); setMenuOpen(false); }}
                                            className="slash-item-btn"
                                        >
                                            <FiArchive className="slash-item-icon" /> Unpublish
                                        </button>
                                    )}
                                    <div style={{ height: "1px", background: "var(--editor-border-subtle)", margin: "4px 0" }} />
                                    <button
                                        type="button"
                                        onClick={() => { onDelete(); setMenuOpen(false); }}
                                        className="slash-item-btn"
                                        style={{ color: "var(--editor-danger)" }}
                                    >
                                        <FiTrash2 className="slash-item-icon" style={{ color: "var(--editor-danger)" }} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata text */}
                    <div className="doc-meta-info-text">
                        Last edited {formatDate(updatedAt)} • {wordCount.toLocaleString()} words
                    </div>
                </div>
            </div>
        </section>
    );
}

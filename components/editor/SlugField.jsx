"use client";

import React, { useState } from "react";
import { FiLink, FiCheck } from "react-icons/fi";

export default function SlugField({ slug, onChange, status }) {
    const [copied, setCopied] = useState(false);

    const handleCopyUrl = () => {
        if (typeof window === "undefined" || !slug) return;
        const publicUrl = `${window.location.origin}/docs/${slug}`;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="setting-field-group">
            <label className="setting-label">
                Slug <span className="required-asterisk">*</span>
            </label>
            <div className="slug-input-wrapper">
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="document-slug"
                    className="setting-text-input"
                    style={{ paddingRight: "36px" }}
                />
                <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="slug-copy-btn"
                    title={copied ? "Copied URL!" : "Copy public link"}
                    aria-label="Copy public link"
                >
                    {copied ? <FiCheck style={{ color: "var(--editor-success)" }} /> : <FiLink />}
                </button>
            </div>
            {status?.message && (
                <span className={`slug-status-text ${status.state}`}>
                    {status.message}
                </span>
            )}
        </div>
    );
}

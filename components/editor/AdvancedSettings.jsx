"use client";

import React, { useState } from "react";
import { FiSettings, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function AdvancedSettings({ settings = {}, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const updateField = (field, val) => {
        onChange({
            ...settings,
            [field]: val,
        });
    };

    return (
        <div style={{ marginTop: "12px", borderTop: "1px solid var(--editor-border-subtle)" }}>
            <button
                type="button"
                className="advanced-accordion-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiSettings style={{ fontSize: "15px", color: "var(--editor-muted)" }} />
                    <span>Advanced Settings</span>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {isOpen && (
                <div className="advanced-accordion-content">
                    {/* Allow Comments */}
                    <div className="toggle-switch-row">
                        <span className="toggle-label">Allow Comments</span>
                        <input
                            type="checkbox"
                            checked={settings.allowComments ?? true}
                            onChange={(e) => updateField("allowComments", e.target.checked)}
                            style={{ accentColor: "var(--editor-primary)", width: "16px", height: "16px", cursor: "pointer" }}
                        />
                    </div>

                    {/* Show Table of Contents */}
                    <div className="toggle-switch-row">
                        <span className="toggle-label">Show Table of Contents</span>
                        <input
                            type="checkbox"
                            checked={settings.showToc ?? true}
                            onChange={(e) => updateField("showToc", e.target.checked)}
                            style={{ accentColor: "var(--editor-primary)", width: "16px", height: "16px", cursor: "pointer" }}
                        />
                    </div>

                    {/* SEO Title */}
                    <div className="setting-field-group">
                        <label className="setting-label">SEO Title</label>
                        <input
                            type="text"
                            value={settings.seoTitle || ""}
                            onChange={(e) => updateField("seoTitle", e.target.value)}
                            placeholder="Custom title for search engines"
                            className="setting-text-input"
                            style={{ height: "34px", fontSize: "12.5px" }}
                        />
                    </div>

                    {/* SEO Description */}
                    <div className="setting-field-group">
                        <label className="setting-label">SEO Description</label>
                        <textarea
                            value={settings.seoDescription || ""}
                            onChange={(e) => updateField("seoDescription", e.target.value)}
                            placeholder="Meta description for search snippets"
                            className="setting-textarea"
                            style={{ minHeight: "56px", fontSize: "12px" }}
                        />
                    </div>

                    {/* Scheduled Publish Date */}
                    <div className="setting-field-group">
                        <label className="setting-label">Scheduled Publish Date</label>
                        <input
                            type="datetime-local"
                            value={settings.scheduledPublishDate || ""}
                            onChange={(e) => updateField("scheduledPublishDate", e.target.value)}
                            className="setting-text-input"
                            style={{ height: "34px", fontSize: "12px" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

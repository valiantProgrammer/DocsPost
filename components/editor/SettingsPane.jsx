"use client";

import React from "react";
import SlugField from "./SlugField";
import CoverImageField from "./CoverImageField";
import TagInput from "./TagInput";
import VisibilityRadio from "./VisibilityRadio";
import AdvancedSettings from "./AdvancedSettings";

const CATEGORIES = [
    "Backend Development",
    "Frontend Development",
    "DevOps & Cloud",
    "AI & Machine Learning",
    "Mobile Development",
    "Database & SQL",
    "System Design",
    "Cybersecurity",
    "Tools & Productivity",
    "Other",
];

export default function SettingsPane({
    title,
    onTitleChange,
    slug,
    onSlugChange,
    slugStatus,
    description,
    onDescriptionChange,
    coverImage,
    onCoverImageChange,
    tags,
    onTagsChange,
    category,
    onCategoryChange,
    visibility,
    onVisibilityChange,
    advancedSettings,
    onAdvancedSettingsChange,
}) {
    return (
        <aside className="settings-card-pane" aria-label="Document Settings">
            <h2 className="settings-pane-title">Document Settings</h2>

            {/* Title */}
            <div className="setting-field-group">
                <label className="setting-label">
                    Title <span className="required-asterisk">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Document title"
                    className="setting-text-input"
                    required
                />
            </div>

            {/* Slug */}
            <SlugField
                slug={slug}
                onChange={onSlugChange}
                status={slugStatus}
            />

            {/* Description */}
            <div className="setting-field-group">
                <label className="setting-label">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value.slice(0, 160))}
                    placeholder="Short description for SEO and document subtitle..."
                    className="setting-textarea"
                    maxLength={160}
                    rows={3}
                />
                <div className="char-counter">
                    {(description || "").length} / 160 characters
                </div>
            </div>

            {/* Cover Image */}
            <CoverImageField
                imageUrl={coverImage}
                onImageChange={onCoverImageChange}
                onImageRemove={() => onCoverImageChange("")}
            />

            {/* Tags */}
            <div className="setting-field-group">
                <label className="setting-label">Tags</label>
                <TagInput
                    tags={tags}
                    onChange={onTagsChange}
                    max={8}
                />
            </div>

            {/* Category */}
            <div className="setting-field-group">
                <label className="setting-label">
                    Category <span className="required-asterisk">*</span>
                </label>
                <select
                    value={category || "Backend Development"}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="setting-text-input"
                    style={{ cursor: "pointer" }}
                    required
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Visibility */}
            <VisibilityRadio
                value={visibility}
                onChange={onVisibilityChange}
            />

            {/* Advanced Settings */}
            <AdvancedSettings
                settings={advancedSettings}
                onChange={onAdvancedSettingsChange}
            />
        </aside>
    );
}

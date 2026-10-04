"use client";

import React, { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

export default function TagInput({ tags = [], onChange, max = 8, isCompact = false }) {
    const [isInputActive, setIsInputActive] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const addTag = (val) => {
        const clean = (val || "").trim().replace(/^#+/, "");
        if (!clean) return;

        // Check duplicates case-insensitively
        const exists = tags.some((t) => t.toLowerCase() === clean.toLowerCase());
        if (!exists && tags.length < max) {
            onChange([...tags, clean]);
        }
        setInputValue("");
        setIsInputActive(false);
    };

    const removeTag = (indexToRemove) => {
        onChange(tags.filter((_, idx) => idx !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        } else if (e.key === "Escape") {
            setIsInputActive(false);
            setInputValue("");
        }
    };

    return (
        <div className="doc-tags-row">
            {tags.map((tag, idx) => (
                <span key={`${tag}-${idx}`} className="doc-tag-pill">
                    <span>{tag}</span>
                    <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="doc-tag-remove-btn"
                        aria-label={`Remove tag ${tag}`}
                    >
                        <FiX />
                    </button>
                </span>
            ))}

            {tags.length < max && (
                <>
                    {isInputActive ? (
                        <input
                            type="text"
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={() => addTag(inputValue)}
                            placeholder="Tag name..."
                            className="doc-tag-inline-input"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsInputActive(true)}
                            className="doc-tag-add-btn"
                        >
                            <FiPlus style={{ fontSize: "12px" }} />
                            <span>Add Tag</span>
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

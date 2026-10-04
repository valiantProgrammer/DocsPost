"use client";

import React from "react";

const OPTIONS = [
    {
        value: "Public",
        title: "Public",
        desc: "Anyone can view this document",
    },
    {
        value: "Unlisted",
        title: "Unlisted",
        desc: "Only people with the link can view",
    },
    {
        value: "Private",
        title: "Private",
        desc: "Only you can view",
    },
];

export default function VisibilityRadio({ value = "Public", onChange }) {
    return (
        <div className="setting-field-group">
            <label className="setting-label">Visibility</label>
            <div className="visibility-radio-group" role="radiogroup" aria-label="Document Visibility">
                {OPTIONS.map((opt) => (
                    <label key={opt.value} className="visibility-radio-row">
                        <input
                            type="radio"
                            name="document-visibility"
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                        />
                        <div className="visibility-label-content">
                            <span className="visibility-title">{opt.title}</span>
                            <span className="visibility-desc">{opt.desc}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

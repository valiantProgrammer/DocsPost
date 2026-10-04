"use client";

import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

function formatRelativeTime(date) {
    if (!date) return "Just now";
    const now = new Date();
    const diffSec = Math.floor((now - new Date(date)) / 1000);

    if (diffSec < 15) return "Just now";
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return "1 minute ago";
    if (diffMin < 60) return `${diffMin} minutes ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(date).toLocaleDateString();
}

export default function SaveStatus({ saveState, lastSavedAt, onRetry }) {
    const [, setTick] = useState(0);

    // Update relative time every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (saveState === "saving") {
        return (
            <div className="save-status-indicator">
                <div className="save-status-main saving">
                    <FiRefreshCw className="animate-spin" style={{ fontSize: "13px" }} />
                    <span>Saving...</span>
                </div>
                <span className="save-status-sub">Syncing to cloud</span>
            </div>
        );
    }

    if (saveState === "error") {
        return (
            <div className="save-status-indicator">
                <div className="save-status-main error">
                    <FiAlertCircle style={{ fontSize: "13px" }} />
                    <span>Error saving</span>
                </div>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--editor-primary)",
                            fontSize: "11px",
                            cursor: "pointer",
                            padding: 0,
                            textDecoration: "underline",
                        }}
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (saveState === "unsaved") {
        return (
            <div className="save-status-indicator">
                <div className="save-status-main unsaved">
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--editor-warning)", display: "inline-block" }} />
                    <span>Unsaved changes</span>
                </div>
                <span className="save-status-sub">Will save automatically</span>
            </div>
        );
    }

    return (
        <div className="save-status-indicator">
            <div className="save-status-main saved">
                <FiCheckCircle style={{ fontSize: "13px" }} />
                <span>Saved automatically</span>
            </div>
            <span className="save-status-sub">{formatRelativeTime(lastSavedAt)}</span>
        </div>
    );
}

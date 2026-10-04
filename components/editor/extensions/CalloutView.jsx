"use client";

import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiAlertOctagon } from "react-icons/fi";

export default function CalloutView({ node, updateAttributes }) {
    const type = node.attrs.type || "info";
    const title = node.attrs.title || "What you will learn";

    const getIcon = () => {
        switch (type) {
            case "tip":
                return <FiCheckCircle className="callout-icon" style={{ fontSize: "17px", color: "#16A34A" }} />;
            case "warning":
                return <FiAlertTriangle className="callout-icon" style={{ fontSize: "17px", color: "#D97706" }} />;
            case "danger":
                return <FiAlertOctagon className="callout-icon" style={{ fontSize: "17px", color: "#DC2626" }} />;
            case "info":
            default:
                return <FiInfo className="callout-icon" style={{ fontSize: "17px", color: "#2563EB" }} />;
        }
    };

    return (
        <NodeViewWrapper className={`editor-callout editor-callout-${type}`} data-callout-type={type}>
            <div className="editor-callout-header" contentEditable={false}>
                {getIcon()}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    className="callout-title-input"
                    style={{
                        background: "transparent",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "inherit",
                        outline: "none",
                        width: "100%",
                        fontFamily: "inherit",
                    }}
                    placeholder="Callout title..."
                />
            </div>
            <NodeViewContent className="editor-callout-body" />
        </NodeViewWrapper>
    );
}

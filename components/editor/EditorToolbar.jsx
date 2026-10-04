"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    FiBold,
    FiItalic,
    FiUnderline,
    FiCode,
    FiLink,
    FiList,
    FiCheckSquare,
    FiImage,
    FiGrid,
    FiVideo,
    FiMoreHorizontal,
    FiMinus,
    FiChevronDown,
    FiAlignLeft,
    FiInfo,
    FiCheck,
} from "react-icons/fi";
import { LuHeading1, LuHeading2, LuHeading3, LuQuote, LuStrikethrough } from "react-icons/lu";
import { RiListOrdered2 } from "react-icons/ri";

const BLOCK_OPTIONS = [
    { id: "paragraph", label: "Paragraph", icon: FiAlignLeft, shortcut: "Ctrl+Alt+0" },
    { id: "h1", label: "Heading 1", icon: LuHeading1, shortcut: "Ctrl+Alt+1" },
    { id: "h2", label: "Heading 2", icon: LuHeading2, shortcut: "Ctrl+Alt+2" },
    { id: "h3", label: "Heading 3", icon: LuHeading3, shortcut: "Ctrl+Alt+3" },
    { id: "quote", label: "Quote", icon: LuQuote, shortcut: "Ctrl+Shift+B" },
    { id: "code", label: "Code block", icon: FiCode, shortcut: "Ctrl+Alt+C" },
    { id: "callout", label: "Callout", icon: FiInfo, shortcut: "Ctrl+Shift+O" },
];

export default function EditorToolbar({
    editor,
    isPreview,
    onTogglePreview,
    onInsertImage,
    onInsertVideo,
    onInsertTable,
}) {
    const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [currentBlock, setCurrentBlock] = useState("paragraph");

    const blockDropdownRef = useRef(null);
    const moreRef = useRef(null);

    // Compute active block type accurately
    const detectBlockType = useCallback(() => {
        if (!editor) return "paragraph";
        if (editor.isActive("heading", { level: 1 })) return "h1";
        if (editor.isActive("heading", { level: 2 })) return "h2";
        if (editor.isActive("heading", { level: 3 })) return "h3";
        if (editor.isActive("blockquote")) return "quote";
        if (editor.isActive("codeBlock")) return "code";
        if (editor.isActive("callout")) return "callout";
        return "paragraph";
    }, [editor]);

    // Update active block on selection update and transactions
    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            setCurrentBlock(detectBlockType());
        };

        editor.on("selectionUpdate", updateState);
        editor.on("transaction", updateState);

        return () => {
            editor.off("selectionUpdate", updateState);
            editor.off("transaction", updateState);
        };
    }, [editor, detectBlockType]);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) {
                setMoreOpen(false);
            }
            if (blockDropdownRef.current && !blockDropdownRef.current.contains(e.target)) {
                setBlockDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!editor) return null;

    const activeOption = BLOCK_OPTIONS.find((b) => b.id === currentBlock) || BLOCK_OPTIONS[0];

    const handleSelectBlock = (val) => {
        setBlockDropdownOpen(false);
        switch (val) {
            case "h1":
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                break;
            case "h2":
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                break;
            case "h3":
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                break;
            case "quote":
                editor.chain().focus().toggleBlockquote().run();
                break;
            case "code":
                editor.chain().focus().setCodeBlock({ language: "bash", code: "" }).run();
                break;
            case "callout":
                editor.chain().focus().setCallout({ type: "info", title: "What you will learn" }).run();
                break;
            case "paragraph":
            default:
                editor.chain().focus().setParagraph().run();
                break;
        }
    };

    const handleSetLink = () => {
        if (!linkUrl) {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: linkUrl }).run();
        }
        setLinkPopoverOpen(false);
        setLinkUrl("");
    };

    return (
        <div className="editor-toolbar-row" role="toolbar" aria-label="Editor formatting tools">
            <div className="toolbar-left-group">
                {/* Custom Block-type dropdown */}
                <div style={{ position: "relative" }} ref={blockDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setBlockDropdownOpen(!blockDropdownOpen)}
                        className="toolbar-block-dropdown-btn"
                        aria-label="Format block type"
                        aria-expanded={blockDropdownOpen}
                    >
                        <span>{activeOption.label}</span>
                        <FiChevronDown size={14} className="dropdown-caret" />
                    </button>

                    {blockDropdownOpen && (
                        <div className="toolbar-block-menu">
                            {BLOCK_OPTIONS.map((item) => {
                                const ItemIcon = item.icon;
                                const isItemActive = currentBlock === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectBlock(item.id)}
                                        className={`toolbar-block-menu-item ${isItemActive ? "is-active" : ""}`}
                                    >
                                        <div className="menu-item-left">
                                            <ItemIcon className="menu-item-icon" />
                                            <span>{item.label}</span>
                                        </div>
                                        <span className="menu-item-shortcut">{item.shortcut}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bold */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
                    title="Bold (Ctrl+B)"
                    aria-label="Bold"
                >
                    <FiBold />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
                    title="Italic (Ctrl+I)"
                    aria-label="Italic"
                >
                    <FiItalic />
                </button>

                {/* Underline */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`toolbar-btn ${editor.isActive("underline") ? "active" : ""}`}
                    title="Underline (Ctrl+U)"
                    aria-label="Underline"
                >
                    <FiUnderline />
                </button>

                {/* Strikethrough */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`toolbar-btn ${editor.isActive("strike") ? "active" : ""}`}
                    title="Strikethrough (Ctrl+Shift+X)"
                    aria-label="Strikethrough"
                >
                    <LuStrikethrough />
                </button>

                {/* Inline code */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`toolbar-btn ${editor.isActive("code") ? "active" : ""}`}
                    title="Inline Code (Ctrl+E)"
                    aria-label="Inline Code"
                >
                    <FiCode />
                </button>

                {/* Link */}
                <div style={{ position: "relative" }}>
                    <button
                        type="button"
                        onClick={() => {
                            const prev = editor.getAttributes("link").href || "";
                            setLinkUrl(prev);
                            setLinkPopoverOpen(!linkPopoverOpen);
                        }}
                        className={`toolbar-btn ${editor.isActive("link") ? "active" : ""}`}
                        title="Insert Link (Ctrl+K)"
                        aria-label="Link"
                    >
                        <FiLink />
                    </button>

                    {linkPopoverOpen && (
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: "100%",
                                marginTop: "6px",
                                background: "var(--editor-card)",
                                border: "1px solid var(--editor-border)",
                                borderRadius: "8px",
                                padding: "8px",
                                display: "flex",
                                gap: "6px",
                                zIndex: 50,
                                boxShadow: "var(--editor-shadow-md)",
                            }}
                        >
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSetLink();
                                }}
                                style={{
                                    height: "28px",
                                    fontSize: "12px",
                                    padding: "0 8px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--editor-border)",
                                    background: "var(--editor-input-bg)",
                                    color: "var(--editor-text)",
                                    outline: "none",
                                    width: "180px",
                                }}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleSetLink}
                                className="btn-preview-toggle"
                                style={{ height: "28px", padding: "0 10px", fontSize: "12px" }}
                            >
                                Set
                            </button>
                        </div>
                    )}
                </div>

                <div className="toolbar-sep" />

                {/* Bullet List */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}
                    title="Bullet List (Ctrl+Shift+8)"
                    aria-label="Bullet List"
                >
                    <FiList />
                </button>

                {/* Numbered List */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`}
                    title="Numbered List (Ctrl+Shift+7)"
                    aria-label="Numbered List"
                >
                    <RiListOrdered2 />
                </button>

                {/* Task List / Checklist */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={`toolbar-btn ${editor.isActive("taskList") ? "active" : ""}`}
                    title="Task List (Ctrl+Shift+9)"
                    aria-label="Task List"
                >
                    <FiCheckSquare />
                </button>

                {/* Blockquote */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`toolbar-btn ${editor.isActive("blockquote") ? "active" : ""}`}
                    title="Quote (Ctrl+Shift+B)"
                    aria-label="Quote"
                >
                    <LuQuote />
                </button>

                <div className="toolbar-sep" />

                {/* Insert Image */}
                <button
                    type="button"
                    onClick={onInsertImage}
                    className="toolbar-btn"
                    title="Insert Image"
                    aria-label="Insert Image"
                >
                    <FiImage />
                </button>

                {/* Insert Table */}
                <button
                    type="button"
                    onClick={onInsertTable}
                    className={`toolbar-btn ${editor.isActive("table") ? "active" : ""}`}
                    title="Insert Table"
                    aria-label="Insert Table"
                >
                    <FiGrid />
                </button>

                {/* Insert Video */}
                <button
                    type="button"
                    onClick={onInsertVideo}
                    className="toolbar-btn"
                    title="Embed Video (YouTube / Vimeo)"
                    aria-label="Embed Video"
                >
                    <FiVideo />
                </button>

                {/* More actions (...) */}
                <div style={{ position: "relative" }} ref={moreRef}>
                    <button
                        type="button"
                        onClick={() => setMoreOpen(!moreOpen)}
                        className="toolbar-btn"
                        title="More formatting options"
                        aria-label="More formatting options"
                        aria-expanded={moreOpen}
                    >
                        <FiMoreHorizontal />
                    </button>

                    {moreOpen && (
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: "100%",
                                marginTop: "6px",
                                background: "var(--editor-card)",
                                border: "1px solid var(--editor-border)",
                                borderRadius: "8px",
                                padding: "6px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                zIndex: 50,
                                boxShadow: "var(--editor-shadow-md)",
                                width: "160px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setHorizontalRule().run();
                                    setMoreOpen(false);
                                }}
                                className="slash-item-btn"
                            >
                                <FiMinus className="slash-item-icon" /> Divider
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setCallout({ type: "info", title: "What you will learn" }).run();
                                    setMoreOpen(false);
                                }}
                                className="slash-item-btn"
                            >
                                <FiInfo className="slash-item-icon" /> Info Callout
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().clearNodes().unsetAllMarks().run();
                                    setMoreOpen(false);
                                }}
                                className="slash-item-btn"
                            >
                                Clear formatting
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Write | Preview segmented toggle */}
            <div className="toolbar-right-group">
                <div className="segmented-write-preview" role="group" aria-label="Editor view mode">
                    <button
                        type="button"
                        onClick={() => isPreview && onTogglePreview()}
                        className={`segmented-tab ${!isPreview ? "active" : ""}`}
                        aria-pressed={!isPreview}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => !isPreview && onTogglePreview()}
                        className={`segmented-tab ${isPreview ? "active" : ""}`}
                        aria-pressed={isPreview}
                    >
                        Preview
                    </button>
                </div>
            </div>
        </div>
    );
}

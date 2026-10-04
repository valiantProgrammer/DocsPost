"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    FiList,
    FiCode,
    FiAlertCircle,
    FiGrid,
    FiImage,
    FiMinus,
} from "react-icons/fi";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import { RiListOrdered2 } from "react-icons/ri";

const SLASH_ITEMS = [
    { id: "h1", title: "Heading 1", icon: LuHeading1, action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: "h2", title: "Heading 2", icon: LuHeading2, action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: "h3", title: "Heading 3", icon: LuHeading3, action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { id: "bulletList", title: "Bullet List", icon: FiList, action: (editor) => editor.chain().focus().toggleBulletList().run() },
    { id: "orderedList", title: "Numbered List", icon: RiListOrdered2, action: (editor) => editor.chain().focus().toggleOrderedList().run() },
    { id: "codeBlock", title: "Code Block", icon: FiCode, action: (editor) => editor.chain().focus().toggleCodeBlock().run() },
    { id: "callout", title: "Callout Box", icon: FiAlertCircle, action: (editor) => editor.chain().focus().setCallout({ type: "info", title: "What you will learn" }).run() },
    { id: "table", title: "Table", icon: FiGrid, action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { id: "divider", title: "Divider", icon: FiMinus, action: (editor) => editor.chain().focus().setHorizontalRule().run() },
];

export default function SlashMenu({ editor, isOpen, position, onClose }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef(null);

    useEffect(() => {
        setSelectedIndex(0);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % SLASH_ITEMS.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + SLASH_ITEMS.length) % SLASH_ITEMS.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                const item = SLASH_ITEMS[selectedIndex];
                if (item && editor) {
                    // Delete the slash trigger character before inserting
                    editor.commands.deleteRange({
                        from: editor.state.selection.from - 1,
                        to: editor.state.selection.from,
                    });
                    item.action(editor);
                    onClose();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, editor, onClose]);

    if (!isOpen || !position) return null;

    return (
        <div
            ref={menuRef}
            className="slash-menu-popup"
            style={{
                position: "absolute",
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            role="menu"
            aria-label="Insert blocks"
        >
            {SLASH_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                    <button
                        key={item.id}
                        type="button"
                        className={`slash-item-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                            if (editor) {
                                editor.commands.deleteRange({
                                    from: editor.state.selection.from - 1,
                                    to: editor.state.selection.from,
                                });
                                item.action(editor);
                                onClose();
                            }
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        role="menuitem"
                    >
                        <Icon className="slash-item-icon" />
                        <span>{item.title}</span>
                    </button>
                );
            })}
        </div>
    );
}

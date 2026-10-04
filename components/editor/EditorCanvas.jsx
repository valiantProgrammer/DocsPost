"use client";

import React, { useState, useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import SlashMenu from "./extensions/SlashMenu";

export default function EditorCanvas({ editor }) {
    const [slashOpen, setSlashOpen] = useState(false);
    const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            const { state, view } = editor;
            const { selection } = state;
            const { $from } = selection;

            // Check if current line contains only "/"
            const lineText = $from.parent.textContent || "";
            if (lineText.trim() === "/") {
                const coords = view.coordsAtPos(selection.from);
                const editorRect = view.dom.getBoundingClientRect();
                setSlashPos({
                    top: coords.bottom - editorRect.top + 8,
                    left: Math.max(10, coords.left - editorRect.left),
                });
                setSlashOpen(true);
            } else {
                setSlashOpen(false);
            }
        };

        editor.on("update", handleUpdate);
        editor.on("selectionUpdate", handleUpdate);

        return () => {
            editor.off("update", handleUpdate);
            editor.off("selectionUpdate", handleUpdate);
        };
    }, [editor]);

    // Handle dropped images into the editor
    useEffect(() => {
        if (!editor) return;

        const dom = editor.view.dom;
        const handleDrop = async (e) => {
            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;

            const file = files[0];
            if (!file.type.startsWith("image/")) return;

            e.preventDefault();

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("mediaType", "image");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (data.url) {
                    editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
                }
            } catch (err) {
                console.error("Editor dropped image upload failed:", err);
            }
        };

        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (!file) continue;

                    try {
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("mediaType", "image");

                        const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                        });
                        const data = await res.json();
                        if (data.url) {
                            editor.chain().focus().setImage({ src: data.url, alt: "Pasted image" }).run();
                        }
                    } catch (err) {
                        console.error("Editor pasted image upload failed:", err);
                    }
                    break;
                }
            }
        };

        dom.addEventListener("drop", handleDrop);
        dom.addEventListener("paste", handlePaste);

        return () => {
            dom.removeEventListener("drop", handleDrop);
            dom.removeEventListener("paste", handlePaste);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="editor-canvas-container" style={{ position: "relative" }}>
            <EditorContent editor={editor} />
            <SlashMenu
                editor={editor}
                isOpen={slashOpen}
                position={slashPos}
                onClose={() => setSlashOpen(false)}
            />
        </div>
    );
}

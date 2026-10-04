"use client";

import { useState, useEffect } from "react";

/**
 * Extracts headings (h1, h2, h3) from TipTap editor doc
 */
export function useOutline(editor) {
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        if (!editor) return;

        const updateHeadings = () => {
            const items = [];
            const doc = editor.state.doc;

            doc.descendants((node, pos) => {
                if (node.type.name === "heading") {
                    const level = node.attrs.level;
                    if (level >= 1 && level <= 3) {
                        const text = node.textContent || "Untitled";
                        const id = `heading-${pos}`;
                        items.push({
                            id,
                            pos,
                            level,
                            text,
                        });
                    }
                }
            });

            setHeadings(items);
        };

        updateHeadings();
        editor.on("update", updateHeadings);

        return () => {
            editor.off("update", updateHeadings);
        };
    }, [editor]);

    return headings;
}

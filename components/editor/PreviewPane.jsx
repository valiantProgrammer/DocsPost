"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CodeBlockNode } from "./extensions/CodeBlockNode";
import { Callout } from "./extensions/Callout";
import { VideoEmbed } from "./extensions/VideoEmbed";

export default function PreviewPane({ contentJson, content }) {
    const previewEditor = useEditor({
        immediatelyRender: false,
        editable: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                link: false,
                underline: false,
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            CodeBlockNode,
            Callout,
            VideoEmbed,
            Underline,
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: "editor-inline-link",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            }),
            Image.configure({
                inline: false,
                allowBase64: false,
            }),
            Table.configure({
                resizable: false,
            }),
            TableRow,
            TableCell,
            TableHeader,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: contentJson || content || "",
        editorProps: {
            attributes: {
                class: "docspost-content preview-mode",
                spellcheck: "false",
            },
        },
    });

    useEffect(() => {
        if (previewEditor && (contentJson || content)) {
            previewEditor.commands.setContent(contentJson || content);
        }
    }, [previewEditor, contentJson, content]);

    if (!previewEditor) return null;

    return (
        <div className="editor-canvas-container preview-mode-container">
            <EditorContent editor={previewEditor} />
        </div>
    );
}

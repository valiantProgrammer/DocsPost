import { generateHTML } from "@tiptap/html";
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
import sanitizeHtml from "sanitize-html";
import { CodeBlockNode } from "@/components/editor/extensions/CodeBlockNode";
import { Callout } from "@/components/editor/extensions/Callout";
import { VideoEmbed } from "@/components/editor/extensions/VideoEmbed";

export const documentExtensions = [
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
        openOnClick: false,
        HTMLAttributes: {
            class: "editor-inline-link",
        },
    }),
    Image.configure({
        inline: false,
        allowBase64: false,
    }),
    Table.configure({
        resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
];

export function renderDocumentJsonToHtml(contentJson) {
    if (!contentJson) return "";
    try {
        const rawHtml = generateHTML(contentJson, documentExtensions);

        // Sanitize allow-list: GFM elements, <u>, callouts, code blocks
        const cleanHtml = sanitizeHtml(rawHtml, {
            allowedTags: [
                "h1", "h2", "h3", "h4", "h5", "h6",
                "p", "a", "b", "i", "strong", "em", "strike", "s", "u",
                "code", "pre", "blockquote",
                "ul", "ol", "li",
                "table", "thead", "tbody", "tr", "th", "td",
                "img", "div", "span", "hr", "br", "iframe",
            ],
            allowedAttributes: {
                "*": ["class", "style", "id"],
                a: ["href", "name", "target", "rel"],
                img: ["src", "alt", "title", "width", "height"],
                iframe: ["src", "allowfullscreen", "frameborder", "allow"],
                div: ["data-callout-type", "data-callout-title", "data-video-url"],
                code: ["class", "data-language"],
                pre: ["class"],
            },
            allowedClasses: {
                div: ["editor-callout*", "video-embed*"],
                span: ["*"],
                code: ["language-*", "hljs*"],
                pre: ["codeblock-*", "shiki*", "hljs*"],
                a: ["editor-inline-link"],
            },
            allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
        });

        return cleanHtml;
    } catch (err) {
        console.error("Error rendering document JSON to HTML:", err);
        return "";
    }
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
    FiArrowLeft,
    FiBold,
    FiCheckCircle,
    FiChevronDown,
    FiCode,
    FiImage,
    FiItalic,
    FiMinus,
    FiList,
    FiSave,
    FiType,
    FiUnderline,
    FiVideo,
    FiEye,
    FiMoon,
    FiSun,
    FiX,
    FiTrash2,
    FiMenu,
} from "react-icons/fi";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useEditor, EditorContent } from "@tiptap/react";
import MonacoEditor from "@monaco-editor/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
// Or if using default export: import createLowlight from 'lowlight';
// Then create lowlight instance:
const lowlight = createLowlight();
// Optionally register languages:
import javascript from 'highlight.js/lib/languages/javascript';
lowlight.register('javascript', javascript);

import "./WorkspaceEditor.css";

const CATEGORIES = ["General", "DSA", "Web Development", "Backend", "Database", "DevOps"];

// Helper to strip HTML for word count
const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
};

const createDefaultRichTextContent = (type) => {
    switch (type) {
        case "heading1":
            return "<h1></h1>";
        case "heading2":
            return "<h2></h2>";
        case "heading3":
            return "<h3></h3>";
        case "quote":
            return "<blockquote></blockquote>";
        case "bulletList":
            return "<ul><li></li></ul>";
        case "numberedList":
            return "<ol><li></li></ol>";
        default:
            return "<p></p>";
    }
};

const normalizeRichTextContent = (type, content) => {
    if (!content) {
        return createDefaultRichTextContent(type);
    }
    if (content.includes("<")) {
        return content;
    }

    if (type === "bulletList") {
        const lines = content.split("\n").filter((line) => line.trim());
        const listItems = lines.map((line) => `<li>${line.trim()}</li>`).join("");
        return `<ul>${listItems || "<li></li>"}</ul>`;
    }

    if (type === "numberedList") {
        const lines = content.split("\n").filter((line) => line.trim());
        const listItems = lines.map((line) => `<li>${line.trim()}</li>`).join("");
        return `<ol>${listItems || "<li></li>"}</ol>`;
    }

    if (type === "quote") {
        return `<blockquote>${content}</blockquote>`;
    }

    if (type === "heading1") {
        return `<h1>${content}</h1>`;
    }
    if (type === "heading2") {
        return `<h2>${content}</h2>`;
    }
    if (type === "heading3") {
        return `<h3>${content}</h3>`;
    }

    return `<p>${content}</p>`;
};

const AUTOSAVE_IDLE_MS = 30 * 1000;
const AUTOSAVE_MAX_MS = 5 * 60 * 1000;
const AUTOSAVE_TICK_MS = 15 * 1000;
const RICH_TEXT_TYPES = ["paragraph", "heading1", "heading2", "heading3", "quote", "bulletList", "numberedList"];
const nowMs = () => Date.now();
const createBlockId = () => `block-${nowMs()}`;

const parseBlocksFromContent = (content) => {
    if (!content || typeof content !== "string") return [];
    try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeBlockForEditor = (block, index) => {
    const type = block?.type || "paragraph";
    const safeContent = typeof block?.content === "string" ? block.content : "";
    const normalizedContent = RICH_TEXT_TYPES.includes(type) ? normalizeRichTextContent(type, safeContent) : safeContent;
    return {
        id: block?.id || `${createBlockId()}-${index}`,
        type,
        content: normalizedContent,
    };
};

const normalizeBlocksForEditor = (document) => {
    const sourceBlocks = Array.isArray(document?.blocks) && document.blocks.length > 0
        ? document.blocks
        : parseBlocksFromContent(document?.content);

    if (sourceBlocks.length > 0) {
        return sourceBlocks.map(normalizeBlockForEditor);
    }

    if (typeof document?.content === "string" && document.content.trim()) {
        return [normalizeBlockForEditor({ id: "legacy-1", type: "paragraph", content: document.content }, 0)];
    }

    return [normalizeBlockForEditor({ id: createBlockId(), type: "paragraph", content: "" }, 0)];
};

const blocksToPlainText = (blocks) =>
    (blocks || [])
        .map((block) => stripHtml(block?.content || ""))
        .filter(Boolean)
        .join("\n");

const extractYouTubeVideoId = (url) => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.replace("/", "").split("?")[0];
        }
        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.pathname.startsWith("/shorts/")) {
                return parsed.pathname.split("/shorts/")[1]?.split("/")[0];
            }
            if (parsed.pathname.startsWith("/embed/")) {
                return parsed.pathname.split("/embed/")[1]?.split("/")[0];
            }
            return parsed.searchParams.get("v");
        }
        return null;
    } catch {
        return null;
    }
};

const resolveGoogleAssetUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    try {
        const parsed = new URL(trimmed);

        if (parsed.hostname.includes("drive.google.com")) {
            const pathParts = parsed.pathname.split("/");
            const dIndex = pathParts.findIndex((part) => part === "d");
            const fileIdFromPath = dIndex !== -1 ? pathParts[dIndex + 1] : null;
            const fileIdFromQuery = parsed.searchParams.get("id");
            const fileId = fileIdFromPath || fileIdFromQuery;
            if (fileId) {
                return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
        }

        if (parsed.hostname.includes("storage.googleapis.com")) {
            return trimmed;
        }

        if (parsed.hostname.endsWith(".storage.googleapis.com")) {
            return trimmed;
        }

        if (parsed.hostname === "console.cloud.google.com" && parsed.pathname.includes("/storage/browser/")) {
            return trimmed;
        }
    } catch {
        return trimmed;
    }

    return trimmed;
};

const uploadLocalFileToCloudinary = async (file, mediaType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType);

    const response = await fetch("/api/documents/upload-media", {
        method: "POST",
        body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result?.error || "Upload failed");
    }

    return result.url;
};

// Rich text editor component using TipTap
const RichTextEditor = ({ content, onChange, placeholder, className, autoFocus, onEditorReady, onEditorFocus }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight,
            Typography,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'code-block',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
        ],
        content: content || "<p></p>",
        editorProps: {
            attributes: {
                class: `rich-text-editor ${className || ''}`,
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        immediatelyRender: false,
    });

    const handleClick = () => {
        if (editor) {
            editor.commands.focus("end");
        }
    };

    // Update editor content if external content changes
    useEffect(() => {
        const normalizedContent = content || "<p></p>";
        if (editor && normalizedContent !== editor.getHTML()) {
            editor.commands.setContent(normalizedContent, false);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor && autoFocus) {
            editor.commands.focus("end");
        }
    }, [editor, autoFocus]);

    useEffect(() => {
        if (!editor || !onEditorReady) return;
        onEditorReady(editor);
    }, [editor, onEditorReady]);

    return React.createElement(
        "div",
        {
            className: "editor-click-wrapper",
            onClick: () => {
                handleClick();
                if (onEditorFocus) onEditorFocus();
            },
        },
        React.createElement(EditorContent, { editor })
    );
};

// Sortable block wrapper
const SortableBlock = ({ block, onUpdate, onDelete, isFocused, onFocus, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return React.createElement(
        "div",
        {
            ref: setNodeRef,
            style,
            className: `block-wrapper ${isFocused ? "focused" : ""} ${isDragging ? "dragging" : ""}`,
            onFocusCapture: onFocus,
            onClick: onFocus,
        },
        React.createElement(
            "div",
            { className: "block-drag-handle", ...attributes, ...listeners },
            React.createElement(FiMenu, { size: 16 })
        ),
        React.createElement(
            "div",
            { className: "block-content-wrapper" },
            children
        ),
        React.createElement(
            "button",
            { className: "delete-block", onClick: onDelete, title: "Delete block" },
            React.createElement(FiTrash2, { size: 14 })
        )
    );
};

const ImageBlockEditor = ({ block, onUpdate, onUploadState }) => {
    const [sourceType, setSourceType] = useState("link");
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        try {
            onUploadState("Uploading media...");
            const cloudinaryUrl = await uploadLocalFileToCloudinary(file, "image");
            onUpdate(cloudinaryUrl);
            onUploadState("Saving...");
        } catch (error) {
            console.error(error);
            alert("Unable to upload selected image.");
            onUploadState("Save failed");
        } finally {
            event.target.value = "";
        }
    };

    return React.createElement(
        "div",
        { className: "block-image" },
        React.createElement(
            "div",
            { className: "media-source-toggle" },
            React.createElement("button", { type: "button", className: `media-source-btn ${sourceType === "link" ? "active" : ""}`, onClick: () => setSourceType("link") }, "Paste Link"),
            React.createElement("button", { type: "button", className: `media-source-btn ${sourceType === "local" ? "active" : ""}`, onClick: () => setSourceType("local") }, "Upload Local"),
            React.createElement("button", { type: "button", className: `media-source-btn ${sourceType === "google" ? "active" : ""}`, onClick: () => setSourceType("google") }, "Google Storage")
        ),
        sourceType === "local"
            ? React.createElement(
                "div",
                { className: "media-upload-row" },
                React.createElement("input", { type: "file", accept: "image/*", ref: fileInputRef, onChange: handleFileSelect, style: { display: "none" } }),
                React.createElement("button", { type: "button", className: "media-upload-btn", onClick: () => fileInputRef.current?.click() }, "Choose Image")
            )
            : React.createElement("input", {
                type: "url",
                value: block.content || "",
                onChange: (e) => {
                    onUpdate(e.target.value);
                },
                onBlur: (e) => {
                    if (sourceType === "google") {
                        onUpdate(resolveGoogleAssetUrl(e.target.value));
                    }
                },
                placeholder: sourceType === "google" ? "Google Drive / GCS URL..." : "Image URL...",
                className: "block-input",
            }),
        block.content && React.createElement("img", { src: block.content, alt: "Preview" })
    );
};

const VideoBlockEditor = ({ block, onUpdate, onUploadState }) => {
    const [sourceType, setSourceType] = useState("link");
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("video/")) {
            alert("Please select a valid video file.");
            return;
        }

        try {
            onUploadState("Uploading media...");
            const cloudinaryUrl = await uploadLocalFileToCloudinary(file, "video");
            onUpdate(cloudinaryUrl);
            onUploadState("Saving...");
        } catch (error) {
            console.error(error);
            alert("Unable to upload selected video.");
            onUploadState("Save failed");
        } finally {
            event.target.value = "";
        }
    };

    return React.createElement(
        "div",
        { className: "block-video" },
        React.createElement(
            "div",
            { className: "media-source-toggle" },
            React.createElement("button", { type: "button", className: `media-source-btn ${sourceType === "link" ? "active" : ""}`, onClick: () => setSourceType("link") }, "Paste Link"),
            React.createElement("button", { type: "button", className: `media-source-btn ${sourceType === "local" ? "active" : ""}`, onClick: () => setSourceType("local") }, "Upload Local"),
            React.createElement("button", { type: "button", className: `media-source-btn ${sourceType === "google" ? "active" : ""}`, onClick: () => setSourceType("google") }, "Google Storage")
        ),
        sourceType === "local"
            ? React.createElement(
                "div",
                { className: "media-upload-row" },
                React.createElement("input", { type: "file", accept: "video/*", ref: fileInputRef, onChange: handleFileSelect, style: { display: "none" } }),
                React.createElement("button", { type: "button", className: "media-upload-btn", onClick: () => fileInputRef.current?.click() }, "Choose Video")
            )
            : React.createElement("input", {
                type: "url",
                value: block.content || "",
                onChange: (e) => {
                    onUpdate(e.target.value);
                },
                onBlur: (e) => {
                    if (sourceType === "google") {
                        onUpdate(resolveGoogleAssetUrl(e.target.value));
                    }
                },
                placeholder: sourceType === "google" ? "Google Drive / GCS Video URL..." : "YouTube/Vimeo URL...",
                className: "block-input",
            }),
        block.content && React.createElement(VideoEmbed, { url: block.content })
    );
};

const CODE_LANGUAGES = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "c",
    "go",
    "rust",
    "php",
    "html",
    "css",
    "json",
    "sql",
    "bash",
];

const parseCodeBlockContent = (content) => {
    if (!content || typeof content !== "string") {
        return { language: "javascript", code: "" };
    }
    const separatorIndex = content.indexOf("\n");
    if (separatorIndex === -1) {
        return { language: "javascript", code: content };
    }
    const maybeLanguage = content.slice(0, separatorIndex).trim();
    const code = content.slice(separatorIndex + 1);
    if (CODE_LANGUAGES.includes(maybeLanguage)) {
        return { language: maybeLanguage, code };
    }
    return { language: "javascript", code: content };
};

const serializeCodeBlockContent = (language, code) => `${language}\n${code || ""}`;

const CodeBlockEditor = ({ block, onUpdate }) => {
    const { language, code } = parseCodeBlockContent(block.content);
    return React.createElement(
        "div",
        { className: "inline-code-block" },
        React.createElement(
            "div",
            { className: "inline-code-header" },
            React.createElement(
                "span",
                { className: "inline-code-title" },
                "Code"
            ),
            React.createElement(
                "select",
                {
                    className: "inline-code-language",
                    value: language,
                    onChange: (e) => onUpdate(serializeCodeBlockContent(e.target.value, code)),
                },
                CODE_LANGUAGES.map((item) => React.createElement("option", { key: item, value: item }, item))
            )
        ),
        React.createElement(MonacoEditor, {
            height: "280px",
            language,
            theme: "vs-dark",
            value: code,
            onChange: (nextCode) => onUpdate(serializeCodeBlockContent(language, nextCode || "")),
            options: {
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
            },
        })
    );
};

// Block editor with rich text support for text-based blocks
const BlockEditor = ({ block, onUpdate, onDelete, isFocused, onFocus, onUploadState, onTextEditorReady }) => {
    const handleRichTextChange = (html) => {
        onUpdate(html);
    };

    const richTextTypes = ["paragraph", "heading1", "heading2", "heading3", "quote", "bulletList", "numberedList"];

    if (richTextTypes.includes(block.type)) {
        let placeholder = "";
        let className = "";
        if (block.type === "heading1") {
            placeholder = "Heading 1...";
            className = "block-heading block-heading-1";
        } else if (block.type === "heading2") {
            placeholder = "Heading 2...";
            className = "block-heading block-heading-2";
        } else if (block.type === "heading3") {
            placeholder = "Heading 3...";
            className = "block-heading block-heading-3";
        } else if (block.type === "quote") {
            placeholder = "Quote...";
            className = "block-quote";
        } else if (block.type === "bulletList") {
            placeholder = "Bullet list...";
            className = "block-bullet-list";
        } else if (block.type === "numberedList") {
            placeholder = "Numbered list...";
            className = "block-numbered-list";
        } else {
            placeholder = "Start typing...";
            className = "block-paragraph";
        }

        const normalizedContent = normalizeRichTextContent(block.type, block.content);
        if (normalizedContent !== block.content) {
            onUpdate(normalizedContent);
        }

        return React.createElement(
            SortableBlock,
            { block, onUpdate, onDelete, isFocused, onFocus },
            React.createElement(RichTextEditor, {
                content: normalizedContent,
                onChange: handleRichTextChange,
                placeholder: placeholder,
                className: className,
                autoFocus: isFocused,
                onEditorReady: onTextEditorReady,
                onEditorFocus: onFocus,
            })
        );
    }

    // Non-rich-text blocks (image, video, code, divider)
    if (block.type === "code") {
        return React.createElement(
            SortableBlock,
            { block, onUpdate, onDelete, isFocused, onFocus },
            React.createElement(CodeBlockEditor, { block, onUpdate })
        );
    }

    if (block.type === "image") {
        return React.createElement(
            SortableBlock,
            { block, onUpdate, onDelete, isFocused, onFocus },
            React.createElement(ImageBlockEditor, { block, onUpdate, onUploadState })
        );
    }

    if (block.type === "video") {
        return React.createElement(
            SortableBlock,
            { block, onUpdate, onDelete, isFocused, onFocus },
            React.createElement(VideoBlockEditor, { block, onUpdate, onUploadState })
        );
    }

    if (block.type === "divider") {
        return React.createElement(
            SortableBlock,
            { block, onUpdate, onDelete, isFocused, onFocus },
            React.createElement("div", { className: "block-divider" })
        );
    }

    return null;
};

// Preview content with HTML rendering
const PreviewContent = ({ blocks }) => {
    const renderBlockPreview = (block) => {
        switch (block.type) {
            case "paragraph":
            case "heading1":
            case "heading2":
            case "heading3":
            case "quote":
            case "bulletList":
            case "numberedList":
                return React.createElement("div", { dangerouslySetInnerHTML: { __html: block.content || "" } });
            case "code":
                {
                    const parsedCode = parseCodeBlockContent(block.content);
                    return React.createElement(
                        "pre",
                        null,
                        React.createElement("code", { className: `language-${parsedCode.language}` }, parsedCode.code)
                    );
                }
            case "image":
                return React.createElement("img", { src: block.content, alt: "Content", style: { maxWidth: "100%", height: "auto" } });
            case "video":
                return React.createElement(VideoEmbed, { url: block.content });
            case "divider":
                return React.createElement("hr");
            default:
                return null;
        }
    };

    return React.createElement(
        "div",
        { className: "preview-content" },
        blocks.map((block, idx) =>
            React.createElement(
                "div",
                { key: idx, className: `preview-block preview-${block.type}` },
                renderBlockPreview(block)
            )
        )
    );
};

// Video embed component
const VideoEmbed = ({ url }) => {
    if (!url) return null;

    if (url.startsWith("data:video") || url.startsWith("blob:")) {
        return React.createElement("video", {
            controls: true,
            src: url,
            style: { width: "100%", borderRadius: "8px", marginTop: "8px", border: "1px solid var(--line)" },
        });
    }

    let embedUrl = url;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = extractYouTubeVideoId(url);
        embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return React.createElement("iframe", {
        width: "100%",
        height: "400",
        src: embedUrl,
        frameBorder: "0",
        allowFullScreen: true,
        title: "Video",
        style: { borderRadius: "8px", marginTop: "8px" },
    });
};

// Main WorkspaceEditor component
export default function WorkspaceEditor({ userEmail, documentId }) {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();

    const [doc, setDoc] = useState({
        title: "",
        blocks: [normalizeBlockForEditor({ id: createBlockId(), type: "paragraph", content: "" }, 0)],
        status: "Draft",
        visibility: "Public",
        category: "General",
        tags: [],
        featuredImage: "",
        description: "",
    });

    const [tagInput, setTagInput] = useState("");
    const [saveState, setSaveState] = useState("Saved");
    const [showPreview, setShowPreview] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("");
    const [focusedBlockId, setFocusedBlockId] = useState(null);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const docRef = useRef(doc);
    const textEditorsRef = useRef({});
    const isDirtyRef = useRef(false);
    const isSavingRef = useRef(false);
    const hasPendingSaveRef = useRef(false);
    const lastInputAtRef = useRef(0);
    const lastSavedAtRef = useRef(0);
    const saveDocumentRef = useRef(null);

    useEffect(() => {
        docRef.current = doc;
    }, [doc]);

    useEffect(() => {
        const now = nowMs();
        if (lastInputAtRef.current === 0) {
            lastInputAtRef.current = now;
        }
        if (lastSavedAtRef.current === 0) {
            lastSavedAtRef.current = now;
        }
    }, []);

    const markDirty = () => {
        isDirtyRef.current = true;
        lastInputAtRef.current = nowMs();
        setSaveState("Saving...");
    };

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load document
    useEffect(() => {
        if (!documentId || !userEmail) return;

        const load = async () => {
            const response = await fetch(
                `/api/documents/get-document?documentId=${documentId}&userEmail=${encodeURIComponent(userEmail)}`
            );
            if (!response.ok) {
                alert("Document not found");
                router.push("/workspace");
                return;
            }

            const data = await response.json();
            const d = data.document;
            const normalizedBlocks = normalizeBlocksForEditor(d);
            const savedTime = d.updatedAt ? new Date(d.updatedAt).getTime() : nowMs();
            setDoc({
                title: d.title || "",
                blocks: normalizedBlocks,
                status: d.status || "Draft",
                visibility: d.visibility || "Public",
                category: d.category || "General",
                tags: d.tags || [],
                featuredImage: d.featuredImage || "",
                description: d.description || "",
            });
            setLastUpdated(d.updatedAt || "");
            isDirtyRef.current = false;
            isSavingRef.current = false;
            hasPendingSaveRef.current = false;
            lastInputAtRef.current = nowMs();
            lastSavedAtRef.current = Number.isFinite(savedTime) ? savedTime : nowMs();
            setSaveState("Saved");
        };

        load();
    }, [documentId, userEmail, router]);

    // Word count and reading time
    const wordCount = useMemo(() => {
        const text = doc.blocks
            .filter(b => ["paragraph", "heading1", "heading2", "heading3", "quote", "bulletList", "numberedList"].includes(b.type))
            .map(b => stripHtml(b.content || ""))
            .join(" ")
            .trim();
        return text ? text.split(/\s+/).length : 0;
    }, [doc.blocks]);

    const readingTime = Math.max(1, Math.ceil(wordCount / 220));

    const getFocusedTextEditor = () => {
        if (!focusedBlockId) return null;
        return textEditorsRef.current[focusedBlockId] || null;
    };

    const applyToFocusedTextEditor = (action) => {
        const editor = getFocusedTextEditor();
        if (!editor) return false;
        action(editor);
        markDirty();
        return true;
    };

    // Block operations
    const addBlock = (type, content = "") => {
        const newBlock = {
            id: createBlockId(),
            type,
            content: RICH_TEXT_TYPES.includes(type) ? normalizeRichTextContent(type, content) : content,
        };

        setDoc((prev) => {
            const hasFocus = focusedBlockId && prev.blocks.some((block) => block.id === focusedBlockId);
            if (!hasFocus) {
                return { ...prev, blocks: [...prev.blocks, newBlock] };
            }
            const focusedIndex = prev.blocks.findIndex((block) => block.id === focusedBlockId);
            const nextBlocks = [...prev.blocks];
            nextBlocks.splice(focusedIndex + 1, 0, newBlock);
            return { ...prev, blocks: nextBlocks };
        });
        markDirty();
        setFocusedBlockId(newBlock.id);
    };

    const updateBlock = (id, content) => {
        setDoc(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, content } : b)
        }));
        markDirty();
    };

    const deleteBlock = (id) => {
        delete textEditorsRef.current[id];
        setDoc(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== id)
        }));
        markDirty();
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setDoc((prev) => {
                const oldIndex = prev.blocks.findIndex((b) => b.id === active.id);
                const newIndex = prev.blocks.findIndex((b) => b.id === over?.id);
                const newBlocks = arrayMove(prev.blocks, oldIndex, newIndex);
                return { ...prev, blocks: newBlocks };
            });
            markDirty();
        }
    };

    // Save document
    const saveDocument = async (nextStatus = "Draft", options = {}) => {
        const { silent = false, autosave = false } = options;
        const currentDoc = docRef.current;

        if (isSavingRef.current) {
            if (autosave) {
                hasPendingSaveRef.current = true;
            }
            return false;
        }

        if (!userEmail || !currentDoc.title.trim()) {
            if (!silent) {
                alert("Please add a title.");
            }
            return false;
        }

        isSavingRef.current = true;
        setSaveState("Saving...");

        const plainText = blocksToPlainText(currentDoc.blocks);
        const contentText = plainText.slice(0, 140);

        const payload = {
            documentId,
            userEmail,
            title: currentDoc.title,
            description: currentDoc.description || contentText,
            content: plainText,
            blocks: currentDoc.blocks,
            category: currentDoc.category,
            status: nextStatus,
            visibility: currentDoc.visibility,
            tags: currentDoc.tags,
            featuredImage: currentDoc.featuredImage,
        };

        const endpoint = documentId ? "/api/documents/update-document" : "/api/documents/create-document";
        const method = documentId ? "PUT" : "POST";

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                setSaveState("Save failed");
                if (!silent) {
                    alert("Unable to save document.");
                }
                return false;
            }

            const result = await response.json();
            setSaveState("Saved");
            setDoc((prev) => ({ ...prev, status: nextStatus }));
            setLastUpdated(new Date().toISOString());
            isDirtyRef.current = false;
            lastSavedAtRef.current = nowMs();

            if (!documentId && result.documentId) {
                router.replace(`/workspace/${result.documentId}`);
            }
            return true;
        } catch (error) {
            console.error("Save error:", error);
            setSaveState("Save failed");
            if (!silent) {
                alert("Failed to save document");
            }
            return false;
        } finally {
            isSavingRef.current = false;
            if (hasPendingSaveRef.current) {
                hasPendingSaveRef.current = false;
                if (isDirtyRef.current) {
                    void saveDocument("Draft", { autosave: true, silent: true });
                }
            }
        }
    };

    useEffect(() => {
        saveDocumentRef.current = saveDocument;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isDirtyRef.current || isSavingRef.current) return;
            const now = Date.now();
            const idleReached = now - lastInputAtRef.current >= AUTOSAVE_IDLE_MS;
            const maxReached = now - lastSavedAtRef.current >= AUTOSAVE_MAX_MS;
            if (!idleReached && !maxReached) return;
            if (!userEmail || !docRef.current.title.trim()) return;
            if (typeof saveDocumentRef.current === "function") {
                void saveDocumentRef.current("Draft", { autosave: true, silent: true });
            }
        }, AUTOSAVE_TICK_MS);

        return () => clearInterval(timer);
    }, [userEmail]);

    // Tags management
    const addTag = () => {
        const clean = tagInput.trim();
        if (!clean || doc.tags.includes(clean)) {
            setTagInput("");
            return;
        }
        setDoc((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
        markDirty();
        setTagInput("");
    };

    const removeTag = (tagToRemove) => {
        setDoc(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
        markDirty();
    };

    return React.createElement(
        "div",
        { className: "workspace-editor-page" },
        // Top Bar
        React.createElement(
            "div",
            { className: "workspace-editor-top" },
            React.createElement(
                "button",
                { onClick: () => router.push("/workspace"), className: "ghost-btn", title: "Back to workspace" },
                React.createElement(FiArrowLeft, null),
                " Back"
            ),
            React.createElement("input", {
                value: doc.title,
                onChange: (e) => {
                    setDoc((prev) => ({ ...prev, title: e.target.value }));
                    markDirty();
                },
                placeholder: "Untitled Document",
                className: "title-input",
            }),
            React.createElement(
                "div",
                { className: "top-actions" },
                React.createElement(
                    "span",
                    { className: "save-state" },
                    React.createElement(FiCheckCircle, null),
                    " ",
                    saveState
                ),
                React.createElement(
                    "button",
                    { onClick: toggleTheme, className: "theme-toggle-btn", title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode" },
                    isDark ? React.createElement(FiSun, { size: 18 }) : React.createElement(FiMoon, { size: 18 })
                ),
                React.createElement(
                    "button",
                    { onClick: () => saveDocument("Draft"), className: "save-btn" },
                    React.createElement(FiSave, null),
                    " Save"
                ),
                React.createElement(
                    "button",
                    { onClick: () => saveDocument("Published"), className: "publish-btn" },
                    "Publish"
                ),
                React.createElement(
                    "button",
                    { onClick: () => setShowPreview((p) => !p), className: "preview-btn" },
                    React.createElement(FiEye, null),
                    " ",
                    showPreview ? "Edit" : "Preview"
                )
            )
        ),
        // Main Editor Layout
        React.createElement(
            "div",
            { className: "workspace-editor-layout" },
            // Left Panel - Insert Tools
            React.createElement(
                "aside",
                { className: "insert-panel" },
                React.createElement("h4", null, "Insert"),
                React.createElement(
                    "button",
                    {
                        onClick: () => setShowHeadingMenu((prev) => !prev),
                        className: "insert-btn",
                        title: "Heading styles",
                    },
                    React.createElement(FiType, { size: 16 }),
                    " Heading",
                    React.createElement(FiChevronDown, { size: 14 })
                ),
                showHeadingMenu && React.createElement(
                    "div",
                    { className: "heading-submenu" },
                    React.createElement(
                        "button",
                        {
                            className: "insert-sub-btn",
                            onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()),
                        },
                        "Heading 1"
                    ),
                    React.createElement(
                        "button",
                        {
                            className: "insert-sub-btn",
                            onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()),
                        },
                        "Heading 2"
                    ),
                    React.createElement(
                        "button",
                        {
                            className: "insert-sub-btn",
                            onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()),
                        },
                        "Heading 3"
                    )
                ),
                React.createElement(
                    "button",
                    { onClick: () => addBlock("paragraph"), className: "insert-btn", title: "Add a text block" },
                    React.createElement(FiType, { size: 16 }),
                    " Text"
                ),
                React.createElement(
                    "button",
                    {
                        onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleBold().run()),
                        className: "insert-btn",
                        title: "Bold selected text",
                    },
                    React.createElement(FiBold, { size: 16 }),
                    " Bold"
                ),
                React.createElement(
                    "button",
                    {
                        onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleItalic().run()),
                        className: "insert-btn",
                        title: "Italic selected text",
                    },
                    React.createElement(FiItalic, { size: 16 }),
                    " Italic"
                ),
                React.createElement(
                    "button",
                    {
                        onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleUnderline().run()),
                        className: "insert-btn",
                        title: "Underline selected text",
                    },
                    React.createElement(FiUnderline, { size: 16 }),
                    " Underline"
                ),
                React.createElement(
                    "button",
                    {
                        onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleBulletList().run()),
                        className: "insert-btn",
                        title: "Bullet list for selected text",
                    },
                    React.createElement(FiList, { size: 16 }),
                    " Bullet List"
                ),
                React.createElement(
                    "button",
                    {
                        onClick: () => applyToFocusedTextEditor((editor) => editor.chain().focus().toggleOrderedList().run()),
                        className: "insert-btn",
                        title: "Numbered list for selected text",
                    },
                    React.createElement(FiList, { size: 16 }),
                    " Number List"
                ),
                React.createElement(
                    "button",
                    { onClick: () => addBlock("code"), className: "insert-btn", title: "Add a code block" },
                    React.createElement(FiCode, { size: 16 }),
                    " Code Block"
                ),
                React.createElement(
                    "button",
                    { onClick: () => addBlock("image"), className: "insert-btn", title: "Add an image" },
                    React.createElement(FiImage, { size: 16 }),
                    " Image"
                ),
                React.createElement(
                    "button",
                    { onClick: () => addBlock("video"), className: "insert-btn", title: "Add a video" },
                    React.createElement(FiVideo, { size: 16 }),
                    " Video"
                ),
                React.createElement(
                    "button",
                    { onClick: () => addBlock("divider"), className: "insert-btn", title: "Add a divider" },
                    React.createElement(FiMinus, { size: 16 }),
                    " Divider"
                )
            ),
            // Main Editor Area with Drag & Drop
            React.createElement(
                "section",
                { className: "editor-main" },
                showPreview
                    ? React.createElement(
                        "div",
                        { className: "editor-preview" },
                        React.createElement(PreviewContent, { blocks: doc.blocks })
                    )
                    : React.createElement(
                        DndContext,
                        {
                            sensors: sensors,
                            collisionDetection: closestCenter,
                            onDragEnd: handleDragEnd,
                        },
                        React.createElement(
                            SortableContext,
                            {
                                items: doc.blocks.map(b => b.id),
                                strategy: verticalListSortingStrategy,
                            },
                            React.createElement(
                                "div",
                                { className: "blocks-container" },
                                doc.blocks.length === 0
                                    ? React.createElement(
                                        "div",
                                        { className: "empty-state" },
                                        React.createElement("p", null, "Start writing... Click \"Insert\" to add content")
                                    )
                                    : doc.blocks.map((block) =>
                                        React.createElement(BlockEditor, {
                                            key: block.id,
                                            block: block,
                                            onUpdate: (content) => updateBlock(block.id, content),
                                            onDelete: () => deleteBlock(block.id),
                                            isFocused: focusedBlockId === block.id,
                                            onFocus: () => setFocusedBlockId(block.id),
                                            onUploadState: setSaveState,
                                            onTextEditorReady: (editor) => {
                                                textEditorsRef.current[block.id] = editor;
                                            },
                                        })
                                    )
                            )
                        )
                    )
            ),
            // Right Panel - Settings
            React.createElement(
                "aside",
                { className: "settings-panel" },
                React.createElement("h4", null, "Document"),
                React.createElement(
                    "label",
                    null,
                    "Status",
                    React.createElement(
                        "select",
                        {
                            value: doc.status,
                            onChange: (e) => {
                                setDoc((prev) => ({ ...prev, status: e.target.value }));
                                markDirty();
                            },
                        },
                        React.createElement("option", null, "Draft"),
                        React.createElement("option", null, "Published")
                    )
                ),
                React.createElement(
                    "label",
                    null,
                    "Visibility",
                    React.createElement(
                        "select",
                        {
                            value: doc.visibility,
                            onChange: (e) => {
                                setDoc((prev) => ({ ...prev, visibility: e.target.value }));
                                markDirty();
                            },
                        },
                        React.createElement("option", null, "Public"),
                        React.createElement("option", null, "Private")
                    )
                ),
                React.createElement(
                    "label",
                    null,
                    "Category",
                    React.createElement(
                        "select",
                        {
                            value: doc.category,
                            onChange: (e) => {
                                setDoc((prev) => ({ ...prev, category: e.target.value }));
                                markDirty();
                            },
                        },
                        CATEGORIES.map((item) => React.createElement("option", { key: item }, item))
                    )
                ),
                React.createElement("label", null, "Tags"),
                React.createElement(
                    "div",
                    { className: "tag-input-row" },
                    React.createElement("input", {
                        value: tagInput,
                        onChange: (e) => setTagInput(e.target.value),
                        onKeyPress: (e) => e.key === "Enter" && addTag(),
                        placeholder: "Add tag",
                    }),
                    React.createElement("button", { onClick: addTag }, "Add")
                ),
                React.createElement(
                    "div",
                    { className: "tags-wrap" },
                    doc.tags.map((tag) =>
                        React.createElement(
                            "span",
                            { key: tag, className: "tag-badge" },
                            tag,
                            React.createElement(
                                "button",
                                { onClick: () => removeTag(tag), className: "tag-remove" },
                                React.createElement(FiX, { size: 12 })
                            )
                        )
                    )
                ),
                React.createElement(
                    "label",
                    null,
                    "Featured Image",
                    React.createElement("input", {
                        value: doc.featuredImage,
                        onChange: (e) => {
                            setDoc((prev) => ({ ...prev, featuredImage: e.target.value }));
                            markDirty();
                        },
                        placeholder: "Image URL",
                    })
                ),
                doc.featuredImage &&
                React.createElement(
                    "div",
                    { className: "featured-image-preview" },
                    React.createElement("img", { src: doc.featuredImage, alt: "Featured" })
                ),
                React.createElement(
                    "div",
                    { className: "stats-box" },
                    React.createElement("p", null, "Words ", React.createElement("b", null, wordCount)),
                    React.createElement("p", null, "Reading Time ", React.createElement("b", null, readingTime, " min")),
                    React.createElement("p", null, "Updated ", React.createElement("b", null, lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "-"))
                )
            )
        )
    );
}

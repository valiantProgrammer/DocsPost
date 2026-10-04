"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, ReactNodeViewRenderer } from "@tiptap/react";
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
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import toast, { Toaster } from "react-hot-toast";

// Internal extensions and hooks
import { Callout } from "./extensions/Callout";
import { VideoEmbed } from "./extensions/VideoEmbed";
import { CodeBlockNode } from "./extensions/CodeBlockNode";
import { useOutline } from "./hooks/useOutline";
import { useScrollSpy } from "./hooks/useScrollSpy";
import { useSlug } from "./hooks/useSlug";
import { useAutosave } from "./hooks/useAutosave";

// UI Components
import AppNavbar from "../layout/AppNavbar";
import OutlinePane from "./OutlinePane";
import DocumentHeader from "./DocumentHeader";
import EditorToolbar from "./EditorToolbar";
import EditorCanvas from "./EditorCanvas";
import PreviewPane from "./PreviewPane";
import SettingsPane from "./SettingsPane";
import SearchPalette from "./SearchPalette";

// Stylesheet
import "./editor.css";

// Rich starter HTML content that renders exact screenshot nodes (Headings with #, Callout box, Code blocks with syntax & line numbers)
const DEFAULT_STARTER_CONTENT = `
<h1>Introduction</h1>
<p>FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.8+ based on standard <code>Python type hints</code>.</p>
<p>In this guide, we'll learn how to build <strong>production-ready APIs</strong> using FastAPI, covering everything from project setup to <strong>authentication, database integration</strong>, and <strong>deployment</strong>.</p>
<div data-callout-type="info" data-callout-title="What you will learn">
  <ul>
    <li>Set up a FastAPI project from scratch</li>
    <li>Build and structure API endpoints</li>
    <li>Implement authentication with JWT</li>
    <li>Integrate with a database using SQLModel</li>
    <li>Deploy your API using Docker</li>
  </ul>
</div>
<h2>Project Setup</h2>
<p>First, let's create a new FastAPI project and install the required dependencies.</p>
<pre><code class="language-bash"># Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install FastAPI and dependencies
pip install fastapi uvicorn sqlmodel python-jose[cryptography]</code></pre>
<h2>Building a Simple API</h2>
<p>Let's create a simple API with a few endpoints.</p>
<pre><code class="language-python">from fastapi import FastAPI

app = FastAPI(title="DocsPost API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Hello, DocsPost!"}</code></pre>
`;

export default function WorkspaceEditor({ userEmail, documentId }) {
    const router = useRouter();

    // Document state
    const [docId, setDocId] = useState(documentId || "");
    const [title, setTitle] = useState("Building Production-Ready APIs with FastAPI");
    const [description, setDescription] = useState(
        "A complete guide to building modern, scalable and secure APIs using FastAPI. Learn best practices, authentication, deployment and more."
    );
    const [category, setCategory] = useState("Backend Development");
    const [tags, setTags] = useState(["Python", "FastAPI", "Backend", "API", "Web Development"]);
    const [coverImage, setCoverImage] = useState(
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
    );
    const [visibility, setVisibility] = useState("Public");
    const [publishStatus, setPublishStatus] = useState("Draft");
    const [advancedSettings, setAdvancedSettings] = useState({
        allowComments: true,
        showToc: true,
        seoTitle: "",
        seoDescription: "",
        scheduledPublishDate: null,
    });
    const [updatedAt, setUpdatedAt] = useState(new Date("2025-04-20T10:30:00Z"));
    const [wordCount, setWordCount] = useState(1245);

    // Editor & UI state
    const [isPreview, setIsPreview] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(Boolean(documentId));
    const [loadError, setLoadError] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const hasLoadedRef = useRef(!documentId);

    const [spellcheckEnabled, setSpellcheckEnabled] = useState(false);

    // Slug management hook
    const { slug, setSlug, setInitialSlug, status: slugStatus } = useSlug(
        title,
        "building-production-ready-apis-with-fastapi",
        docId
    );

    // TipTap Editor instance
    const editor = useEditor({
        immediatelyRender: false,
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
            Placeholder.configure({
                placeholder: "Start writing, or type / for blocks",
            }),
            CharacterCount,
            Markdown.configure({
                html: true,
                tightLists: true,
            }),
        ],
        editorProps: {
            attributes: {
                class: "docspost-content",
                spellcheck: spellcheckEnabled ? "true" : "false",
            },
        },
        content: documentId ? "" : DEFAULT_STARTER_CONTENT,
        onUpdate: ({ editor: ed }) => {
            setIsDirty(true);
            const count = ed.storage.characterCount?.words() || 0;
            if (count > 0) setWordCount(count);
        },
    });

    useEffect(() => {
        if (editor?.view?.dom) {
            editor.view.dom.setAttribute("spellcheck", spellcheckEnabled ? "true" : "false");
        }
    }, [editor, spellcheckEnabled]);

    // Update word count once editor initializes
    useEffect(() => {
        if (editor) {
            const count = editor.storage.characterCount?.words();
            if (count) setWordCount(count);
        }
    }, [editor]);

    // Load existing document once on mount when editor and documentId are ready
    const fetchDocument = useCallback(async () => {
        if (!documentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError("");
        try {
            const res = await fetch(`/api/documents/get-document?documentId=${documentId}`);
            const data = await res.json();

            if (!res.ok || !data.document) {
                throw new Error(data.error || "Failed to load document");
            }

            const doc = data.document;
            setTitle(doc.title || "Untitled Document");
            setDescription(doc.description || "");
            setCategory(doc.category || "Backend Development");
            setTags(doc.tags || []);
            setCoverImage(doc.featuredImage || "");
            setVisibility(doc.visibility || "Public");
            setPublishStatus(doc.status || "Draft");
            if (doc.slug) setInitialSlug(doc.slug);
            if (doc.advancedSettings) setAdvancedSettings(doc.advancedSettings);
            if (doc.updatedAt) setUpdatedAt(new Date(doc.updatedAt));

            if (editor?.commands) {
                if (doc.contentJson) {
                    editor.commands.setContent(doc.contentJson, { emitUpdate: false });
                } else if (doc.content) {
                    editor.commands.setContent(doc.content, { emitUpdate: false });
                }
                const count = editor.storage.characterCount?.words() || 0;
                if (count > 0) setWordCount(count);
            }
        } catch (err) {
            console.error("Fetch document error:", err);
            setLoadError(err.message || "Failed to load document");
        } finally {
            setLoading(false);
        }
    }, [documentId, editor, setInitialSlug]);

    useEffect(() => {
        if (editor && documentId && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            fetchDocument();
        }
    }, [editor, documentId, fetchDocument]);

    const handleRetryFetch = () => {
        hasLoadedRef.current = false;
        fetchDocument();
    };

    // Save handler (POST for new doc, PUT for existing doc)
    const handleSave = useCallback(async (extraData = {}) => {
        if (!title.trim()) {
            return { error: "Title is required" };
        }

        let currentMarkdown = "";
        try {
            currentMarkdown = editor?.storage?.markdown ? editor.storage.markdown.getMarkdown() : "";
        } catch (err) {
            console.warn("Markdown serialization error ignored:", err);
        }

        const currentJson = editor ? editor.getJSON() : null;
        const computedCount = editor?.storage?.characterCount?.words() || wordCount;

        const payload = {
            documentId: docId || undefined,
            title: title.trim(),
            slug,
            description,
            content: currentMarkdown,
            contentJson: currentJson,
            category,
            visibility,
            tags,
            featuredImage: coverImage,
            status: extraData.status || publishStatus,
            wordCount: computedCount,
            advancedSettings,
            userEmail,
        };

        const isNew = !docId;
        const url = isNew ? "/api/documents/create-document" : "/api/documents/update-document";
        const method = isNew ? "POST" : "PUT";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Save failed");
        }

        setIsDirty(false);

        if (isNew && data.documentId) {
            setDocId(data.documentId);
            if (data.slug) setSlug(data.slug);
            window.history.replaceState(null, "", `/workspace/${data.documentId}`);
        }

        if (data.updatedAt) {
            setUpdatedAt(new Date(data.updatedAt));
        }

        return { success: true };
    }, [docId, title, slug, description, editor, wordCount, category, visibility, tags, coverImage, publishStatus, advancedSettings, userEmail, setSlug]);

    // Real autosave hook with 2s debounce
    const { saveState, lastSavedAt, triggerSave } = useAutosave({
        isDirty,
        onSave: handleSave,
        delay: 2000,
    });

    // Outline & scroll spy
    const headings = useOutline(editor);
    const [activeId, setActiveId] = useScrollSpy(headings);

    const handleHeadingClick = (heading) => {
        setActiveId(heading.id);
        if (!editor) return;

        const pos = heading.pos;
        editor.commands.focus(pos);

        setTimeout(() => {
            const dom = editor.view.domAtPos(pos)?.node;
            const headingEl = dom?.nodeType === 1 ? dom : dom?.parentElement;
            if (headingEl) {
                headingEl.scrollIntoView({ behavior: "smooth", block: "center" });
                headingEl.classList.remove("heading-flash");
                void headingEl.offsetWidth;
                headingEl.classList.add("heading-flash");
            }
        }, 50);
    };

    const handleAddSection = () => {
        if (!editor) return;
        editor.chain().focus("end").insertContent("\n<h2>Untitled section</h2>\n").run();
        setIsDirty(true);
    };

    // Publish action
    const handlePublish = async () => {
        if (!title.trim() || !category) {
            toast.error("Title and category are required to publish.");
            return;
        }

        try {
            const nextStatus = "Published";
            await handleSave({ status: nextStatus });
            setPublishStatus(nextStatus);
            toast.success("Document published successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to publish");
        }
    };

    // Unpublish action
    const handleUnpublish = async () => {
        try {
            await handleSave({ status: "Draft" });
            setPublishStatus("Draft");
            toast.success("Document moved to drafts.");
        } catch (err) {
            toast.error("Failed to unpublish");
        }
    };

    // Copy public link
    const handleCopyLink = () => {
        if (typeof window === "undefined") return;
        const publicUrl = `${window.location.origin}/docs/${slug || docId}`;
        navigator.clipboard.writeText(publicUrl);
        toast.success("Public link copied to clipboard!");
    };

    // Export markdown file
    const handleExportMarkdown = () => {
        if (!editor) return;
        const md = editor.storage.markdown?.getMarkdown() || "";
        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug || "document"}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Markdown exported!");
    };

    // Duplicate document
    const handleDuplicate = async () => {
        try {
            const currentMarkdown = editor ? editor.storage.markdown?.getMarkdown() : "";
            const res = await fetch("/api/documents/create-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `${title} (Copy)`,
                    content: currentMarkdown,
                    description,
                    category,
                    tags,
                    featuredImage: coverImage,
                    status: "Draft",
                    userEmail,
                }),
            });
            const data = await res.json();
            if (data.documentId) {
                toast.success("Document duplicated!");
                router.push(`/workspace/${data.documentId}`);
            }
        } catch {
            toast.error("Failed to duplicate document");
        }
    };

    // Delete document
    const handleDelete = async () => {
        if (!docId) {
            router.push("/workspace");
            return;
        }

        try {
            const res = await fetch(`/api/documents/delete-document?documentId=${docId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Document deleted");
                router.push("/workspace");
            } else {
                toast.error("Failed to delete document");
            }
        } catch {
            toast.error("Error deleting document");
        }
    };

    // Global keyboard shortcuts (Ctrl+K search, Ctrl+Shift+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
                return;
            }

            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                if (!editor?.isFocused) {
                    e.preventDefault();
                    setSearchOpen((prev) => !prev);
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [editor]);

    // Validation checks for publish button
    const isPublishDisabled = !title.trim() || !category || slugStatus.state === "taken";
    let publishTooltip = "";
    if (!title.trim()) publishTooltip = "Title is required";
    else if (!category) publishTooltip = "Category is required";
    else if (slugStatus.state === "taken") publishTooltip = "Slug is already taken";

    // Insert media dialog prompts
    const handleInsertImage = () => {
        const url = window.prompt("Enter image URL:");
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleInsertVideo = () => {
        const url = window.prompt("Enter YouTube or Vimeo video URL:");
        if (url && editor) {
            editor.chain().focus().setVideoEmbed({ src: url }).run();
        }
    };

    const handleInsertTable = () => {
        if (editor) {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }
    };

    if (loading) {
        return (
            <div className="workspace-page-wrapper">
                <AppNavbar userEmail={userEmail} onSearchClick={() => setSearchOpen(true)} />
                <div style={{ padding: "40px", textAlign: "center", color: "var(--editor-muted)" }}>
                    <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid var(--editor-border)", borderTopColor: "var(--editor-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: "16px", fontSize: "14px" }}>Loading document...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="workspace-page-wrapper">
                <AppNavbar userEmail={userEmail} onSearchClick={() => setSearchOpen(true)} />
                <div style={{ padding: "60px 20px", maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
                    <h3 style={{ fontSize: "18px", color: "var(--editor-danger)", marginBottom: "8px" }}>Failed to Load Document</h3>
                    <p style={{ fontSize: "14px", color: "var(--editor-muted)", marginBottom: "20px" }}>{loadError}</p>
                    <button
                        type="button"
                        onClick={handleRetryFetch}
                        className="btn-publish-main"
                        style={{ margin: "0 auto" }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="workspace-page-wrapper">
            <Toaster position="top-right" />

            {/* Top Navbar matching screenshot */}
            <AppNavbar
                userEmail={userEmail}
                onSearchClick={() => setSearchOpen(true)}
            />

            {/* 3-Column Workspace Grid */}
            <main className="workspace-main-container">
                {/* 1. Left: Document Outline */}
                <OutlinePane
                    headings={headings}
                    activeId={activeId}
                    onHeadingClick={handleHeadingClick}
                    onAddSection={handleAddSection}
                />

                {/* 2. Center: Document Header + Editor Card */}
                <div className="center-document-column">
                    <DocumentHeader
                        title={title}
                        onTitleChange={(val) => { setTitle(val); setIsDirty(true); }}
                        description={description}
                        onDescriptionChange={(val) => { setDescription(val); setIsDirty(true); }}
                        tags={tags}
                        onTagsChange={(val) => { setTags(val); setIsDirty(true); }}
                        saveState={saveState}
                        lastSavedAt={lastSavedAt}
                        onRetrySave={triggerSave}
                        isPreview={isPreview}
                        onTogglePreview={() => setIsPreview(!isPreview)}
                        onPublish={handlePublish}
                        publishStatus={publishStatus}
                        isPublishDisabled={isPublishDisabled}
                        publishTooltip={publishTooltip}
                        updatedAt={updatedAt}
                        wordCount={wordCount}
                        onCopyLink={handleCopyLink}
                        onDuplicate={handleDuplicate}
                        onExportMarkdown={handleExportMarkdown}
                        onDelete={() => setDeleteModalOpen(true)}
                        onUnpublish={handleUnpublish}
                        spellcheckEnabled={spellcheckEnabled}
                        onToggleSpellcheck={() => setSpellcheckEnabled(!spellcheckEnabled)}
                    />

                    <div className="editor-card-wrapper">
                        {/* Sticky Toolbar */}
                        <EditorToolbar
                            editor={editor}
                            isPreview={isPreview}
                            onTogglePreview={() => setIsPreview(!isPreview)}
                            onInsertImage={handleInsertImage}
                            onInsertVideo={handleInsertVideo}
                            onInsertTable={handleInsertTable}
                        />

                        {/* Editor Canvas or Preview */}
                        {isPreview ? (
                            <PreviewPane
                                contentJson={editor?.getJSON()}
                                content={editor?.storage?.markdown?.getMarkdown?.() || ""}
                            />
                        ) : (
                            <EditorCanvas editor={editor} />
                        )}
                    </div>
                </div>

                {/* 3. Right: Document Settings */}
                <SettingsPane
                    title={title}
                    onTitleChange={(val) => { setTitle(val); setIsDirty(true); }}
                    slug={slug}
                    onSlugChange={setSlug}
                    slugStatus={slugStatus}
                    description={description}
                    onDescriptionChange={(val) => { setDescription(val); setIsDirty(true); }}
                    coverImage={coverImage}
                    onCoverImageChange={(val) => { setCoverImage(val); setIsDirty(true); }}
                    tags={tags}
                    onTagsChange={(val) => { setTags(val); setIsDirty(true); }}
                    category={category}
                    onCategoryChange={(val) => { setCategory(val); setIsDirty(true); }}
                    visibility={visibility}
                    onVisibilityChange={(val) => { setVisibility(val); setIsDirty(true); }}
                    advancedSettings={advancedSettings}
                    onAdvancedSettingsChange={(val) => { setAdvancedSettings(val); setIsDirty(true); }}
                />
            </main>

            {/* Global Search Palette */}
            <SearchPalette
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

            {/* Confirm Delete Dialog */}
            {deleteModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setDeleteModalOpen(false)}
                >
                    <div
                        style={{
                            background: "var(--editor-card)",
                            borderRadius: "14px",
                            padding: "24px",
                            maxWidth: "400px",
                            width: "90%",
                            border: "1px solid var(--editor-border)",
                            boxShadow: "var(--editor-shadow-md)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px 0" }}>Delete Document?</h3>
                        <p style={{ fontSize: "13.5px", color: "var(--editor-muted)", margin: "0 0 20px 0", lineHeight: 1.5 }}>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="btn-preview-toggle"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="btn-publish-main"
                                style={{ background: "var(--editor-danger)" }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

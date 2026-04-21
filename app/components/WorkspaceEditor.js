"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiCode,
    FiImage,
    FiList,
    FiMinus,
    FiSave,
    FiType,
    FiVideo,
    FiEye,
} from "react-icons/fi";
import "./WorkspaceEditor.css";

const CATEGORIES = ["General", "DSA", "Web Development", "Backend", "Database", "DevOps"];

export default function WorkspaceEditor({ userEmail, documentId }) {
    const router = useRouter();
    const textareaRef = useRef(null);
    const [doc, setDoc] = useState({
        title: "",
        content: "",
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
            setDoc({
                title: d.title || "",
                content: d.content || "",
                status: d.status || "Draft",
                visibility: d.visibility || "Public",
                category: d.category || "General",
                tags: d.tags || [],
                featuredImage: d.featuredImage || "",
                description: d.description || "",
            });
            setLastUpdated(d.updatedAt || "");
        };

        load();
    }, [documentId, userEmail, router]);

    const wordCount = useMemo(() => (doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0), [doc.content]);
    const readingTime = Math.max(1, Math.ceil(wordCount / 220));

    const insertText = (snippet) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const next = doc.content.slice(0, start) + snippet + doc.content.slice(end);
        setDoc((prev) => ({ ...prev, content: next }));
        setSaveState("Saving...");
    };

    const applyTitle = (prefix) => insertText(`\n${prefix} `);

    const saveDocument = async (nextStatus = "Draft") => {
        if (!userEmail || !doc.title.trim()) {
            alert("Please add a title.");
            return;
        }

        setSaveState("Saving...");
        const payload = {
            documentId,
            userEmail,
            title: doc.title,
            description: doc.description || doc.content.slice(0, 140),
            content: doc.content,
            category: doc.category,
            status: nextStatus,
            visibility: doc.visibility,
            tags: doc.tags,
            featuredImage: doc.featuredImage,
        };

        const endpoint = documentId ? "/api/documents/update-document" : "/api/documents/create-document";
        const method = documentId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            setSaveState("Save failed");
            alert("Unable to save document.");
            return;
        }

        const result = await response.json();
        setSaveState("Saved");
        setDoc((prev) => ({ ...prev, status: nextStatus }));
        setLastUpdated(new Date().toISOString());

        if (!documentId && result.documentId) {
            router.replace(`/workspace/${result.documentId}`);
        }
    };

    const addTag = () => {
        const clean = tagInput.trim();
        if (!clean) return;
        if (!doc.tags.includes(clean)) {
            setDoc((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
            setSaveState("Saving...");
        }
        setTagInput("");
    };

    return (
        <div className="workspace-editor-page">
            <div className="workspace-editor-top">
                <button onClick={() => router.push("/workspace")} className="ghost-btn"><FiArrowLeft /> Back</button>
                <input
                    value={doc.title}
                    onChange={(e) => {
                        setDoc((prev) => ({ ...prev, title: e.target.value }));
                        setSaveState("Saving...");
                    }}
                    placeholder="Untitled Document"
                    className="title-input"
                />
                <div className="top-actions">
                    <span className="save-state"><FiCheckCircle /> {saveState}</span>
                    <button onClick={() => saveDocument("Draft")}><FiSave /> Save</button>
                    <button onClick={() => saveDocument("Published")} className="publish-btn">Publish</button>
                    <button onClick={() => setShowPreview((p) => !p)}><FiEye /> {showPreview ? "Edit" : "Preview"}</button>
                </div>
            </div>

            <div className="workspace-editor-layout">
                <aside className="insert-panel">
                    <h4>Insert</h4>
                    <button onClick={() => insertText("\n")}>Text</button>
                    <button onClick={() => applyTitle("#")}>Heading 1</button>
                    <button onClick={() => applyTitle("##")}>Heading 2</button>
                    <button onClick={() => insertText("\n- List item")}>List</button>
                    <button onClick={() => insertText("\n> Quote")}>Quote</button>
                    <button onClick={() => insertText("\n---\n")}><FiMinus /> Divider</button>
                    <button onClick={() => insertText("\n```javascript\n// code\n```\n")}><FiCode /> Code Block</button>
                    <button onClick={() => insertText("\n![alt text](https://)\n")}><FiImage /> Image</button>
                    <button onClick={() => insertText("\n<iframe src=\"https://www.youtube.com/embed/\" />\n")}><FiVideo /> Video</button>
                </aside>

                <section className="editor-main">
                    {showPreview ? (
                        <pre className="editor-preview">{doc.content || "Nothing to preview yet."}</pre>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={doc.content}
                            onChange={(e) => {
                                setDoc((prev) => ({ ...prev, content: e.target.value }));
                                setSaveState("Saving...");
                            }}
                            placeholder="Start writing your documentation..."
                        />
                    )}
                </section>

                <aside className="settings-panel">
                    <h4>Document</h4>
                    <label>Status
                        <select value={doc.status} onChange={(e) => setDoc((prev) => ({ ...prev, status: e.target.value }))}>
                            <option>Draft</option>
                            <option>Published</option>
                        </select>
                    </label>

                    <label>Visibility
                        <select value={doc.visibility} onChange={(e) => setDoc((prev) => ({ ...prev, visibility: e.target.value }))}>
                            <option>Public</option>
                            <option>Private</option>
                        </select>
                    </label>

                    <label>Category
                        <select value={doc.category} onChange={(e) => setDoc((prev) => ({ ...prev, category: e.target.value }))}>
                            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                        </select>
                    </label>

                    <label>Tags</label>
                    <div className="tag-input-row">
                        <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" />
                        <button onClick={addTag}>Add</button>
                    </div>
                    <div className="tags-wrap">
                        {doc.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>

                    <label>Featured Image
                        <input
                            value={doc.featuredImage}
                            onChange={(e) => setDoc((prev) => ({ ...prev, featuredImage: e.target.value }))}
                            placeholder="Image URL"
                        />
                    </label>

                    <div className="stats-box">
                        <p>Word Count <b>{wordCount}</b></p>
                        <p>Reading Time <b>{readingTime} min</b></p>
                        <p>Last Updated <b>{lastUpdated ? new Date(lastUpdated).toLocaleString() : "-"}</b></p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

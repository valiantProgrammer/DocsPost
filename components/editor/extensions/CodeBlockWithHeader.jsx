"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import Editor from "@monaco-editor/react";
import hljs from "highlight.js";
import {
    FiTerminal,
    FiCopy,
    FiCheck,
    FiCornerDownLeft,
    FiEdit3,
    FiFileText,
} from "react-icons/fi";

const LANGUAGES = [
    { value: "javascript", label: "javascript" },
    { value: "typescript", label: "typescript" },
    { value: "python", label: "python" },
    { value: "bash", label: "bash" },
    { value: "html", label: "html" },
    { value: "css", label: "css" },
    { value: "json", label: "json" },
    { value: "sql", label: "sql" },
    { value: "markdown", label: "markdown" },
    { value: "go", label: "go" },
    { value: "rust", label: "rust" },
    { value: "c", label: "c" },
    { value: "cpp", label: "c++" },
    { value: "java", label: "java" },
];

const mapToMonacoLanguage = (lang) => {
    switch (lang) {
        case "bash":
        case "sh":
        case "zsh":
            return "shell";
        case "js":
            return "javascript";
        case "ts":
            return "typescript";
        case "py":
            return "python";
        default:
            return lang || "javascript";
    }
};

export default function CodeBlockWithHeader({
    node,
    updateAttributes,
    extension,
    editor,
    getPos,
}) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const language = node?.attrs?.language || "javascript";
    const initialText = node?.textContent || "";

    const [codeValue, setCodeValue] = useState(initialText);
    const monacoRef = useRef(null);
    const editorInstanceRef = useRef(null);
    const currentCodeRef = useRef(initialText);

    // Initial estimated height based on code size (line count * line height + padding)
    const lineCount = useMemo(() => {
        const lines = (codeValue || "").split("\n").length;
        return Math.max(lines, 1);
    }, [codeValue]);

    const [editorHeight, setEditorHeight] = useState(() => {
        const lines = (initialText || "").split("\n").length;
        return `${Math.max(lines * 21 + 24, 70)}px`;
    });

    // Synchronize if node text changes externally (e.g. undo/redo, template load)
    useEffect(() => {
        const text = node?.textContent ?? "";
        if (text !== currentCodeRef.current) {
            currentCodeRef.current = text;
            setCodeValue(text);
            if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== text) {
                editorInstanceRef.current.setValue(text);
            }
        }
    }, [node?.textContent]);

    // Recalculate Monaco height to fit exact code size dynamically
    const updateMonacoHeight = useCallback((ed) => {
        const target = ed || editorInstanceRef.current;
        if (!target) return;
        try {
            const contentHeight = target.getContentHeight();
            const fitHeight = Math.max(contentHeight, 55);
            setEditorHeight(`${fitHeight}px`);
            target.layout();
        } catch {
            // ignore layout exceptions
        }
    }, []);

    const handleEditorMount = (monacoEditor, monaco) => {
        editorInstanceRef.current = monacoEditor;
        monacoRef.current = monaco;

        // Auto resize height dynamically whenever content changes
        monacoEditor.onDidContentSizeChange(() => {
            updateMonacoHeight(monacoEditor);
        });

        // Mod-Enter shortcut to exit block and create paragraph
        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleExitBlock();
        });

        // Escape key to finish editing and return to static view
        monacoEditor.addCommand(monaco.KeyCode.Escape, () => {
            setIsEditing(false);
        });

        updateMonacoHeight(monacoEditor);
        monacoEditor.focus();
    };

    // When typing in Monaco, update TipTap document model
    const handleMonacoChange = (val) => {
        const newText = val ?? "";
        currentCodeRef.current = newText;
        setCodeValue(newText);

        if (typeof getPos === "function" && editor?.state?.doc) {
            try {
                const pos = getPos();
                if (typeof pos === "number") {
                    const currentNode = editor.state.doc.nodeAt(pos);
                    if (currentNode && currentNode.textContent !== newText) {
                        const tr = editor.state.tr;
                        const from = pos + 1;
                        const to = pos + currentNode.nodeSize - 1;
                        if (newText) {
                            tr.replaceWith(from, to, editor.schema.text(newText));
                        } else {
                            tr.delete(from, to);
                        }
                        tr.setMeta("addToHistory", true);
                        editor.view.dispatch(tr);
                    }
                }
            } catch (err) {
                console.error("Error updating TipTap doc:", err);
            }
        }
    };

    const handleLanguageChange = (newLang) => {
        updateAttributes({ language: newLang });
        if (monacoRef.current && editorInstanceRef.current) {
            const model = editorInstanceRef.current.getModel();
            if (model) {
                monacoRef.current.editor.setModelLanguage(model, mapToMonacoLanguage(newLang));
            }
        }
    };

    const handleCopy = (e) => {
        e?.stopPropagation();
        const textToCopy = currentCodeRef.current || node?.textContent || "";
        if (!navigator?.clipboard) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExitBlock = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEditing(false);
        if (!editor) return;

        if (typeof getPos === "function" && editor?.state?.doc) {
            try {
                const pos = getPos();
                if (typeof pos === "number") {
                    const currentNode = editor.state.doc.nodeAt(pos);
                    const endPos = pos + (currentNode ? currentNode.nodeSize : 0);
                    editor
                        .chain()
                        .focus()
                        .insertContentAt(endPos, { type: "paragraph" })
                        .setTextSelection(endPos + 1)
                        .run();
                    return;
                }
            } catch {
                // fall back to exitCode
            }
        }

        editor.chain().focus().exitCode().run();
    };

    // Pre-highlight code for static view
    const highlightedStaticCode = useMemo(() => {
        if (!codeValue) return "";
        try {
            if (language && hljs.getLanguage(language)) {
                return hljs.highlight(codeValue, { language, ignoreIllegals: true }).value;
            }
            return hljs.highlightAuto(codeValue).value;
        } catch {
            return codeValue;
        }
    }, [codeValue, language]);

    return (
        <NodeViewWrapper className={`codeblock-card ${isEditing ? "is-editing" : ""}`}>
            <div className="codeblock-header" contentEditable={false}>
                {isEditing ? (
                    <div className="codeblock-badge">
                        <FiFileText className="codeblock-badge-icon" />
                        <select
                            className="codeblock-lang-select"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            aria-label="Code language"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                        <span className="codeblock-monaco-badge">Monaco</span>
                    </div>
                ) : (
                    <div className="codeblock-badge" onClick={() => setIsEditing(true)} title="Click to edit with Monaco">
                        <FiFileText className="codeblock-badge-icon" />
                        <span className="codeblock-badge-text">{language}</span>
                    </div>
                )}

                <div className="codeblock-actions">
                    {isEditing && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="codeblock-pill-btn"
                                title="Close Monaco editor (or press Esc)"
                                aria-label="Close editor"
                            >
                                <FiCheck style={{ fontSize: "13px", color: "#22C55E" }} />
                                <span>Done</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleExitBlock}
                                className="codeblock-pill-btn"
                                title="Exit to new paragraph below (Ctrl+Enter)"
                                aria-label="Exit code block"
                            >
                                <FiCornerDownLeft style={{ fontSize: "13px" }} />
                                <span>Exit</span>
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="codeblock-pill-btn"
                        aria-label="Copy code to clipboard"
                    >
                        {copied ? (
                            <>
                                <FiCheck style={{ fontSize: "13px", color: "#22C55E" }} />
                                <span style={{ color: "#22C55E" }}>Copied!</span>
                            </>
                        ) : (
                            <>
                                <FiCopy style={{ fontSize: "13px" }} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div contentEditable={false}>
                {isEditing ? (
                    <div className="codeblock-monaco-wrapper" style={{ height: editorHeight }}>
                        <Editor
                            height={editorHeight}
                            language={mapToMonacoLanguage(language)}
                            value={codeValue}
                            theme="vs-dark"
                            onMount={handleEditorMount}
                            onChange={handleMonacoChange}
                            options={{
                                readOnly: false,
                                minimap: { enabled: false },
                                fontSize: 13.5,
                                lineHeight: 21,
                                fontFamily: "var(--font-mono), 'JetBrains Mono', Consolas, monospace",
                                lineNumbers: "on",
                                lineNumbersMinChars: 3,
                                glyphMargin: false,
                                folding: false,
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                automaticLayout: true,
                                tabSize: 4,
                                insertSpaces: true,
                                padding: { top: 10, bottom: 10 },
                                scrollbar: {
                                    vertical: "hidden",
                                    horizontal: "auto",
                                    alwaysConsumeMouseWheel: false,
                                },
                                overviewRulerLanes: 0,
                                renderLineHighlight: "line",
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="codeblock-body codeblock-clickable"
                        onClick={() => setIsEditing(true)}
                        title="Click to edit with Monaco Editor"
                    >
                        <div className="codeblock-gutter">
                            {Array.from({ length: lineCount }).map((_, idx) => (
                                <div key={idx}>{idx + 1}</div>
                            ))}
                        </div>
                        <div className="codeblock-content-area">
                            <pre>
                                <code
                                    className="hljs"
                                    dangerouslySetInnerHTML={{ __html: highlightedStaticCode }}
                                />
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
}

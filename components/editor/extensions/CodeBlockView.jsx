"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import Editor, { loader } from "@monaco-editor/react";
import {
    FiTerminal,
    FiFileText,
    FiCopy,
    FiCheck,
    FiEdit2,
} from "react-icons/fi";
import { normalizeCode, highlightCodeToTokens } from "../../../lib/shikiTheme";
import "./CodeBlockView.css";

// Configure self-hosted Monaco loader
if (typeof window !== "undefined") {
    loader.config({ paths: { vs: "/monaco/vs" } });
}

const SUPPORTED_LANGUAGES = [
    { value: "bash", label: "bash", isTerminal: true },
    { value: "shell", label: "shell", isTerminal: true },
    { value: "python", label: "python" },
    { value: "javascript", label: "javascript" },
    { value: "typescript", label: "typescript" },
    { value: "json", label: "json" },
    { value: "sql", label: "sql" },
    { value: "yaml", label: "yaml" },
    { value: "html", label: "html" },
    { value: "css", label: "css" },
    { value: "dockerfile", label: "dockerfile" },
    { value: "markdown", label: "markdown" },
    { value: "plaintext", label: "plaintext" },
];

function mapToMonacoLanguage(lang) {
    const l = (lang || "").toLowerCase();
    switch (l) {
        case "bash":
        case "sh":
        case "zsh":
        case "shell":
            return "shell";
        case "js":
            return "javascript";
        case "ts":
            return "typescript";
        case "py":
            return "python";
        case "yml":
            return "yaml";
        default:
            return l || "plaintext";
    }
}

function defineMonacoTheme(monaco) {
    monaco.editor.defineTheme("docspost-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "comment", foreground: "5CC77A", fontStyle: "italic" },
            { token: "keyword", foreground: "F59E57" },
            { token: "string", foreground: "7DD87F" },
            { token: "number", foreground: "FBBF24" },
            { token: "delimiter", foreground: "94A3B8" },
            { token: "type", foreground: "F97362" },
            { token: "function", foreground: "F97362" },
            { token: "variable", foreground: "E2E8F0" },
        ],
        colors: {
            "editor.background": "#0F172A",
            "editor.foreground": "#E2E8F0",
            "editor.lineHighlightBackground": "#1E293B44",
            "editorLineNumber.foreground": "#475569",
            "editorLineNumber.activeForeground": "#94A3B8",
            "editorGutter.background": "#0F172A",
            "editorCursor.foreground": "#3B82F6",
        },
    });
}

/**
 * Universal CodeBlockView component.
 * Can be used as a TipTap node view, in Preview mode, or on the public page / ReactMarkdown.
 */
export default function CodeBlockView(props) {
    const {
        node,
        updateAttributes,
        extension,
        editor,
        getPos,
        selected,
        inline,
        className,
        children,
        code: propCode,
        language: propLang,
        ...restProps
    } = props;

    // Detect inline code snippet in Markdown
    const isExplicitInline = inline === true;
    const rawChildrenString = typeof children === "string" ? children : "";
    const hasLanguageClass = Boolean(className && /language-(\w+)/.test(className));
    const isBlockCode =
        Boolean(node) ||
        inline === false ||
        hasLanguageClass ||
        rawChildrenString.includes("\n") ||
        propCode !== undefined;

    if (isExplicitInline || (!isBlockCode && children)) {
        return (
            <code className="inline-code" {...restProps}>
                {children}
            </code>
        );
    }

    // Resolve language and code from either TipTap node or direct props
    const language =
        node?.attrs?.language ||
        propLang ||
        (className ? /language-(\w+)/.exec(className)?.[1] : null) ||
        "bash";

    const rawCode =
        node?.attrs?.code !== undefined
            ? node.attrs.code
            : propCode !== undefined
            ? propCode
            : rawChildrenString;

    const normalizedCode = useMemo(() => normalizeCode(rawCode), [rawCode]);

    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [localCode, setLocalCode] = useState(normalizedCode);
    const [isHovered, setIsHovered] = useState(false);
    const [editorHeight, setEditorHeight] = useState(85);

    const debounceTimerRef = useRef(null);
    const monacoInstanceRef = useRef(null);
    const monacoRef = useRef(null);
    const wrapperRef = useRef(null);

    const isTerminalLang = language === "bash" || language === "shell" || language === "sh";

    // Keep localCode in sync if prop changes
    useEffect(() => {
        setLocalCode(normalizeCode(rawCode));
    }, [rawCode]);

    // Tokenized lines
    const lines = useMemo(() => normalizeCode(localCode).split("\n"), [localCode]);

    // Initialize token lines synchronously from lines so there is zero layout shift
    const [tokenLines, setTokenLines] = useState(() =>
        lines.map((line) => (line.length > 0 ? [{ content: line, color: "#E2E8F0" }] : []))
    );

    // Run Shiki highlighting to get full syntax tokens
    useEffect(() => {
        let isMounted = true;
        const currentCode = normalizeCode(localCode);
        const fallbackLines = currentCode.split("\n");

        highlightCodeToTokens(currentCode, language).then((tokens) => {
            if (isMounted) {
                if (Array.isArray(tokens) && tokens.length === fallbackLines.length) {
                    setTokenLines(tokens);
                } else {
                    setTokenLines(
                        fallbackLines.map((l) =>
                            l.length > 0 ? [{ content: l, color: "#E2E8F0" }] : []
                        )
                    );
                }
            }
        });

        return () => {
            isMounted = false;
        };
    }, [localCode, language]);

    // Gutter width calculation
    const digits = String(lines.length).length;
    const gutterWidth = `calc(max(2, ${digits}) * 1ch + 24px)`;

    // Keyboard trigger: Enter when node is selected opens edit mode
    useEffect(() => {
        if (selected && !isEditing && editor?.isEditable) {
            const handleKeyDown = (e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    setIsEditing(true);
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [selected, isEditing, editor?.isEditable]);

    // Click outside to exit edit mode
    useEffect(() => {
        if (!isEditing) return;
        const handleOutsideClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                handleExitEdit();
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isEditing, localCode]);

    const updateHeight = useCallback((ed) => {
        if (!ed) return;
        try {
            const contentHeight = ed.getContentHeight();
            const minHeight = 85;
            const maxHeight = 620;
            const targetHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
            setEditorHeight(targetHeight);
            ed.layout();
        } catch {
            // ignore layout errors
        }
    }, []);

    const handleMonacoMount = (monacoEditor, monaco) => {
        monacoInstanceRef.current = monacoEditor;
        monacoRef.current = monaco;
        defineMonacoTheme(monaco);
        monaco.editor.setTheme("docspost-dark");

        const model = monacoEditor.getModel();
        if (model) {
            model.setEOL(monaco.editor.EndOfLineSequence.LF);
        }

        monacoEditor.onDidContentSizeChange(() => {
            updateHeight(monacoEditor);
        });

        // Command: Esc exits editing
        monacoEditor.addCommand(monaco.KeyCode.Escape, () => {
            handleExitEdit();
        });

        // Command: Ctrl/Cmd + Enter exits editing
        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleExitEdit();
        });

        // Up arrow on first line moves focus before block
        monacoEditor.onKeyDown((e) => {
            if (e.keyCode === monaco.KeyCode.UpArrow) {
                const pos = monacoEditor.getPosition();
                if (pos && pos.lineNumber === 1) {
                    handleExitEdit();
                    if (typeof getPos === "function" && editor) {
                        const blockPos = getPos();
                        editor.commands.focus(Math.max(0, blockPos - 1));
                    }
                }
            } else if (e.keyCode === monaco.KeyCode.DownArrow) {
                const pos = monacoEditor.getPosition();
                const lineCount = monacoEditor.getModel()?.getLineCount() || 1;
                if (pos && pos.lineNumber === lineCount) {
                    handleExitEdit();
                    if (typeof getPos === "function" && editor) {
                        const blockPos = getPos();
                        editor.commands.focus(blockPos + (node?.nodeSize || 0));
                    }
                }
            }
        });

        updateHeight(monacoEditor);
        monacoEditor.focus();
    };

    const handleCodeChange = (newVal) => {
        const monaco = monacoRef.current;
        const model = monacoInstanceRef.current?.getModel();
        const rawVal =
            model && monaco
                ? model.getValue(monaco.editor.EndOfLinePreference.LF)
                : newVal ?? "";

        const cleanVal = normalizeCode(rawVal);
        setLocalCode(cleanVal);

        if (updateAttributes) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                updateAttributes({ code: cleanVal });
            }, 150);
        }
    };

    const handleExitEdit = () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        const monaco = monacoRef.current;
        const model = monacoInstanceRef.current?.getModel();
        const rawVal =
            model && monaco
                ? model.getValue(monaco.editor.EndOfLinePreference.LF)
                : localCode;

        const cleanVal = normalizeCode(rawVal);
        setLocalCode(cleanVal);
        if (updateAttributes) {
            updateAttributes({ code: cleanVal });
        }
        setIsEditing(false);
    };

    const handleCopy = (e) => {
        e?.stopPropagation();
        if (!navigator?.clipboard) return;
        const cleanVal = normalizeCode(localCode || normalizedCode);
        navigator.clipboard.writeText(cleanVal);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabSize = useMemo(() => {
        const l = language.toLowerCase();
        return ["javascript", "typescript", "js", "ts", "json", "yaml", "yml"].includes(l) ? 2 : 4;
    }, [language]);

    // Choose container element: NodeViewWrapper for TipTap node, or plain div for standalone/public
    const ContainerElement = node ? NodeViewWrapper : "div";

    return (
        <ContainerElement
            ref={wrapperRef}
            className={`docspost-codeblock-container ${isEditing ? "is-editing" : ""} ${selected ? "is-selected" : ""} ${className || ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header (36px) */}
            <div className="docspost-codeblock-header" contentEditable={false}>
                <div className="docspost-codeblock-header-left">
                    <div className="docspost-codeblock-lang-chip" title="Language">
                        {isTerminalLang ? (
                            <FiTerminal className="docspost-codeblock-lang-icon" />
                        ) : (
                            <FiFileText className="docspost-codeblock-lang-icon" />
                        )}
                        {isEditing ? (
                            <select
                                className="docspost-codeblock-lang-select"
                                value={language}
                                onChange={(e) =>
                                    updateAttributes && updateAttributes({ language: e.target.value })
                                }
                                aria-label="Select programming language"
                            >
                                {SUPPORTED_LANGUAGES.map((l) => (
                                    <option key={l.value} value={l.value}>
                                        {l.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span
                                className="docspost-codeblock-lang-label"
                                onClick={() => editor?.isEditable && setIsEditing(true)}
                            >
                                {language}
                            </span>
                        )}
                    </div>
                </div>

                <div className="docspost-codeblock-header-right">
                    {editor?.isEditable && !isEditing && isHovered && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="docspost-codeblock-action-btn"
                            title="Edit code"
                        >
                            <FiEdit2 size={13} />
                            <span>Edit</span>
                        </button>
                    )}

                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleExitEdit}
                            className="docspost-codeblock-action-btn done-btn"
                            title="Done (Esc or Ctrl+Enter)"
                        >
                            <FiCheck size={13} style={{ color: "#22C55E" }} />
                            <span>Done</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="docspost-codeblock-action-btn"
                        title="Copy code"
                    >
                        {copied ? (
                            <>
                                <FiCheck size={13} style={{ color: "#22C55E" }} />
                                <span style={{ color: "#22C55E" }}>Copied</span>
                            </>
                        ) : (
                            <>
                                <FiCopy size={13} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="docspost-codeblock-body" contentEditable={false}>
                {isEditing ? (
                    <div
                        className="docspost-codeblock-monaco-wrap"
                        style={{ height: `${editorHeight}px` }}
                    >
                        <Editor
                            height={`${editorHeight}px`}
                            language={mapToMonacoLanguage(language)}
                            value={localCode}
                            theme="docspost-dark"
                            onMount={handleMonacoMount}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontSize: 13,
                                lineHeight: 22,
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                padding: { top: 14, bottom: 14 },
                                lineNumbers: "on",
                                lineNumbersMinChars: Math.max(2, digits),
                                glyphMargin: false,
                                folding: false,
                                lineDecorationsWidth: 10,
                                renderLineHighlight: "line",
                                tabSize,
                                insertSpaces: true,
                                detectIndentation: false,
                                trimAutoWhitespace: false,
                                wordWrap: "off",
                                scrollbar: {
                                    vertical: "auto",
                                    horizontal: "auto",
                                    alwaysConsumeMouseWheel: false,
                                },
                                overviewRulerLanes: 0,
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="cb-body"
                        style={{ "--gutter": gutterWidth }}
                        onClick={() => editor?.isEditable && setIsEditing(true)}
                        title={editor?.isEditable ? "Click to edit" : undefined}
                    >
                        {tokenLines.map((tokens, idx) => (
                            <div key={idx} className="cb-row">
                                <span className="cb-ln" aria-hidden="true">
                                    {idx + 1}
                                </span>
                                <span className="cb-code">
                                    {tokens.length === 0 ? (
                                        "\u200B"
                                    ) : (
                                        tokens.map((t, ti) => (
                                            <span key={ti} style={{ color: t.color }}>
                                                {t.content}
                                            </span>
                                        ))
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ContainerElement>
    );
}

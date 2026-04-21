"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { MdContentCopy, MdCheck } from "react-icons/md";
import "./CodeBlock.css";

export default function CodeBlock({ inline, className, children }) {
    const [copied, setCopied] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [editorHeight, setEditorHeight] = useState("auto");
    const code = String(children).replace(/\n$/, "");

    // Extract language from className
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";

    // Check theme on mount and listen for changes
    useEffect(() => {
        const updateTheme = () => {
            const theme = document.documentElement.getAttribute("data-theme");
            setIsDark(theme !== "light");
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        return () => observer.disconnect();
    }, []);

    // Calculate height based on content
    useEffect(() => {
        const lineCount = code.split("\n").length;
        const lineHeight = 14;
        const calculatedHeight = lineCount * lineHeight; // min 150px, no max limit
        let newHeight;
        if (calculatedHeight >= 1000) {
            newHeight = 600
        } else if (calculatedHeight >= 500) {
            newHeight = 400
        } else {
            newHeight = 200
        }
        setEditorHeight(`${newHeight}px`);
    }, [code]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (inline) {
        return <code className="inline-code">{children}</code>;
    }

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <span className="code-language">{language}</span>
                <div className="code-block-actions">
                    <button
                        className="code-btn copy-btn"
                        onClick={handleCopy}
                        title="Copy code"
                    >
                        {copied ? (
                            <>
                                <MdCheck size={16} /> Copied
                            </>
                        ) : (
                            <>
                                <MdContentCopy size={16} /> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="monaco-editor-wrapper">
                <Editor
                    height={editorHeight}
                    language={language}
                    value={code}
                    theme={isDark ? "vs-dark" : "vs"}
                    options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "off",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true,
                        padding: { top: 10, bottom: 10 },
                        scrollbar: {
                            horizontal: "hidden",
                            vertical: "hidden",
                        },
                        overviewRulerLanes: 0,
                    }}
                />
            </div>
        </div>
    );
}

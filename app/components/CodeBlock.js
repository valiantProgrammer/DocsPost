"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { MdContentCopy, MdCheck } from "react-icons/md";
import "./CodeBlock.css";

export default function CodeBlock({ inline, className, children }) {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, "");

    // Extract language from className
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";

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
                    height="400px"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true,
                        padding: { top: 10, bottom: 10 },
                    }}
                />
            </div>
        </div>
    );
}

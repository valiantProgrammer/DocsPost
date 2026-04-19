"use client";
import { useState, useRef } from "react";
import { FiCode, FiImage, FiList, FiType, FiBold, FiItalic } from "react-icons/fi";
import "./DocumentEditor.css";

export default function DocumentEditor({ initialContent = "", onChange }) {
    const [content, setContent] = useState(initialContent);
    const [showCodeBlock, setShowCodeBlock] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState("javascript");
    const fileInputRef = useRef(null);

    const handleContentChange = (newContent) => {
        setContent(newContent);
        onChange(newContent);
    };

    const insertMarkdown = (before, after = "") => {
        const textarea = document.getElementById("editor-textarea");
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end) || "text";
        const newContent =
            content.substring(0, start) +
            before +
            selectedText +
            after +
            content.substring(end);

        handleContentChange(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + before.length;
        }, 0);
    };

    const insertCodeBlock = () => {
        const codeBlock = `\`\`\`${codeLanguage}\n// Your code here\n\`\`\`\n`;
        const newContent = content + (content ? "\n" : "") + codeBlock;
        handleContentChange(newContent);
        setShowCodeBlock(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result;
                const imageMarkdown = `\n![Image](${base64})\n`;
                const newContent = content + (content ? "\n" : "") + imageMarkdown;
                handleContentChange(newContent);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="document-editor">
            <div className="editor-toolbar">
                <div className="toolbar-group">
                    <button
                        className="toolbar-btn"
                        onClick={() => insertMarkdown("**", "**")}
                        title="Bold"
                    >
                        <FiBold size={18} />
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={() => insertMarkdown("*", "*")}
                        title="Italic"
                    >
                        <FiItalic size={18} />
                    </button>
                </div>

                <div className="toolbar-group">
                    <button
                        className="toolbar-btn"
                        onClick={() => insertMarkdown("### ", "")}
                        title="Heading"
                    >
                        <FiType size={18} />
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={() => insertMarkdown("- ", "")}
                        title="List"
                    >
                        <FiList size={18} />
                    </button>
                </div>

                <div className="toolbar-group">
                    <button
                        className="toolbar-btn"
                        onClick={() => setShowCodeBlock(!showCodeBlock)}
                        title="Code Block"
                    >
                        <FiCode size={18} />
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Insert Image"
                    >
                        <FiImage size={18} />
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                />
            </div>

            {showCodeBlock && (
                <div className="code-block-selector">
                    <div className="selector-content">
                        <label>Select Language:</label>
                        <select
                            value={codeLanguage}
                            onChange={(e) => setCodeLanguage(e.target.value)}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="sql">SQL</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="json">JSON</option>
                            <option value="bash">Bash</option>
                        </select>
                        <div className="selector-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCodeBlock(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={insertCodeBlock}
                            >
                                Insert Code Block
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <textarea
                id="editor-textarea"
                className="editor-textarea"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write your documentation here...

## Tips:
- Use **bold** text for emphasis
- Add ### headings for sections
- Click code button to insert code blocks
- Click image button to upload images
- Use markdown formatting for better presentation"
            />

            <div className="editor-preview-toggle">
                <small>💡 Markdown formatting supported</small>
            </div>
        </div>
    );
}

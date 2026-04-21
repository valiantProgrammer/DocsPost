"use client"
import { useState, useRef, useEffect } from "react";
import { FiX, FiBold, FiItalic, FiUnderline, FiList, FiImage, FiChevronDown, FiMoreVertical } from "react-icons/fi";
import { TbStrikethrough, TbCode, TbLink, TbAlignLeft, TbAlignCenter, TbAlignRight, TbAlignJustified, TbListNumbers, TbIndentIncrease, TbIndentDecrease, TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { MdOutlineFormatQuote } from "react-icons/md";
import { BsTypeH1, BsTypeH2, BsTypeH3 } from "react-icons/bs";
import { RiText, RiImageLine, RiVideoLine, RiCodeBoxLine, RiSeparator } from "react-icons/ri";
import { PiTable } from "react-icons/pi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; }

  .docspost-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #fff;
  }

  /* ─── Top Bar ─── */
  .editor-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 52px;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
    flex-shrink: 0;
    z-index: 10;
  }
  .editor-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #111827;
  }
  .editor-title .back-arrow {
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 18px;
    margin-right: 2px;
  }
  .doc-icon { font-size: 16px; }
  .topbar-center {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .saved-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    color: #6b7280;
    font-weight: 500;
  }
  .saved-dot {
    width: 7px; height: 7px;
    background: #22c55e;
    border-radius: 50%;
  }
  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-preview {
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #d1d5db;
    background: #fff;
    border-radius: 7px;
    cursor: pointer;
    color: #374151;
    transition: background 0.15s;
  }
  .btn-preview:hover { background: #f3f4f6; }
  .btn-publish {
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 600;
    border: none;
    background: #7c3aed;
    color: #fff;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-publish:hover { background: #6d28d9; }
  .btn-editor-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 5px;
  }
  .btn-editor-close:hover { background: #f3f4f6; }

  /* ─── Toolbar ─── */
  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
    flex-shrink: 0;
    flex-wrap: wrap;
    row-gap: 4px;
  }
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 1px;
  }
  .toolbar-select {
    appearance: none;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 4px 28px 4px 9px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #374151;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    min-width: 88px;
  }
  .toolbar-btn {
    background: none;
    border: none;
    border-radius: 5px;
    padding: 5px 6px;
    cursor: pointer;
    color: #374151;
    display: flex;
    align-items: center;
    transition: background 0.12s;
    font-size: 13px;
    font-weight: 600;
    font-family: serif;
  }
  .toolbar-btn:hover { background: #f3f4f6; }
  .toolbar-btn.active { background: #ede9fe; color: #7c3aed; }
  .toolbar-divider {
    width: 1px;
    height: 20px;
    background: #e5e7eb;
    margin: 0 4px;
  }

  /* ─── Main Layout ─── */
  .editor-main {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  /* ─── Left Sidebar (Insert Panel) ─── */
  .editor-sidebar {
    width: 168px;
    flex-shrink: 0;
    border-right: 1px solid #e5e7eb;
    background: #fff;
    overflow-y: auto;
    padding: 14px 0;
  }
  .sidebar-section-title {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0 14px 8px;
  }
  .insert-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 14px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    border-radius: 0;
    transition: background 0.12s;
    font-weight: 450;
  }
  .insert-item:hover { background: #f3f4f6; }
  .insert-item svg { color: #6b7280; flex-shrink: 0; }
  .insert-item .item-icon-box {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sidebar-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 8px 14px;
  }

  /* ─── Editor Content ─── */
  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 40px 60px 60px;
    background: #fff;
    min-width: 0;
  }
  .editor-title-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    font-family: 'Inter', sans-serif;
    margin-bottom: 10px;
    background: transparent;
    line-height: 1.2;
  }
  .editor-title-input::placeholder { color: #d1d5db; }
  .editor-textarea {
    width: 100%;
    border: none;
    outline: none;
    font-size: 15px;
    color: #374151;
    font-family: 'Inter', sans-serif;
    line-height: 1.7;
    resize: none;
    background: transparent;
    min-height: 340px;
  }
  .editor-textarea::placeholder { color: #9ca3af; }

  /* ─── Content preview blocks ─── */
  .content-preview {
    font-size: 15px;
    color: #374151;
    line-height: 1.7;
  }
  .content-preview h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 22px 0 10px;
    color: #111827;
  }
  .content-preview ul {
    padding-left: 22px;
    margin-bottom: 14px;
  }
  .content-preview ul li { margin-bottom: 3px; }
  .content-preview p { margin-bottom: 12px; }
  .code-block {
    background: #1e1e2e;
    border-radius: 10px;
    padding: 16px 20px;
    margin: 14px 0;
    position: relative;
  }
  .code-block .lang-label {
    font-size: 11px;
    color: #7c7f93;
    font-family: 'Fira Code', monospace;
    margin-bottom: 8px;
    letter-spacing: 0.04em;
  }
  .code-block pre {
    font-family: 'Fira Code', monospace;
    font-size: 13px;
    color: #cdd6f4;
    line-height: 1.6;
    overflow-x: auto;
  }
  .code-block .copy-btn {
    position: absolute;
    top: 10px;
    right: 12px;
    background: #313244;
    border: none;
    color: #a6adc8;
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 11px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
  }
  .code-block .copy-btn:hover { background: #45475a; }

  /* ─── Featured image ─── */
  .featured-image-section { margin-top: 24px; }
  .image-placeholder {
    border: 2px dashed #e5e7eb;
    border-radius: 10px;
    padding: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: #9ca3af;
    cursor: pointer;
    transition: background 0.15s;
  }
  .image-placeholder:hover { background: #fafafa; }
  .image-placeholder p { font-size: 13px; font-weight: 500; }

  /* ─── Right Metadata Sidebar ─── */
  .editor-meta-sidebar {
    width: 230px;
    flex-shrink: 0;
    border-left: 1px solid #e5e7eb;
    background: #fff;
    overflow-y: auto;
    padding: 0;
  }
  .meta-tab-row {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
  }
  .meta-tab {
    flex: 1;
    text-align: center;
    padding: 11px 0;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s;
  }
  .meta-tab.active {
    color: #7c3aed;
    border-bottom: 2px solid #7c3aed;
  }
  .meta-panel { padding: 16px 16px 20px; }
  .sidebar-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #6b7280;
    display: block;
    margin-bottom: 5px;
    letter-spacing: 0.01em;
  }
  .sidebar-select {
    width: 100%;
    appearance: none;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    padding: 6px 28px 6px 10px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #374151;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
  }
  .sidebar-input {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    padding: 6px 10px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #374151;
    background: #f9fafb;
    outline: none;
  }
  .sidebar-input:focus { border-color: #7c3aed; background: #fff; }
  .meta-section { margin-bottom: 18px; }
  .meta-featured-image {
    border: 1.5px dashed #d1d5db;
    border-radius: 9px;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    color: #9ca3af;
    cursor: pointer;
    transition: background 0.15s;
    margin-top: 2px;
  }
  .meta-featured-image:hover { background: #fafafa; }
  .meta-featured-image p { font-size: 12px; font-weight: 500; }
  .meta-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
    border-top: 1px solid #f0f0f0;
    margin-top: 10px;
  }
  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12.5px;
  }
  .stat-label { color: #6b7280; font-weight: 500; }
  .stat-value { color: #111827; font-weight: 600; }

  /* ─── Footer ─── */
  .editor-footer {
    display: none;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
`;

export default function NewDocumentModal({ isOpen, onClose, onCreateDocument }) {
    const [formData, setFormData] = useState({
        title: "Add a Catchy Title",
        content: "",
        category: "React",
        visibility: "Public",
        status: "Draft"
    });
    const [activeMetaTab, setActiveMetaTab] = useState("Document");
    const [showPreview, setShowPreview] = useState(false);

    const categories = ["React", "Backend", "Database", "CSS", "JavaScript", "Node.js", "TypeScript", "Other"];
    const visibilityOptions = ["Public", "Private", "Draft"];
    const statusOptions = ["Draft", "Published", "Archived"];

    const handleTitleChange = (e) => setFormData(prev => ({ ...prev, title: e.target.value }));
    const handleContentChange = (e) => setFormData(prev => ({ ...prev, content: e.target.value }));
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        if (!formData.title.trim() || formData.title === "Add a Catchy Title") {
            alert("Please enter a document title");
            return;
        }
        if (onCreateDocument) onCreateDocument(formData);
        setFormData({
            title: "Add a Catchy Title",
            content: "",
            category: "React",
            visibility: "Public",
            status: "Draft"
        });
        if (onClose) onClose();
    };

    const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const insertItems = [
        { icon: <RiText size={15} />, label: "Text" },
        { icon: <BsTypeH1 size={15} />, label: "Heading 1", prefix: "H" },
        { icon: <BsTypeH2 size={15} />, label: "Heading 2", prefix: "H" },
        { icon: <BsTypeH3 size={15} />, label: "Heading 3", prefix: "H" },
        null,
        { icon: <FiList size={15} />, label: "Bulleted List" },
        { icon: <TbListNumbers size={15} />, label: "Numbered List" },
        null,
        { icon: <RiImageLine size={15} />, label: "Image" },
        { icon: <RiVideoLine size={15} />, label: "Video" },
        { icon: <RiCodeBoxLine size={15} />, label: "Code Block" },
        { icon: <MdOutlineFormatQuote size={15} />, label: "Quote" },
        { icon: <PiTable size={15} />, label: "Table" },
        { icon: <RiSeparator size={15} />, label: "Divider" },
    ];

    const sampleContent = (
        <div className="content-preview">
            <p>Start writing your documentation here...</p>
            <h2>Features</h2>
            <ul>
                <li>Rich text editing</li>
                <li>Insert images and videos</li>
                <li>Code syntax highlighting</li>
                <li>Table support</li>
                <li>And much more!</li>
            </ul>
            <p>You can write your content in a clean and distraction-free environment.</p>
            <div className="code-block">
                <div className="lang-label">javascript</div>
                <button className="copy-btn">Copy</button>
                <pre>{`const greet = (name) => {\n  console.log(\`Hello, \${name}!\`);\n};`}</pre>
            </div>
        </div>
    );

    return (
        <>
            <style>{styles}</style>
            <div className="docspost-page">
                {/* Top Bar */}
                <div className="editor-top-bar">
                    <div className="editor-title">
                        <span className="back-arrow" onClick={onClose}>←</span>
                        <span className="doc-icon">📄</span>
                        <span>Untitled Document</span>
                    </div>
                    <div className="topbar-center">
                        <div className="saved-badge">
                            <span className="saved-dot"></span>
                            Saved
                        </div>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn-preview" onClick={() => setShowPreview(v => !v)}>
                            Preview
                        </button>
                        <button className="btn-publish" onClick={handleCreate}>
                            Publish
                        </button>
                        <button className="btn-editor-close" onClick={onClose} title="More options">
                            <FiMoreVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* Formatting Toolbar */}
                <div className="editor-toolbar">
                    <div className="toolbar-group">
                        <select className="toolbar-select">
                            <option>Normal</option>
                            <option>Heading 1</option>
                            <option>Heading 2</option>
                            <option>Heading 3</option>
                        </select>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                        <button className="toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="toolbar-btn" title="Strikethrough"><s>S</s></button>
                        <button className="toolbar-btn" title="Link"><TbLink size={15} /></button>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                        <button className="toolbar-btn" title="Align Left"><TbAlignLeft size={15} /></button>
                        <button className="toolbar-btn" title="Align Center"><TbAlignCenter size={15} /></button>
                        <button className="toolbar-btn" title="Align Right"><TbAlignRight size={15} /></button>
                        <button className="toolbar-btn" title="Justify"><TbAlignJustified size={15} /></button>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                        <button className="toolbar-btn" title="Bullet List"><FiList size={15} /></button>
                        <button className="toolbar-btn" title="Numbered List"><TbListNumbers size={15} /></button>
                        <button className="toolbar-btn" title="Indent"><TbIndentIncrease size={15} /></button>
                        <button className="toolbar-btn" title="Outdent"><TbIndentDecrease size={15} /></button>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                        <button className="toolbar-btn" title="Quote"><MdOutlineFormatQuote size={15} /></button>
                        <button className="toolbar-btn" title="Code"><TbCode size={15} /></button>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                        <button className="toolbar-btn" title="Undo"><TbArrowBackUp size={15} /></button>
                        <button className="toolbar-btn" title="Redo"><TbArrowForwardUp size={15} /></button>
                    </div>
                </div>

                {/* Main 3-column layout */}
                <div className="editor-main">
                    {/* Left Insert Sidebar */}
                    <div className="editor-sidebar">
                        <div className="sidebar-section-title">Insert</div>
                        {insertItems.map((item, i) =>
                            item === null
                                ? <div key={i} className="sidebar-divider" />
                                : (
                                    <div key={i} className="insert-item">
                                        <div className="item-icon-box">{item.icon}</div>
                                        <span>{item.label}</span>
                                    </div>
                                )
                        )}
                    </div>

                    {/* Center Editor */}
                    <div className="editor-content">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="editor-title-input"
                            placeholder="Add a Catchy Title"
                            onFocus={e => { if (e.target.value === "Add a Catchy Title") setFormData(p => ({ ...p, title: "" })); }}
                            onBlur={e => { if (!e.target.value) setFormData(p => ({ ...p, title: "Add a Catchy Title" })); }}
                        />

                        {showPreview
                            ? sampleContent
                            : (
                                <textarea
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    className="editor-textarea"
                                    placeholder="Start writing your documentation here..."
                                />
                            )
                        }

                        <div className="featured-image-section">
                            <div className="image-placeholder">
                                <FiImage size={40} />
                                <p>Upload Featured Image</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Metadata Sidebar */}
                    <div className="editor-meta-sidebar">
                        <div className="meta-tab-row">
                            {["Document", "Block"].map(tab => (
                                <div
                                    key={tab}
                                    className={`meta-tab${activeMetaTab === tab ? " active" : ""}`}
                                    onClick={() => setActiveMetaTab(tab)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        <div className="meta-panel">
                            <div className="meta-section">
                                <label className="sidebar-label">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleSelectChange}
                                    className="sidebar-select"
                                >
                                    {statusOptions.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>

                            <div className="meta-section">
                                <label className="sidebar-label">Visibility</label>
                                <select
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleSelectChange}
                                    className="sidebar-select"
                                >
                                    {visibilityOptions.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>

                            <div className="meta-section">
                                <label className="sidebar-label">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleSelectChange}
                                    className="sidebar-select"
                                >
                                    {categories.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="meta-section">
                                <label className="sidebar-label">Tags</label>
                                <input type="text" placeholder="Add tags..." className="sidebar-input" />
                            </div>

                            <div className="meta-section">
                                <label className="sidebar-label">Featured Image</label>
                                <div className="meta-featured-image">
                                    <FiImage size={28} />
                                    <p>Upload Image</p>
                                </div>
                            </div>

                            <div className="meta-stats">
                                <div className="stat-row">
                                    <span className="stat-label">Word Count</span>
                                    <span className="stat-value">{wordCount}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Reading Time</span>
                                    <span className="stat-value">{readingTime} min read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer (hidden but class kept) */}
                <div className="editor-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-publish" onClick={handleCreate}>Publish</button>
                </div>
            </div>
        </>
    );
}
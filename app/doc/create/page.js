"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiBold, FiItalic, FiUnderline, FiList, FiImage, FiSave } from "react-icons/fi";
import { TbStrikethrough, TbCode } from "react-icons/tb";
import "./editor.css";

export default function DocumentEditorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "Add a Catchy Title",
        content: "Start writing your documentation here...",
        category: "React",
        visibility: "Public"
    });

    const categories = ["React", "Backend", "Database", "CSS", "JavaScript", "Node.js", "TypeScript", "Other"];
    const visibilityOptions = ["Public", "Private", "Draft"];

    const handleTitleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            title: e.target.value
        }));
    };

    const handleContentChange = (e) => {
        setFormData(prev => ({
            ...prev,
            content: e.target.value
        }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePublish = () => {
        if (!formData.title.trim() || formData.title === "Add a Catchy Title") {
            alert("Please enter a document title");
            return;
        }
        console.log("Publishing document:", formData);
        router.back();
    };

    const handleDraft = () => {
        console.log("Saving as draft:", formData);
        alert("Document saved as draft");
    };

    return (
        <div className="editor-page-wrapper">
            {/* Top Bar */}
            <div className="editor-page-top-bar">
                <button
                    className="btn-back-editor"
                    onClick={() => router.back()}
                    title="Go back"
                >
                    <FiArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="editor-page-title">
                    <span className="doc-icon">📄</span>
                    <span>Untitled Document</span>
                </div>

                <div className="editor-page-actions">
                    <button className="btn-save-draft" onClick={handleDraft}>
                        <FiSave size={18} />
                        Save Draft
                    </button>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="editor-page-main">
                {/* Sidebar */}
                <div className="editor-page-sidebar">
                    <div className="sidebar-section">
                        <label className="sidebar-label">Status</label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleSelectChange}
                            className="sidebar-select"
                        >
                            {visibilityOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Visibility</label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleSelectChange}
                            className="sidebar-select"
                        >
                            {visibilityOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleSelectChange}
                            className="sidebar-select"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Tags</label>
                        <input
                            type="text"
                            placeholder="Add tags..."
                            className="sidebar-input"
                        />
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="editor-page-content">
                    {/* Toolbar */}
                    <div className="editor-page-toolbar">
                        <div className="toolbar-group">
                            <select className="toolbar-select">
                                <option>Normal</option>
                                <option>Heading 1</option>
                                <option>Heading 2</option>
                                <option>Heading 3</option>
                            </select>
                        </div>

                        <div className="toolbar-divider"></div>

                        <div className="toolbar-group">
                            <button className="toolbar-btn" title="Bold">
                                <FiBold size={16} />
                            </button>
                            <button className="toolbar-btn" title="Italic">
                                <FiItalic size={16} />
                            </button>
                            <button className="toolbar-btn" title="Underline">
                                <FiUnderline size={16} />
                            </button>
                            <button className="toolbar-btn" title="Strikethrough">
                                <TbStrikethrough size={16} />
                            </button>
                        </div>

                        <div className="toolbar-divider"></div>

                        <div className="toolbar-group">
                            <button className="toolbar-btn" title="Bullet List">
                                <FiList size={16} />
                            </button>
                            <button className="toolbar-btn" title="Code">
                                <TbCode size={16} />
                            </button>
                        </div>

                        <div className="toolbar-divider"></div>

                        <div className="toolbar-group">
                            <button className="toolbar-btn" title="Add Image">
                                <FiImage size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Title Input */}
                    <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="editor-page-title-input"
                        placeholder="Add a Catchy Title"
                    />

                    {/* Content Area */}
                    <textarea
                        value={formData.content}
                        onChange={handleContentChange}
                        className="editor-page-textarea"
                        placeholder="Start writing your documentation here..."
                    />

                    {/* Featured Image Section */}
                    <div className="featured-image-section">
                        <div className="image-placeholder">
                            <FiImage size={48} />
                            <p>Upload Featured Image</p>
                            <button className="btn-upload-image">Choose Image</button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Document Info */}
                <div className="editor-page-right-sidebar">
                    <div className="sidebar-section">
                        <label className="sidebar-label">Word Count</label>
                        <div className="info-display">{formData.content.split(" ").length}</div>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Reading Time</label>
                        <div className="info-display">
                            {Math.ceil(formData.content.split(" ").length / 200)} min read
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Featured Image</label>
                        <div className="image-preview">
                            <FiImage size={40} />
                            <p>No image yet</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="editor-page-footer">
                <button className="btn-cancel-editor" onClick={() => router.back()}>
                    Cancel
                </button>
                <button className="btn-publish-editor" onClick={handlePublish}>
                    Publish
                </button>
            </div>
        </div>
    );
}

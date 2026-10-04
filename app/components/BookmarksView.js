"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiBookmark,
  FiClock,
  FiExternalLink,
  FiTrash2,
} from "react-icons/fi";
import "@/app/bookmarks/bookmarks.css";

const BOOKMARKS_DATA = [
  {
    id: "redis-from-scratch",
    title: "Building Redis from Scratch",
    category: "Backend",
    readTime: "14 min read",
    savedDate: "Saved 2 days ago",
    color: "#ef4444",
    codeSnippet: "def handle_client(sock):\n    req = parse_resp(sock)\n    if req.cmd == 'SET':\n        store[req.key] = req.val\n        return '+OK\\r\\n'",
  },
  {
    id: "kubernetes-for-beginners",
    title: "Kubernetes for Beginners",
    category: "DevOps",
    readTime: "18 min read",
    savedDate: "Saved 3 days ago",
    color: "#3b82f6",
    codeSnippet: "apiVersion: v1\nkind: Service\nmetadata:\n  name: app-svc\nspec:\n  type: LoadBalancer\n  ports: [{port: 80}]",
  },
  {
    id: "system-design-interview-guide",
    title: "System Design Interview Guide",
    category: "System Design",
    readTime: "20 min read",
    savedDate: "Saved 1 week ago",
    color: "#8b5cf6",
    codeSnippet: "1. Scope & Scale Estimation\n2. High-Level Architecture\n3. Data Models & Storage\n4. Bottlenecks & Mitigations",
  },
  {
    id: "react-hooks-complete-guide",
    title: "React Hooks Complete Guide",
    category: "JavaScript",
    readTime: "18 min read",
    savedDate: "Saved 1 week ago",
    color: "#06b6d4",
    codeSnippet: "const useAsyncResource = <T>(fn: () => Promise<T>) => {\n  const [data, setData] = useState<T>();\n  // ...\n};",
  },
];

const TOPIC_PILLS = ["All", "Python", "System Design", "AI & ML", "Backend", "DevOps"];

export default function BookmarksView({ router: parentRouter }) {
  const router = useRouter() || parentRouter;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [bookmarks, setBookmarks] = useState(BOOKMARKS_DATA);

  const filteredBookmarks = bookmarks.filter((item) => {
    const matchesTopic =
      selectedTopic === "All" ||
      item.category.toLowerCase().includes(selectedTopic.toLowerCase());
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const removeBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  return (
    <div className="bookmarks-page-container">
      {/* Header */}
      <div className="bookmarks-header">
        <h1 className="bookmarks-title">Saved Documents</h1>
        <p className="bookmarks-subtitle">
          Quick access to your curated technical guides and reading list.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bookmarks-search-box">
        <FiSearch className="b-search-icon" size={18} />
        <input
          type="text"
          placeholder="Search saved documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="b-search-input"
        />
      </div>

      {/* Topic Filter Pills */}
      <div className="bookmarks-pills-row">
        {TOPIC_PILLS.map((topic) => (
          <button
            key={topic}
            className={`b-topic-pill ${selectedTopic === topic ? "active" : ""}`}
            onClick={() => setSelectedTopic(topic)}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* List of Bookmarks */}
      <div className="bookmarks-list">
        {filteredBookmarks.length === 0 ? (
          <div className="bookmarks-empty-state">
            <FiBookmark size={40} className="empty-icon" />
            <p>No saved documents matching your search.</p>
          </div>
        ) : (
          filteredBookmarks.map((item) => (
            <div
              key={item.id}
              className="bookmark-row-card"
              onClick={() => router.push(`/doc/${item.id}`)}
            >
              <div
                className="bookmark-thumb-cover"
                style={{ background: "#0b0f19" }}
              >
                <pre className="thumb-code">
                  <code>{item.codeSnippet}</code>
                </pre>
              </div>

              <div className="bookmark-card-details">
                <h3 className="bookmark-item-title">{item.title}</h3>
                <div className="bookmark-meta-row">
                  <span className="bookmark-category-pill" style={{ color: item.color }}>
                    {item.category}
                  </span>
                  <span className="dot-sep">·</span>
                  <span className="bookmark-readtime">
                    <FiClock size={12} /> {item.readTime}
                  </span>
                </div>
              </div>

              <div className="bookmark-right-actions">
                <span className="saved-timestamp">{item.savedDate}</span>
                <button
                  className="bookmark-action-btn"
                  onClick={(e) => removeBookmark(item.id, e)}
                  title="Remove from saved"
                  aria-label="Remove bookmark"
                >
                  <FiBookmark size={18} className="fill-blue" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

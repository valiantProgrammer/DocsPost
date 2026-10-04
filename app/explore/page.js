"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiThumbsUp,
  FiClock,
  FiCheck,
  FiChevronDown,
} from "react-icons/fi";
import "./explore.css";

const TOPICS = [
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "DSA",
  "AI & ML",
  "DevOps",
  "System Design",
  "Mobile",
  "Tools",
];

const TYPES = ["All", "Tutorial", "Guide", "Documentation"];

const EXPLORE_DOCS = [
  {
    id: "production-ml-pipeline",
    title: "Building a Production ML Pipeline",
    excerpt: "End-to-end guide on data ingestion, automated validation, model training, and continuous deployment with FastAPI and Kubeflow.",
    category: "AI & ML",
    categoryColor: "#10b981",
    author: "Rupayan Dey",
    readTime: "12 min",
    views: "3.6K",
    upvotes: "418",
    codeSnippet: "from kubeflow import dsl\n@dsl.pipeline(name='prod-pipe')\ndef training_pipeline():\n    prep = prep_op()\n    train = train_op(prep.output)",
  },
  {
    id: "react-hooks-complete-guide",
    title: "React Hooks Complete Guide",
    excerpt: "Deep dive into state management, effect lifecycles, performance memoization, and crafting scalable custom hooks.",
    category: "JavaScript",
    categoryColor: "#06b6d4",
    author: "Ananya Roy",
    readTime: "18 min",
    views: "5.2K",
    upvotes: "620",
    codeSnippet: "function useDebouncedFetch<T>(query: string, delay = 300) {\n  const [data, setData] = useState<T | null>(null);\n  // clean effect debounce\n}",
  },
  {
    id: "system-design-basics",
    title: "System Design Basics",
    excerpt: "Fundamental principles of scalability, horizontal partitioning, load balancers, message queues, and CAP theorem.",
    category: "System Design",
    categoryColor: "#3b82f6",
    author: "Arjun Das",
    readTime: "15 min",
    views: "4.4K",
    upvotes: "512",
    codeSnippet: "Client -> Load Balancer (Nginx/HAProxy)\n  -> API Gateway (Auth & Rate Limit)\n    -> Microservices -> Kafka -> DB Cluster",
  },
  {
    id: "javascript-async-await",
    title: "JavaScript Async/Await Under the Hood",
    excerpt: "Understanding the microtask queue, event loop phases, Promise resolution algorithms, and async execution frames.",
    category: "JavaScript",
    categoryColor: "#f59e0b",
    author: "Sneha Sharma",
    readTime: "10 min",
    views: "2.8K",
    upvotes: "329",
    codeSnippet: "async function executeTasks(tasks) {\n  const results = await Promise.allSettled(\n    tasks.map(t => runWithTimeout(t, 5000))\n  );\n}",
  },
  {
    id: "docker-for-beginners",
    title: "Docker for Beginners",
    excerpt: "Containerize any application: multi-stage Dockerfiles, layer caching, volume mounts, networks, and compose configs.",
    category: "DevOps",
    categoryColor: "#8b5cf6",
    author: "Vikram Singh",
    readTime: "14 min",
    views: "3.1K",
    upvotes: "380",
    codeSnippet: "FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build",
  },
  {
    id: "kubernetes-architecture",
    title: "Kubernetes Architecture",
    excerpt: "Dissecting control plane components: etcd, kube-apiserver, kube-scheduler, kube-controller-manager, and worker nodes.",
    category: "DevOps",
    categoryColor: "#ec4899",
    author: "Priya Mehta",
    readTime: "16 min",
    views: "2.9K",
    upvotes: "345",
    codeSnippet: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: production-api\nspec:\n  replicas: 5\n  strategy: RollingUpdate",
  },
];

export default function ExplorePage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState(["Python"]);
  const [selectedType, setSelectedType] = useState("All");
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");

  const tabs = ["All", "Popular", "Recent", "Trending", "Following"];

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="docspost-explore-page" data-theme={isDark ? "dark" : "light"}>
      <Header />

      <main className="explore-main-wrapper">
        {/* Top Search Bar */}
        <div className="explore-search-container">
          <form className="explore-search-form" onSubmit={handleSearchSubmit}>
            <FiSearch className="explore-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search documentation, guides, architectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="explore-search-input"
            />
            <button type="submit" className="explore-search-btn">
              Search
            </button>
          </form>
        </div>

        {/* 2-Column Explore Layout */}
        <div className="explore-content-grid">
          {/* Left Filter Sidebar */}
          <aside className="explore-sidebar">
            <div className="filter-group">
              <h3 className="filter-group-title">Topics</h3>
              <div className="filter-options-list">
                {TOPICS.map((topic) => {
                  const isChecked = selectedTopics.includes(topic);
                  return (
                    <label key={topic} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTopic(topic)}
                      />
                      <span className="custom-check-box">
                        {isChecked && <FiCheck size={12} />}
                      </span>
                      <span className="filter-label-text">{topic}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="filter-divider"></div>

            <div className="filter-group">
              <h3 className="filter-group-title">Type</h3>
              <div className="filter-options-list">
                {TYPES.map((type) => {
                  const isSelected = selectedType === type;
                  return (
                    <label key={type} className="filter-radio-item">
                      <input
                        type="radio"
                        name="docType"
                        checked={isSelected}
                        onChange={() => setSelectedType(type)}
                      />
                      <span className="custom-radio-box">
                        {isSelected && <span className="radio-inner-dot"></span>}
                      </span>
                      <span className="filter-label-text">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="filter-divider"></div>

            <div className="filter-group">
              <h3 className="filter-group-title">Sort</h3>
              <div className="sort-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-dropdown-select"
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Most Popular">Most Popular</option>
                  <option value="Newest">Newest</option>
                  <option value="Most Upvoted">Most Upvoted</option>
                </select>
                <FiChevronDown className="sort-chevron-icon" size={16} />
              </div>
            </div>
          </aside>

          {/* Right Main Documents Column */}
          <div className="explore-docs-column">
            {/* Nav Tabs */}
            <div className="explore-tabs-bar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`explore-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Grid of Docs */}
            <div className="explore-cards-grid">
              {EXPLORE_DOCS.map((doc) => (
                <div
                  key={doc.id}
                  className="explore-card"
                  onClick={() => router.push(`/doc/${doc.id}`)}
                >
                  <div className="explore-card-cover">
                    <div className="cover-header">
                      <span
                        className="cover-badge"
                        style={{ background: `${doc.categoryColor}25`, color: doc.categoryColor }}
                      >
                        {doc.category}
                      </span>
                      <span className="cover-time">
                        <FiClock size={12} /> {doc.readTime}
                      </span>
                    </div>
                    <pre className="cover-code">
                      <code>{doc.codeSnippet}</code>
                    </pre>
                  </div>

                  <div className="explore-card-content">
                    <h3 className="explore-card-title">{doc.title}</h3>
                    <p className="explore-card-excerpt">{doc.excerpt}</p>

                    <div className="explore-card-footer">
                      <div className="explore-author">
                        <div className="author-avatar-chip">
                          {doc.author.charAt(0)}
                        </div>
                        <span className="author-name">{doc.author}</span>
                      </div>

                      <div className="explore-card-stats">
                        <span className="stat-pill">
                          <FiEye size={13} /> {doc.views}
                        </span>
                        <span className="stat-pill highlight">
                          <FiThumbsUp size={13} /> {doc.upvotes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

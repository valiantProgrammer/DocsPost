"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiSearch,
  FiClock,
  FiEye,
  FiThumbsUp,
  FiCheck,
  FiChevronDown,
  FiCode,
  FiServer,
  FiShield,
  FiLayers,
} from "react-icons/fi";
import "./search.css";

const SEARCH_TOPICS = [
  "Python",
  "Backend",
  "APIs",
  "JavaScript",
  "DevOps",
  "System Design",
  "AI & ML",
];

const SEARCH_TYPES = ["All", "Tutorial", "Guide", "Documentation"];

const SAMPLE_RESULTS = [
  {
    id: "fastapi-auth-jwt",
    title: "FastAPI Authentication with JWT",
    category: "Python · Backend",
    description:
      "Learn how to implement secure JWT authentication in FastAPI with access tokens, refresh tokens, role-based authorization, and bcrypt password hashing.",
    author: "Rupayan Dey",
    readTime: "8 min read",
    views: "2.3K views",
    upvotes: "324 upvotes",
    tags: ["Python", "JWT", "FastAPI"],
    icon: FiShield,
    color: "#3b82f6",
  },
  {
    id: "building-secure-apis-fastapi",
    title: "Building Secure APIs with FastAPI",
    category: "Python · Backend",
    description:
      "Essential security practices for FastAPI: CORS management, rate limiting, request validation with Pydantic v2, and OAuth2 scopes.",
    author: "Rupayan Dey",
    readTime: "8 min read",
    views: "2.1K views",
    upvotes: "324 upvotes",
    tags: ["Python", "FastAPI"],
    icon: FiServer,
    color: "#06b6d4",
  },
  {
    id: "user-management-system-fastapi",
    title: "User Management System with FastAPI",
    category: "Python · Backend",
    description:
      "Comprehensive architectural blueprint for multi-tenant user authentication, email verification, password reset, and SQLModel database persistence.",
    author: "Rupayan Dey",
    readTime: "8 min read",
    views: "2.3K views",
    upvotes: "314 upvotes",
    tags: ["Python", "FastAPI", "Database"],
    icon: FiLayers,
    color: "#8b5cf6",
  },
  {
    id: "deploying-fastapi-production",
    title: "Deploying FastAPI on Production",
    category: "Python · DevOps",
    description:
      "Production-ready deployment guide: containerizing FastAPI with Uvicorn and Gunicorn, setting up Nginx reverse proxy, SSL certs, and Docker Compose.",
    author: "Rupayan Dey",
    readTime: "8 min read",
    views: "2.5K views",
    upvotes: "334 upvotes",
    tags: ["Python", "Docker", "FastAPI"],
    icon: FiCode,
    color: "#10b981",
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") || "";
  const topicParam = searchParams.get("topic") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam || topicParam || "fastapi authentication");
  const [selectedTopics, setSelectedTopics] = useState(["Python"]);
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");

  useEffect(() => {
    if (queryParam) setSearchQuery(queryParam);
    if (topicParam) setSelectedTopics([topicParam]);
  }, [queryParam, topicParam]);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="search-layout-wrapper">
      {/* Top Search Input Bar */}
      <div className="search-top-bar">
        <form className="search-input-form" onSubmit={handleSearch}>
          <FiSearch className="search-icon" size={20} />
          <input
            type="text"
            className="search-main-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation, topics, keywords..."
          />
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>
      </div>

      <div className="search-main-grid">
        {/* Left Filters */}
        <aside className="search-filters-sidebar">
          <div className="filter-block">
            <h4 className="filter-title">Topic</h4>
            <div className="filter-items">
              {SEARCH_TOPICS.map((topic) => {
                const isChecked = selectedTopics.includes(topic);
                return (
                  <label key={topic} className="filter-check-row">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTopic(topic)}
                    />
                    <span className="check-box-square">
                      {isChecked && <FiCheck size={12} />}
                    </span>
                    <span className="filter-name">{topic}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-divider-line"></div>

          <div className="filter-block">
            <h4 className="filter-title">Type</h4>
            <div className="filter-items">
              {SEARCH_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <label key={type} className="filter-check-row">
                    <input
                      type="radio"
                      name="searchType"
                      checked={isSelected}
                      onChange={() => setSelectedType(type)}
                    />
                    <span className="radio-circle">
                      {isSelected && <span className="radio-dot"></span>}
                    </span>
                    <span className="filter-name">{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-divider-line"></div>

          <div className="filter-block">
            <h4 className="filter-title">Sort</h4>
            <div className="search-select-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="search-sort-select"
              >
                <option value="Relevance">Relevance</option>
                <option value="Most Upvoted">Most Upvoted</option>
                <option value="Newest">Newest</option>
              </select>
              <FiChevronDown className="select-arrow" size={15} />
            </div>
          </div>
        </aside>

        {/* Right Results Column */}
        <div className="search-results-column">
          <div className="results-count-header">
            <span>1,248 results</span>
          </div>

          <div className="results-list">
            {SAMPLE_RESULTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="search-result-card"
                  onClick={() => router.push(`/doc/${item.id}`)}
                >
                  <div
                    className="result-thumb-box"
                    style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`, color: item.color }}
                  >
                    <Icon size={28} />
                  </div>

                  <div className="result-card-info">
                    <h3 className="result-card-title">{item.title}</h3>
                    <div className="result-category-breadcrumb">
                      {item.category}
                    </div>
                    <p className="result-card-desc">{item.description}</p>

                    <div className="result-card-footer">
                      <div className="result-meta-row">
                        <span className="author-name">👤 {item.author}</span>
                        <span className="dot-sep">·</span>
                        <span>{item.readTime}</span>
                        <span className="dot-sep">·</span>
                        <span>{item.views}</span>
                        <span className="dot-sep">·</span>
                        <span className="result-upvotes-count">
                          <FiThumbsUp size={12} /> {item.upvotes}
                        </span>
                      </div>

                      <div className="result-pill-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="result-pill-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { isDark } = useTheme();

  return (
    <div className="docspost-search-page" data-theme={isDark ? "dark" : "light"}>
      <Header />
      <Suspense
        fallback={
          <div className="search-loading-container">
            <div className="search-spinner"></div>
            <p>Loading results...</p>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiSearch,
  FiArrowRight,
  FiEye,
  FiThumbsUp,
  FiBookOpen,
  FiUsers,
  FiCode,
  FiCompass,
  FiTrendingUp,
  FiClock,
  FiShare2,
} from "react-icons/fi";
import "./page.css";

export default function Home() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleTagClick = (tag) => {
    router.push(`/search?topic=${encodeURIComponent(tag)}`);
  };

  const topicPills = [
    "DSA",
    "Python",
    "Java",
    "JavaScript",
    "Web Dev",
    "Backend",
    "AI & ML",
    "DevOps",
    "System Design",
  ];

  const featuredDocs = [
    {
      id: "mastering-system-design",
      title: "Mastering System Design",
      description:
        "Comprehensive architectural blueprints for designing distributed, fault-tolerant and high-concurrency cloud systems.",
      category: "System Design",
      categoryColor: "#3b82f6",
      author: "Rupayan Dey",
      authorRole: "Tech Lead",
      views: "2.4K",
      upvotes: "334",
      readTime: "15 min read",
      codeSnippet: `class DistributedCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()`,
    },
    {
      id: "react-hooks-guide",
      title: "React Hooks Complete Guide",
      description:
        "Master useEffect, useMemo, custom hooks, and concurrent features to build rock-solid React web applications.",
      category: "Frontend",
      categoryColor: "#06b6d4",
      author: "Ananya Roy",
      authorRole: "Frontend Engineer",
      views: "3.1K",
      upvotes: "412",
      readTime: "12 min read",
      codeSnippet: `function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, set] = useState(value);\n  // effect logic here\n}`,
    },
    {
      id: "dsa-patterns",
      title: "DSA Patterns for Interviews",
      description:
        "Essential mental models covering two pointers, sliding window, topological sort, and dynamic programming.",
      category: "DSA",
      categoryColor: "#8b5cf6",
      author: "Arjun Das",
      authorRole: "Competitive Coder",
      views: "4.8K",
      upvotes: "520",
      readTime: "20 min read",
      codeSnippet: `def sliding_window_max(nums, k):\n    q = deque()\n    res = []\n    for i, n in enumerate(nums): ...`,
    },
    {
      id: "ml-pipelines",
      title: "Production ML Pipelines",
      description:
        "Step-by-step architecture for automated feature engineering, model training, evaluation, and zero-downtime serving.",
      category: "AI & ML",
      categoryColor: "#10b981",
      author: "Sneha Sharma",
      authorRole: "ML Architect",
      views: "1.9K",
      upvotes: "280",
      readTime: "18 min read",
      codeSnippet: `@pipeline(name="inference_flow")\ndef run_pipeline(input_batch):\n    features = extract(input_batch)\n    return model.predict(features)`,
    },
  ];

  return (
    <div className="docspost-home-page" data-theme={isDark ? "dark" : "light"}>
      <Header />

      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="home-hero-glow"></div>
        <div className="home-hero-container">
          <div className="home-hero-left">
            <div className="home-hero-pill-badge">
              <span className="badge-pulse"></span>
              <span>DocsPost v2.0 is Live</span>
            </div>

            <h1 className="home-hero-title">
              Share what you know.
              <br />
              <span className="hero-title-highlight">Discover what you need.</span>
            </h1>

            <p className="home-hero-tagline">Write. Learn. Build. Share.</p>

            <p className="home-hero-description">
              A modern knowledge platform for developers, students and technical creators.
              Craft interactive documentation, study engineering roadmaps, and publish with pride.
            </p>

            <div className="home-hero-buttons">
              <Link href="/explore" className="home-btn-primary">
                <span>Explore Docs</span>
                <FiArrowRight size={18} />
              </Link>
              <Link href="/workspace/new" className="home-btn-secondary">
                <span>Start Writing</span>
              </Link>
            </div>
          </div>

          {/* Floating Hero Card Preview */}
          <div className="home-hero-right">
            <div className="hero-card-glow-bg"></div>
            <div className="hero-preview-card">
              <div className="preview-card-header">
                <div className="preview-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="preview-file-tag">Python Async Programming</span>
                <span className="preview-lang-pill">python3</span>
              </div>

              <div className="preview-card-code">
                <pre>
                  <code>
                    <span className="code-kw">import</span> asyncio{"\n"}
                    <span className="code-kw">from</span> typing <span className="code-kw">import</span> AsyncGenerator{"\n\n"}
                    <span className="code-kw">async def</span> <span className="code-fn">stream_engine_metrics</span>():{"\n"}
                    {"    "}<span className="code-kw">async for</span> chunk <span className="code-kw">in</span> data_emitter():{"\n"}
                    {"        "}<span className="code-kw">yield</span> process_packet(chunk){"\n\n"}
                    <span className="code-comment"># Optimized for 100k req/sec throughput</span>
                  </code>
                </pre>
              </div>

              <div className="preview-card-meta">
                <div className="preview-author-info">
                  <div className="preview-author-avatar">RD</div>
                  <div>
                    <div className="preview-author-name">Rupayan Dey</div>
                    <div className="preview-author-title">Full Stack Engineer</div>
                  </div>
                </div>
                <div className="preview-stats">
                  <span className="stat-item">
                    <FiEye size={14} /> 2.4K views
                  </span>
                  <span className="stat-item highlight">
                    <FiThumbsUp size={14} /> 342 upvotes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Search Pill Bar */}
      <section className="home-search-section">
        <div className="home-search-inner">
          <form className="home-search-bar" onSubmit={handleSearchSubmit}>
            <FiSearch className="search-bar-icon" size={20} />
            <input
              type="text"
              placeholder="Search documentation, tutorials, guides and experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar-input"
            />
            <button type="submit" className="search-bar-submit-btn">
              Search
            </button>
          </form>

          {/* Quick topic pills */}
          <div className="home-topic-pills-row">
            {topicPills.map((tag) => (
              <button
                key={tag}
                type="button"
                className="home-topic-pill"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Row */}
      <section className="home-stats-section">
        <div className="home-stats-grid">
          <div className="stat-box">
            <span className="stat-number">12K+</span>
            <span className="stat-label">Documents</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">48K+</span>
            <span className="stat-label">Readers</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">3.2K+</span>
            <span className="stat-label">Creators</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">120+</span>
            <span className="stat-label">Topics</span>
          </div>
        </div>
      </section>

      {/* Featured Documentation Section */}
      <section className="home-featured-section">
        <div className="home-featured-inner">
          <div className="featured-section-header">
            <div>
              <h2 className="featured-section-title">Featured Documentation</h2>
              <p className="featured-section-subtitle">
                Explore hand-picked, high-impact technical documents crafted by top developers.
              </p>
            </div>
            <Link href="/explore" className="view-all-link">
              <span>View All</span>
              <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="featured-docs-grid">
            {featuredDocs.map((doc) => (
              <div
                key={doc.id}
                className="featured-doc-card"
                onClick={() => router.push(`/doc/${doc.id}`)}
              >
                <div className="doc-card-preview-banner">
                  <div className="doc-card-banner-header">
                    <span
                      className="doc-category-badge"
                      style={{ background: `${doc.categoryColor}20`, color: doc.categoryColor }}
                    >
                      {doc.category}
                    </span>
                    <span className="doc-readtime">
                      <FiClock size={12} /> {doc.readTime}
                    </span>
                  </div>
                  <pre className="doc-card-code-preview">
                    <code>{doc.codeSnippet}</code>
                  </pre>
                </div>

                <div className="doc-card-body">
                  <h3 className="doc-card-title">{doc.title}</h3>
                  <p className="doc-card-desc">{doc.description}</p>

                  <div className="doc-card-footer">
                    <div className="doc-card-author">
                      <div className="author-circle-mini">
                        {doc.author.charAt(0)}
                      </div>
                      <span className="author-name-text">{doc.author}</span>
                    </div>

                    <div className="doc-card-metrics">
                      <span className="metric-tag">
                        <FiEye size={13} /> {doc.views}
                      </span>
                      <span className="metric-tag highlight">
                        <FiThumbsUp size={13} /> {doc.upvotes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Explore Strip */}
      <section className="home-community-cta-section">
        <div className="community-cta-inner">
          <div className="community-cta-text">
            <h2>Ready to share your engineering expertise?</h2>
            <p>
              Join thousands of developers publishing production guides, architecture breakdowns,
              and code tutorials on DocsPost today.
            </p>
          </div>
          <div className="community-cta-actions">
            <Link href="/workspace/new" className="home-btn-primary">
              Write a Document
            </Link>
            <Link href="/learning" className="home-btn-outline">
              Explore Roadmaps
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

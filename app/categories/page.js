"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiSearch,
  FiServer,
  FiLayout,
  FiCpu,
  FiLayers,
  FiCloud,
  FiCode,
  FiSmartphone,
  FiDatabase,
  FiArrowRight,
} from "react-icons/fi";
import "./categories.css";

const CATEGORIES_DATA = [
  {
    id: "backend",
    name: "Backend Engineering",
    count: "420+ docs",
    icon: FiServer,
    color: "#2563eb",
    description: "Designing resilient APIs, authentication, microservices, and backend performance.",
    topics: ["FastAPI", "Node.js", "Go", "Spring Boot", "GraphQL"],
  },
  {
    id: "frontend",
    name: "Frontend Development",
    count: "380+ docs",
    icon: FiLayout,
    color: "#06b6d4",
    description: "Modern web architecture, component design systems, state management, and performance.",
    topics: ["React", "Next.js", "Vue", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    count: "290+ docs",
    icon: FiCpu,
    color: "#10b981",
    description: "Production ML pipelines, vector databases, RAG systems, and LLM fine-tuning.",
    topics: ["PyTorch", "HuggingFace", "LangChain", "Model Serving", "MLOps"],
  },
  {
    id: "system-design",
    name: "System Design & Architecture",
    count: "210+ docs",
    icon: FiLayers,
    color: "#8b5cf6",
    description: "Scalability patterns, load balancing, event-driven systems, and distributed consensus.",
    topics: ["Distributed Systems", "Kafka", "Sharding", "CAP Theorem", "High Concurrency"],
  },
  {
    id: "devops",
    name: "DevOps & Cloud",
    count: "195+ docs",
    icon: FiCloud,
    color: "#ec4899",
    description: "Continuous integration, container orchestration, cloud platforms, and infrastructure as code.",
    topics: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD Actions"],
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    count: "340+ docs",
    icon: FiCode,
    color: "#f59e0b",
    description: "Essential interview patterns, graph algorithms, dynamic programming, and complexity proofs.",
    topics: ["Trees & Graphs", "Dynamic Programming", "Sliding Window", "Bit Manipulation"],
  },
  {
    id: "mobile",
    name: "Mobile Development",
    count: "140+ docs",
    icon: FiSmartphone,
    color: "#3b82f6",
    description: "Native and cross-platform mobile apps for iOS and Android with optimized UX.",
    topics: ["React Native", "Flutter", "Swift", "Kotlin", "Offline Sync"],
  },
  {
    id: "databases",
    name: "Database Systems",
    count: "160+ docs",
    icon: FiDatabase,
    color: "#14b8a6",
    description: "Relational modeling, NoSQL document stores, indexing, transactions, and replication.",
    topics: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "SQL Optimization"],
  },
];

export default function CategoriesPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = CATEGORIES_DATA.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="docspost-categories-page" data-theme={isDark ? "dark" : "light"}>
      <Header />

      <main className="categories-main-content">
        <div className="categories-hero-banner">
          <h1 className="categories-hero-title">Explore Categories</h1>
          <p className="categories-hero-subtitle">
            Browse through organized engineering domains and find top-rated technical documentation.
          </p>

          <div className="categories-search-wrap">
            <FiSearch className="cat-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search categories, topics, or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cat-search-input"
            />
          </div>
        </div>

        <div className="categories-grid-container">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => router.push(`/explore?topic=${encodeURIComponent(cat.name)}`)}
              >
                <div className="cat-card-header">
                  <div
                    className="cat-icon-container"
                    style={{ background: `${cat.color}15`, color: cat.color }}
                  >
                    <Icon size={26} />
                  </div>
                  <span className="cat-docs-count">{cat.count}</span>
                </div>

                <h3 className="cat-card-name">{cat.name}</h3>
                <p className="cat-card-desc">{cat.description}</p>

                <div className="cat-card-topics">
                  {cat.topics.map((topic) => (
                    <span key={topic} className="cat-topic-tag">
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="cat-card-footer">
                  <span className="cat-explore-text">Explore Guides</span>
                  <FiArrowRight size={16} className="cat-arrow-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

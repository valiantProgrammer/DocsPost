"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiBookOpen,
  FiCompass,
  FiCheckCircle,
  FiPlay,
  FiArrowRight,
  FiAward,
  FiStar,
} from "react-icons/fi";
import "./learning.css";

const ENROLLED_TRACKS = [
  {
    id: "system-design-mastery",
    title: "System Design for Scale",
    description: "Distributed architectures, microservices, caches, partition strategies, and CAP tradeoffs.",
    progress: 75,
    modulesDone: 12,
    totalModules: 16,
    color: "#2563eb",
  },
  {
    id: "fastapi-nextjs-fullstack",
    title: "Full Stack FastAPI & Next.js",
    description: "Build production-grade web applications with modern Python backends and React frontends.",
    progress: 45,
    modulesDone: 9,
    totalModules: 20,
    color: "#06b6d4",
  },
  {
    id: "devops-k8s-cloud",
    title: "DevOps & Kubernetes Production",
    description: "CI/CD pipelines, container orchestration, monitoring with Prometheus, and zero-downtime rollouts.",
    progress: 20,
    modulesDone: 4,
    totalModules: 18,
    color: "#8b5cf6",
  },
];

const ENGINEERING_ROADMAPS = [
  {
    id: "backend-roadmap",
    title: "Backend Engineering Roadmap",
    topics: ["Databases & SQL", "Caching & Redis", "Message Queues (Kafka)", "API Security & OAuth", "Microservices"],
    level: "Intermediate - Advanced",
    estimatedHours: "48 hours",
  },
  {
    id: "system-design-roadmap",
    title: "Distributed Systems & Cloud Architecture",
    topics: ["Load Balancing", "Consistent Hashing", "Replication & Sharding", "Consensus (Raft/Paxos)", "Event Sourcing"],
    level: "Senior Engineer",
    estimatedHours: "60 hours",
  },
  {
    id: "aiml-roadmap",
    title: "Applied AI & Machine Learning Engineering",
    topics: ["Vector Embeddings", "RAG Architectures", "Model Fine-tuning", "FastAPI Inference Serving", "Evaluation Metrics"],
    level: "All Levels",
    estimatedHours: "52 hours",
  },
  {
    id: "devops-roadmap",
    title: "Site Reliability & Cloud Infrastructure",
    topics: ["Linux Internals", "Docker & Podman", "Kubernetes", "Terraform & IaC", "Observability"],
    level: "Intermediate",
    estimatedHours: "40 hours",
  },
];

export default function Learning() {
  const { isDark } = useTheme();

  return (
    <div className="dashboard-container" data-theme={isDark ? "dark" : "light"}>
      <Header />
      <DashboardSidebar activeTab="learning" />

      <main className="dashboard-main">
        <div className="learning-dashboard-container">
          {/* Header */}
          <div className="learning-header">
            <div>
              <h1 className="learning-title">My Learning</h1>
              <p className="learning-subtitle">
                Track your active engineering tracks, study roadmaps, and level up your skills.
              </p>
            </div>
          </div>

          {/* Enrolled Tracks Grid */}
          <section className="tracks-section">
            <h2 className="section-title">In Progress Tracks</h2>
            <div className="tracks-grid">
              {ENROLLED_TRACKS.map((track) => (
                <div key={track.id} className="track-card">
                  <div className="track-card-top">
                    <span
                      className="track-pill-badge"
                      style={{ color: track.color, background: `${track.color}15` }}
                    >
                      Engineering Track
                    </span>
                    <span className="track-modules-count">
                      {track.modulesDone} / {track.totalModules} modules
                    </span>
                  </div>

                  <h3 className="track-title">{track.title}</h3>
                  <p className="track-desc">{track.description}</p>

                  <div className="track-progress-block">
                    <div className="progress-info-row">
                      <span className="progress-label">Progress</span>
                      <span className="progress-val">{track.progress}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${track.progress}%`, background: track.color }}
                      ></div>
                    </div>
                  </div>

                  <button className="resume-track-btn" style={{ borderColor: track.color }}>
                    <FiPlay size={14} style={{ color: track.color }} />
                    <span>Continue Track</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Curated Roadmaps */}
          <section className="roadmaps-section">
            <h2 className="section-title">Curated Engineering Roadmaps</h2>
            <div className="roadmaps-grid">
              {ENGINEERING_ROADMAPS.map((roadmap) => (
                <div key={roadmap.id} className="roadmap-card">
                  <div className="roadmap-header">
                    <div className="roadmap-badge-level">{roadmap.level}</div>
                    <span className="roadmap-hours">{roadmap.estimatedHours}</span>
                  </div>

                  <h3 className="roadmap-title">{roadmap.title}</h3>

                  <div className="roadmap-topics-list">
                    {roadmap.topics.map((t) => (
                      <span key={t} className="roadmap-topic-chip">
                        <FiCheckCircle size={12} className="check-chip-icon" /> {t}
                      </span>
                    ))}
                  </div>

                  <button className="view-roadmap-btn">
                    <span>Explore Roadmap</span>
                    <FiArrowRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

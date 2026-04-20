"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/components/Header";
import "./search.css";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const initialPage = parseInt(searchParams.get("page")) || 1;

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(0);

    const handleSearch = async (e, newPage = 1) => {
        e?.preventDefault();

        if (!query.trim()) {
            setError("Please enter a search query");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const url = `/api/documents/search?q=${encodeURIComponent(query)}&page=${newPage}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Search failed");
                setResults([]);
                return;
            }

            setResults(data.results);
            setTotalPages(data.pages);
            setPage(newPage);

            // Update URL
            const params = new URLSearchParams();
            params.set("q", query);
            if (newPage > 1) params.set("page", newPage);
            router.push(`/search?${params.toString()}`);
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to perform search");
        } finally {
            setLoading(false);
        }
    };

    // Auto-search on mount if query exists
    useEffect(() => {
        if (initialQuery) {
            handleSearch(null, initialPage);
        }
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <>
            <Header />
            <div className="search-page-wrapper">
                <div className="search-container-inner">
                    {/* Search Bar Section */}
                    <div className="search-top-section">
                        <form onSubmit={(e) => handleSearch(e, 1)} className="search-form-wrapper">
                            <input
                                type="text"
                                className="search-input-main"
                                placeholder="Search documentation..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch(e, 1);
                                }}
                            />
                            <button type="submit" className="search-btn">
                                <FaSearch className="search-icon" />
                            </button>
                        </form>
                    </div>

                    {/* Two Column Layout */}
                    <div className="search-layout">
                        {/* Left Column - Results */}
                        <div className="search-left-column">
                            {/* Error Message */}
                            {error && <div className="error-alert">{error}</div>}

                            {/* Loading State */}
                            {loading && (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Searching...</p>
                                </div>
                            )}

                            {/* Results */}
                            {!loading && query && (
                                <>
                                    {results.length > 0 ? (
                                        <div className="search-results-section">
                                            <div className="results-grid">
                                                {results.map((doc) => (
                                                    <div key={doc._id} className="result-item">
                                                        <Link href={`/doc/${doc.slug}`} className="result-item-title">
                                                            {doc.title}
                                                        </Link>

                                                        <div className="result-item-meta">
                                                            Last Updated : {formatDate(doc.updatedAt || doc.createdAt)}
                                                        </div>

                                                        <p className="result-item-description">{doc.description}</p>

                                                        <Link href={`/doc/${doc.slug}`} className="read-more-link">
                                                            Read More
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="pagination-section">
                                                    <button
                                                        onClick={() => handleSearch(null, page - 1)}
                                                        disabled={page === 1}
                                                        className="pagination-btn"
                                                    >
                                                        ← Previous
                                                    </button>
                                                    <span className="page-info">
                                                        Page {page} of {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => handleSearch(null, page + 1)}
                                                        disabled={page === totalPages}
                                                        className="pagination-btn"
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-results-state">
                                            <p className="no-results-title">No results found</p>
                                            <p className="no-results-subtitle">
                                                Try searching with different keywords
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Initial State */}
                            {!query && !loading && (
                                <div className="empty-search-state">
                                    <FaSearch size={56} />
                                    <h2>Search Documentation</h2>
                                    <p>Enter keywords to find tutorials, guides, and learning resources</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="search-right-column">
                            <div className="sidebar-section">
                                <div className="sidebar-tabs">
                                    <button className="sidebar-tab active">Fresher Jobs</button>
                                    <button className="sidebar-tab">Experienced Jobs</button>
                                </div>
                                <div className="sidebar-content">
                                    <p className="placeholder-text">Job listings will appear here</p>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h3 className="sidebar-title">Upcoming Courses</h3>
                                <div className="sidebar-content">
                                    <p className="placeholder-text">Course recommendations will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

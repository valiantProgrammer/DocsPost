"use client";
import { useState, useEffect } from "react";
import { FiThumbsUp, FiFlag, FiEye } from "react-icons/fi";
import "./DocEngagement.css";

export default function DocEngagement({ docId }) {
    const [stats, setStats] = useState({
        views: 0,
        upvotes: 0,
        votes: 0,
        likes: 0,
        dislikes: 0,
        engagementRate: 0,
    });
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [reportStatus, setReportStatus] = useState("");

    useEffect(() => {
        // Get user email from localStorage
        const savedEmail = localStorage.getItem("docspost-email");
        setUserEmail(savedEmail || "");

        // Fetch stats
        fetchStats();
    }, [docId]);

    // Log view after userEmail is set
    useEffect(() => {
        if (userEmail !== undefined) {
            logView();
        }
    }, [docId, userEmail]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/docs/${docId}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUpvoteStatus = async () => {
        if (!userEmail) return;

        try {
            const response = await fetch(
                `/api/docs/upvote?docId=${docId}&userEmail=${encodeURIComponent(userEmail)}`
            );
            if (response.ok) {
                const data = await response.json();
                setIsUpvoted(data.isUpvoted);
            }
        } catch (error) {
            console.error("Error fetching upvote status:", error);
        }
    };

    useEffect(() => {
        if (userEmail) {
            fetchUpvoteStatus();
        }
    }, [userEmail, docId]);

    const logView = async () => {
        try {
            const response = await fetch("/api/docs/log-view-optimized", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docId,
                    userEmail: userEmail || "anonymous",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error logging view:", errorData);
            }
        } catch (error) {
            console.error("Error logging view:", error);
        }
    };

    const handleUpvote = async () => {
        if (!userEmail) {
            alert("Please sign in to upvote");
            return;
        }

        try {
            const response = await fetch("/api/docs/upvote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docId,
                    userEmail,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsUpvoted(data.isUpvoted);
                // Refetch stats to ensure accurate count
                fetchStats();
                fetchUpvoteStatus();
            } else {
                const errorData = await response.json();
                console.error("Upvote error:", errorData);
                alert(errorData.error || "Failed to upvote. Please try again.");
            }
        } catch (error) {
            console.error("Error upvoting:", error);
            alert("Failed to upvote. Please try again.");
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            alert("Please select a reason for reporting");
            return;
        }

        try {
            const response = await fetch("/api/docs/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docId,
                    userEmail: userEmail || "anonymous",
                    reason: reportReason,
                    description: reportDescription,
                }),
            });

            if (response.ok) {
                setReportStatus("success");
                setReportReason("");
                setReportDescription("");
                setShowReportModal(false);

                setTimeout(() => {
                    setReportStatus("");
                }, 3000);
            } else {
                const data = await response.json();
                setReportStatus(data.error || "Failed to submit report");
            }
        } catch (error) {
            console.error("Error reporting:", error);
            setReportStatus("Failed to submit report. Please try again.");
        }
    };

    return (
        <>
            <div className="engagement-actions">
                {/* Reader Count */}
                <div className="engagement-icon-btn" title={`${stats.views} readers`}>
                    <FiEye size={20} />
                    <span className="engagement-badge">{isLoading ? "0" : stats.views}</span>
                </div>

                {/* Upvote Button */}
                <button
                    className={`engagement-icon-btn ${isUpvoted ? "upvoted" : ""}`}
                    onClick={handleUpvote}
                    title={userEmail ? "Upvote this article" : "Sign in to upvote"}
                >
                    <FiThumbsUp
                        size={20}
                        fill={isUpvoted ? "currentColor" : "none"}
                    />
                    <span className="engagement-badge">{stats.upvotes}</span>
                </button>

                {/* Report Button */}
                <button
                    className="engagement-icon-btn report-btn"
                    onClick={() => setShowReportModal(true)}
                    title="Report this article"
                >
                    <FiFlag size={20} />
                </button>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div
                        className="report-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Report This Article</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowReportModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="reason">Reason for reporting</label>
                                <select
                                    id="reason"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="spam">Spam</option>
                                    <option value="incorrect">Incorrect Information</option>
                                    <option value="plagiarism">Plagiarism</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Additional details (optional)</label>
                                <textarea
                                    id="description"
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    className="form-control"
                                    placeholder="Provide any additional information..."
                                    rows={4}
                                />
                            </div>

                            {reportStatus === "success" && (
                                <div className="alert alert-success">
                                    Thank you for reporting. We'll review it shortly.
                                </div>
                            )}

                            {reportStatus && reportStatus !== "success" && (
                                <div className="alert alert-error">{reportStatus}</div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowReportModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReport}
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";

import { useState } from "react";
import "./ReportModal.css";

export default function ReportModal({ isOpen, onClose, onSubmit, isLoading }) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert("Please select a reason");
            return;
        }
        onSubmit({ reason, description });
        setReason("");
        setDescription("");
    };

    const handleClose = () => {
        setReason("");
        setDescription("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="report-modal-backdrop" onClick={handleClose}></div>
            <div className="report-modal">
                <div className="report-modal-header">
                    <h2>Report Document</h2>
                    <button className="close-btn" onClick={handleClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-group">
                        <label htmlFor="reason">Reason for Report *</label>
                        <select
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isLoading}
                            required
                        >
                            <option value="">Select a reason</option>
                            <option value="inappropriate">Inappropriate Content</option>
                            <option value="inaccurate">Inaccurate Information</option>
                            <option value="spam">Spam or Promotional</option>
                            <option value="outdated">Outdated Content</option>
                            <option value="plagiarism">Plagiarism Concerns</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Additional Details</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide more details about your report (optional)"
                            rows="4"
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    <div className="report-modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

"use client";
import { useState, useEffect } from "react";
import {
    FiX,
    FiMapPin,
    FiGlobe,
    FiFileText,
    FiLink2,
    FiBook,
    FiTag,
    FiChevronDown,
} from "react-icons/fi";
import { COUNTRIES, filterCountries } from "@/lib/countries";
import "./EditProfileModal.css";

export default function EditProfileModal({
    isOpen,
    onClose,
    initialData,
    onSubmit,
    isLoading,
}) {
    const [formData, setFormData] = useState({
        bio: "",
        city: "",
        country: "",
        educations: [],
        domains: [],
    });

    const [countrySearch, setCountrySearch] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
    const [newEducation, setNewEducation] = useState({
        type: "school",
        institution: "",
        field: "",
        year: new Date().getFullYear(),
    });
    const [newDomain, setNewDomain] = useState("");

    // Initialize form with existing data
    useEffect(() => {
        if (initialData) {
            setFormData({
                bio: initialData.bio || "",
                city: initialData.city || "",
                country: initialData.country || "",
                educations: initialData.educations || [],
                domains: initialData.domains || [],
            });
            setCountrySearch(initialData.country || "");
        }
    }, [initialData, isOpen]);

    // Handle country search
    useEffect(() => {
        if (countrySearch) {
            setFilteredCountries(filterCountries(countrySearch));
        } else {
            setFilteredCountries(COUNTRIES);
        }
    }, [countrySearch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCountrySelect = (country) => {
        setFormData((prev) => ({
            ...prev,
            country: country,
        }));
        setCountrySearch(country);
        setShowCountryDropdown(false);
    };

    const addEducation = () => {
        if (newEducation.institution.trim()) {
            setFormData((prev) => ({
                ...prev,
                educations: [...prev.educations, { ...newEducation }],
            }));
            setNewEducation({
                type: "school",
                institution: "",
                field: "",
                year: new Date().getFullYear(),
            });
        }
    };

    const removeEducation = (index) => {
        setFormData((prev) => ({
            ...prev,
            educations: prev.educations.filter((_, i) => i !== index),
        }));
    };

    const addDomain = () => {
        if (newDomain.trim() && !formData.domains.includes(newDomain.trim())) {
            setFormData((prev) => ({
                ...prev,
                domains: [...prev.domains, newDomain.trim()],
            }));
            setNewDomain("");
        }
    };

    const removeDomain = (index) => {
        setFormData((prev) => ({
            ...prev,
            domains: prev.domains.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="edit-profile-modal-wrapper">
            <div className="edit-profile-modal-overlay" onClick={onClose} />
            <div className="edit-profile-modal">
                {/* Header */}
                <div className="edit-modal-header">
                    <h2>Edit Profile</h2>
                    <button
                        className="edit-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="edit-modal-form">
                    {/* Bio Section */}
                    <div className="form-section">
                        <label className="section-label">
                            <FiFileText size={18} />
                            <span>About You</span>
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Write a short bio about yourself..."
                            className="form-textarea"
                            rows="4"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Location Section */}
                    <div className="form-section">
                        <label className="section-label">
                            <FiMapPin size={18} />
                            <span>Location</span>
                        </label>
                        <div className="location-inputs">
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                                className="form-input"
                                disabled={isLoading}
                            />
                            <div className="country-dropdown-wrapper">
                                <input
                                    type="text"
                                    value={countrySearch}
                                    onChange={(e) => {
                                        setCountrySearch(e.target.value);
                                        setShowCountryDropdown(true);
                                    }}
                                    onFocus={() => setShowCountryDropdown(true)}
                                    placeholder="Select country..."
                                    className="form-input"
                                    disabled={isLoading}
                                />
                                <FiChevronDown className="dropdown-icon" />
                                {showCountryDropdown && (
                                    <div className="country-dropdown">
                                        {filteredCountries.length > 0 ? (
                                            filteredCountries.map((country) => (
                                                <div
                                                    key={country}
                                                    className="country-option"
                                                    onClick={() =>
                                                        handleCountrySelect(country)
                                                    }
                                                >
                                                    {country}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="country-option disabled">
                                                No countries found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Public Profile Link */}
                    <div className="form-section">
                        <label className="section-label">
                            <FiLink2 size={18} />
                            <span>Public Profile</span>
                        </label>
                        <div className="public-profile-link">
                            <span className="profile-url">
                                {typeof window !== "undefined"
                                    ? `${window.location.origin}/${initialData?.username || "username"}`
                                    : "localhost:3000/username"}
                            </span>
                            <button
                                type="button"
                                className="copy-btn"
                                onClick={() => {
                                    const url = `${window.location.origin}/${initialData?.username || "username"
                                        }`;
                                    navigator.clipboard.writeText(url);
                                    alert("Profile link copied!");
                                }}
                                disabled={isLoading}
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Educations Section */}
                    <div className="form-section">
                        <label className="section-label">
                            <FiBook size={18} />
                            <span>Education</span>
                        </label>
                        <div className="educations-list">
                            {formData.educations.map((edu, index) => (
                                <div key={index} className="education-item">
                                    <div className="education-info">
                                        <div className="education-type">
                                            {edu.type?.charAt(0).toUpperCase() +
                                                edu.type?.slice(1)}
                                        </div>
                                        <div className="education-details">
                                            <p className="institution">
                                                {edu.institution}
                                            </p>
                                            {edu.field && (
                                                <p className="field">{edu.field}</p>
                                            )}
                                            {edu.year && (
                                                <p className="year">
                                                    Completed: {edu.year}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeEducation(index)}
                                        disabled={isLoading}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="add-education-form">
                            <div className="form-row">
                                <select
                                    value={newEducation.type}
                                    onChange={(e) =>
                                        setNewEducation((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    className="form-select"
                                    disabled={isLoading}
                                >
                                    <option value="school">School</option>
                                    <option value="college">College</option>
                                    <option value="university">University</option>
                                </select>
                                <input
                                    type="text"
                                    value={newEducation.institution}
                                    onChange={(e) =>
                                        setNewEducation((prev) => ({
                                            ...prev,
                                            institution: e.target.value,
                                        }))
                                    }
                                    placeholder="Institution name"
                                    className="form-input"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="text"
                                    value={newEducation.field}
                                    onChange={(e) =>
                                        setNewEducation((prev) => ({
                                            ...prev,
                                            field: e.target.value,
                                        }))
                                    }
                                    placeholder="Field of study"
                                    className="form-input"
                                    disabled={isLoading}
                                />
                                <input
                                    type="number"
                                    value={newEducation.year}
                                    onChange={(e) =>
                                        setNewEducation((prev) => ({
                                            ...prev,
                                            year: parseInt(e.target.value),
                                        }))
                                    }
                                    placeholder="Year"
                                    className="form-input year-input"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="button"
                                className="add-btn"
                                onClick={addEducation}
                                disabled={isLoading || !newEducation.institution}
                            >
                                + Add Education
                            </button>
                        </div>
                    </div>

                    {/* Domains Section */}
                    <div className="form-section">
                        <label className="section-label">
                            <FiTag size={18} />
                            <span>Domains / Expertise</span>
                        </label>
                        <div className="domains-list">
                            {formData.domains.map((domain, index) => (
                                <div key={index} className="domain-tag">
                                    <span>{domain}</span>
                                    <button
                                        type="button"
                                        className="remove-tag"
                                        onClick={() => removeDomain(index)}
                                        disabled={isLoading}
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="add-domain-form">
                            <input
                                type="text"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addDomain();
                                    }
                                }}
                                placeholder="e.g., React, Node.js, MongoDB..."
                                className="form-input"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="add-btn"
                                onClick={addDomain}
                                disabled={isLoading || !newDomain.trim()}
                            >
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="modal-loading-overlay">
                            <div className="spinner"></div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

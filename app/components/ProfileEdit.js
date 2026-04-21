"use client"
import { useState, useEffect } from "react";
import { FiX, FiArrowLeft, FiMapPin, FiUser, FiLink } from "react-icons/fi";
import { FaTwitter, FaLinkedin, FaGithub, FaYoutube, FaInstagram, FaGlobe } from "react-icons/fa";
import { COUNTRIES } from "@/lib/countries";
import CitySuggestions from "./CitySuggestions";
import "./ProfileEdit.css";

const SOCIAL_PLATFORMS = [
    { id: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/username', icon: FaTwitter },
    { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: FaLinkedin },
    { id: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: FaGithub },
    { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: FaYoutube },
    { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: FaInstagram },
    { id: 'portfolio', label: 'Portfolio/Website', placeholder: 'https://yourwebsite.com', icon: FaGlobe },
];

export default function ProfileEdit({ profileData, onClose, userId, isInline = false }) {
    const [formData, setFormData] = useState({
        name: profileData?.name || "",
        bio: profileData?.bio || "",
        city: profileData?.city || "",
        country: profileData?.country || "",
        educations: profileData?.educations || [],
        domains: profileData?.domains || [],
        socialLinks: profileData?.socialLinks || {
            twitter: "",
            linkedin: "",
            github: "",
            youtube: "",
            instagram: "",
            portfolio: "",
        },
        profilePicture: profileData?.profilePicture || "",
    });

    const [educationInput, setEducationInput] = useState("");
    const [domainInput, setDomainInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    };

    // Handle city input with suggestions
    const handleCityChange = async (value) => {
        setFormData(prev => ({
            ...prev,
            city: value
        }));

        if (value.length > 1 && formData.country) {
            try {
                const response = await fetch(
                    `/api/cities?country=${encodeURIComponent(formData.country)}&search=${encodeURIComponent(value)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCitySuggestions(data.cities || []);
                    setShowCitySuggestions(true);
                }
            } catch (err) {
                console.error("Error fetching city suggestions:", err);
            }
        }
    };

    const selectCity = (city) => {
        setFormData(prev => ({
            ...prev,
            city: city
        }));
        setShowCitySuggestions(false);
        setCitySuggestions([]);
    };

    // Add education
    const handleAddEducation = () => {
        if (educationInput.trim()) {
            setFormData(prev => ({
                ...prev,
                educations: [...prev.educations, educationInput.trim()]
            }));
            setEducationInput("");
        }
    };

    // Remove education
    const handleRemoveEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            educations: prev.educations.filter((_, i) => i !== index)
        }));
    };

    // Add domain
    const handleAddDomain = () => {
        if (domainInput.trim()) {
            setFormData(prev => ({
                ...prev,
                domains: [...prev.domains, domainInput.trim()]
            }));
            setDomainInput("");
        }
    };

    // Remove domain
    const handleRemoveDomain = (index) => {
        setFormData(prev => ({
            ...prev,
            domains: prev.domains.filter((_, i) => i !== index)
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (!userId) {
                setError("User ID not found. Please refresh the page.");
                return;
            }

            const response = await fetch("/api/profile/update-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    name: formData.name,
                    bio: formData.bio,
                    city: formData.city,
                    country: formData.country,
                    educations: formData.educations,
                    domains: formData.domains,
                    socialLinks: formData.socialLinks,
                    profilePicture: formData.profilePicture,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Return updated data and close edit mode
                onClose({
                    name: formData.name,
                    bio: formData.bio,
                    city: formData.city,
                    country: formData.country,
                    educations: formData.educations,
                    domains: formData.domains,
                    socialLinks: formData.socialLinks,
                });
            } else {
                setError(data.error || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={isInline ? "profile-edit-inline-container" : "profile-edit-container"}>
            <div className={isInline ? "profile-edit-inline-wrapper" : "profile-edit-wrapper"}>
                {/* Header */}
                <div className="profile-edit-header">
                    {isInline ? (
                        <>
                            <h2 style={{ flex: 1, margin: 0 }}>Edit Profile</h2>
                            <button
                                className="btn-close-edit"
                                onClick={() => onClose(null)}
                                disabled={isLoading}
                                title="Cancel"
                            >
                                <FiX size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn-back"
                                onClick={() => onClose(null)}
                                disabled={isLoading}
                            >
                                <FiArrowLeft size={20} />
                                Back to Profile
                            </button>
                            <h2>Edit Profile</h2>
                        </>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="profile-edit-form">
                    {/* Profile Picture Section */}
                    {isInline && (
                        <div className="form-section form-section-picture">
                            <div className="picture-upload-wrapper">
                                <div className="picture-preview">
                                    {formData.profilePicture ? (
                                        <img src={formData.profilePicture} alt="Profile" />
                                    ) : (
                                        <div className="picture-placeholder">
                                            {profileData?.profileImage}
                                        </div>
                                    )}
                                </div>
                                <div className="picture-info">
                                    <label htmlFor="profilePicture" className="form-label">
                                        Profile Picture
                                    </label>
                                    <input
                                        id="profilePicture"
                                        type="text"
                                        value={formData.profilePicture}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            profilePicture: e.target.value
                                        }))}
                                        placeholder="Paste image URL here"
                                        className="form-input"
                                    />
                                    <p className="form-hint">Upload or paste an image URL</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Name Section */}
                    <div className="form-section">
                        <label htmlFor="name" className="form-label">
                            Display Name
                        </label>
                        <div className="form-input-wrapper">
                            <FiUser size={16} className="input-icon" />
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your display name"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="form-section">
                        <label htmlFor="bio" className="form-label">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            className="form-textarea"
                            rows="4"
                        />
                        <p className="form-hint">{formData.bio.length}/500 characters</p>
                    </div>

                    {/* City Section */}
                    <div className="form-section">
                        <label htmlFor="city" className="form-label">
                            City
                        </label>
                        <div className="form-input-wrapper">
                            <FiMapPin size={16} className="input-icon" />
                            <input
                                id="city"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={(e) => handleCityChange(e.target.value)}
                                placeholder="Enter your city"
                                className="form-input"
                                autoComplete="off"
                            />
                        </div>

                        {/* City Suggestions Dropdown */}
                        {showCitySuggestions && citySuggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {citySuggestions.map((city, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="suggestion-item"
                                        onClick={() => selectCity(city)}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Country Section */}
                    <div className="form-section">
                        <label htmlFor="country" className="form-label">
                            Country
                        </label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">Select a country</option>
                            {COUNTRIES.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Education Section */}
                    <div className="form-section">
                        <label className="form-label">
                            Education
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                type="text"
                                value={educationInput}
                                onChange={(e) => setEducationInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddEducation();
                                    }
                                }}
                                placeholder="e.g., B.Sc Computer Science from MIT"
                                className="form-input"
                            />
                            <button
                                type="button"
                                onClick={handleAddEducation}
                                className="btn-add"
                            >
                                Add
                            </button>
                        </div>

                        {/* Education Tags */}
                        {formData.educations.length > 0 && (
                            <div className="tags-container">
                                {formData.educations.map((edu, index) => (
                                    <div key={index} className="tag">
                                        <span>{edu}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEducation(index)}
                                            className="btn-remove-tag"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Domains Section */}
                    <div className="form-section">
                        <label className="form-label">
                            Domains / Expertise
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                type="text"
                                value={domainInput}
                                onChange={(e) => setDomainInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddDomain();
                                    }
                                }}
                                placeholder="e.g., React, Node.js, Machine Learning"
                                className="form-input"
                            />
                            <button
                                type="button"
                                onClick={handleAddDomain}
                                className="btn-add"
                            >
                                Add
                            </button>
                        </div>

                        {/* Domains Tags */}
                        {formData.domains.length > 0 && (
                            <div className="tags-container">
                                {formData.domains.map((domain, index) => (
                                    <div key={index} className="tag tag-domain">
                                        <span>{domain}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDomain(index)}
                                            className="btn-remove-tag"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Social Links Section */}
                    <div className="form-section">
                        <label className="form-label">
                            Connect With Me (Public Profiles)
                        </label>
                        <p className="form-hint">Add your social media and website links</p>
                        <div className="social-links-form">
                            {SOCIAL_PLATFORMS.map(platform => (
                                <div key={platform.id} className="social-link-input">
                                    <label htmlFor={`social-${platform.id}`} className="social-platform-label">
                                        {platform.icon && <platform.icon size={16} />}
                                        {platform.label}
                                    </label>
                                    <input
                                        id={`social-${platform.id}`}
                                        type="url"
                                        name={`social-${platform.id}`}
                                        value={formData.socialLinks[platform.id] || ""}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            socialLinks: {
                                                ...prev.socialLinks,
                                                [platform.id]: e.target.value
                                            }
                                        }))}
                                        placeholder={platform.placeholder}
                                        className="form-input"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => onClose(null)}
                            disabled={isLoading}
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-submit"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
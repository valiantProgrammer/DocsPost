// components/Profile/ProfileEdit.jsx
"use client";
import { useState } from "react";

export default function ProfileEdit({ userData, onCancel, onSave }) {

    const [form, setForm] = useState({
        city: userData.city || "",
        country: userData.country || "",
        bio: userData.bio || "",
        profileLink: userData.profileLink || "",
        education: userData.education || "",
        domains: userData.domains || "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const res = await fetch("/api/profile/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (res.ok) {
            onSave(data.user);
        } else {
            alert("Update failed");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">

            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

            <div className="grid gap-4">

                <input name="city" placeholder="City" value={form.city} onChange={handleChange} />

                <select name="country" value={form.country} onChange={handleChange}>
                    <option value="">Select Country</option>
                    <option>India</option>
                    <option>USA</option>
                    <option>UK</option>
                </select>

                <textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} />

                <input name="profileLink" placeholder="Public Profile Link" value={form.profileLink} onChange={handleChange} />

                <input name="education" placeholder="Education (School/College)" value={form.education} onChange={handleChange} />

                <input name="domains" placeholder="Domains (AI, Web, etc)" value={form.domains} onChange={handleChange} />

            </div>

            <div className="flex gap-4 mt-4">
                <button onClick={handleSubmit} className="btn btn-primary">Save</button>
                <button onClick={onCancel} className="btn">Cancel</button>
            </div>

        </div>
    );
}
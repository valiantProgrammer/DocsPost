"use client";

import { useEffect, useState } from "react";
import "./Notification.css";

export default function Notification({ message, type = "success", duration = 2200 }) {
    const [isVisible, setIsVisible] = useState(!!message);

    useEffect(() => {
        if (!message) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration]);

    if (!isVisible || !message) return null;

    return (
        <div className={`notification notification-${type}`} role="alert" aria-live="polite">
            <div className="notification-content">
                {type === "success" && <span className="notification-icon">✓</span>}
                {type === "error" && <span className="notification-icon">✕</span>}
                {type === "info" && <span className="notification-icon">ℹ</span>}
                <p>{message}</p>
            </div>
        </div>
    );
}

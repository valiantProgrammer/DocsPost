"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function toKebabCase(str) {
    return (str || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function useSlug(title, initialSlug = "", documentId = "") {
    const [slug, setSlug] = useState(initialSlug || toKebabCase(title));
    const [isManual, setIsManual] = useState(Boolean(initialSlug));
    const [status, setStatus] = useState({ state: "idle", message: "" });
    const checkTimerRef = useRef(null);
    const initialSlugRef = useRef(initialSlug);

    // If initialSlug changes after loading an existing document
    useEffect(() => {
        if (initialSlug) {
            initialSlugRef.current = initialSlug;
            setSlug(initialSlug);
            setIsManual(true);
        }
    }, [initialSlug]);

    // Auto-update slug if user hasn't edited it manually
    useEffect(() => {
        if (!isManual && title) {
            const autoSlug = toKebabCase(title);
            setSlug(autoSlug);
        }
    }, [title, isManual]);

    // Debounced uniqueness check against GET /api/documents/check-slug
    useEffect(() => {
        if (!slug || slug.trim().length === 0) {
            setStatus({ state: "idle", message: "" });
            return;
        }

        // If slug is unchanged from document's existing slug, it is "Current"
        if (initialSlugRef.current && slug === initialSlugRef.current) {
            setStatus({ state: "current", message: "Current" });
            return;
        }

        if (checkTimerRef.current) {
            clearTimeout(checkTimerRef.current);
        }

        setStatus({ state: "checking", message: "Checking availability..." });

        checkTimerRef.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ slug });
                if (documentId) params.append("documentId", documentId);

                const res = await fetch(`/api/documents/check-slug?${params.toString()}`);
                const data = await res.json();

                if (data.isCurrent) {
                    setStatus({ state: "current", message: "Current" });
                } else if (data.available) {
                    setStatus({ state: "available", message: "Available" });
                } else {
                    setStatus({ state: "taken", message: data.message || "Already taken" });
                }
            } catch {
                setStatus({ state: "idle", message: "" });
            }
        }, 350);

        return () => {
            if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        };
    }, [slug, documentId]);

    const handleSlugChange = useCallback((newVal) => {
        setIsManual(true);
        setSlug(toKebabCase(newVal));
    }, []);

    const setInitialSlug = useCallback((val) => {
        initialSlugRef.current = val;
        setSlug(val);
        setIsManual(true);
    }, []);

    return {
        slug,
        setSlug: handleSlugChange,
        setInitialSlug,
        isManual,
        status,
    };
}

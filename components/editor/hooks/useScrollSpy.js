"use client";

import { useState, useEffect } from "react";

export function useScrollSpy(headings) {
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        if (!headings || headings.length === 0) return;

        // Default to first heading
        if (!activeId && headings[0]) {
            setActiveId(headings[0].id);
        }

        const handleScroll = () => {
            const headingElements = headings.map((h) => ({
                id: h.id,
                el: document.getElementById(h.id),
            })).filter((item) => item.el !== null);

            if (headingElements.length === 0) return;

            const scrollPos = window.scrollY + 160;

            for (let i = headingElements.length - 1; i >= 0; i--) {
                const item = headingElements[i];
                if (item.el.offsetTop <= scrollPos) {
                    setActiveId(item.id);
                    return;
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [headings, activeId]);

    return [activeId, setActiveId];
}

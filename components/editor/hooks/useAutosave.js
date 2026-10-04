"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useAutosave({ isDirty, onSave, delay = 2000 }) {
    // states: "saved", "saving", "unsaved", "error"
    const [saveState, setSaveState] = useState("saved");
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const timerRef = useRef(null);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    const triggerSave = useCallback(async () => {
        if (!isDirty) return;

        setSaveState("saving");
        try {
            const result = await onSaveRef.current();
            if (result && result.error) {
                setSaveState("error");
                setErrorMessage(result.error);
            } else {
                setSaveState("saved");
                setLastSavedAt(new Date());
                setErrorMessage("");
            }
        } catch (err) {
            console.error("Autosave error:", err);
            setSaveState("error");
            setErrorMessage(err.message || "Failed to save");
        }
    }, [isDirty]);

    // Schedule debounced save when dirty
    useEffect(() => {
        if (isDirty) {
            setSaveState("unsaved");

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                triggerSave();
            }, delay);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isDirty, delay, triggerSave]);

    // Handle Ctrl/Cmd+S
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                triggerSave();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [triggerSave]);

    // Handle beforeunload when dirty
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty || saveState === "unsaved") {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty, saveState]);

    return {
        saveState,
        lastSavedAt,
        errorMessage,
        triggerSave,
    };
}

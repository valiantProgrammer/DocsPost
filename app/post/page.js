"use client";

import { useState } from "react";
import WorkspaceEditor from "@/app/components/WorkspaceEditor";

export default function PostEditorPage() {
    const [userEmail] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || ""));

    return <WorkspaceEditor userEmail={userEmail} />;
}

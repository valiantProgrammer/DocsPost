"use client";

import WorkspaceEditor from "@/app/components/WorkspaceEditor";

export default function NewWorkspaceDocumentPage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return <WorkspaceEditor userEmail={userEmail} />;
}

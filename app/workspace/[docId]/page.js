"use client";

import { useParams } from "next/navigation";
import WorkspaceEditor from "@/app/components/WorkspaceEditor";

export default function EditWorkspaceDocumentPage() {
    const params = useParams();
    const docId = typeof params?.docId === "string" ? params.docId : "";
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return <WorkspaceEditor userEmail={userEmail} documentId={docId} />;
}

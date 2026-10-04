"use client";

import dynamic from "next/dynamic";

const WorkspaceEditorInner = dynamic(
    () => import("@/components/editor/WorkspaceEditor"),
    {
        ssr: false,
        loading: () => (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#F4F7FB",
                }}
            >
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "3px solid #E5EAF2",
                        borderTopColor: "#2563EB",
                        animation: "spin 1s linear infinite",
                    }}
                />
            </div>
        ),
    }
);

export default function WorkspaceEditor(props) {
    return <WorkspaceEditorInner {...props} />;
}

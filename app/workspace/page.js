"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkspaceRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard#workspace");
    }, [router]);

    return null;
}

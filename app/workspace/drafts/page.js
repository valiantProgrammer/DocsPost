"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DraftsRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard#drafts");
    }, [router]);

    return null;
}

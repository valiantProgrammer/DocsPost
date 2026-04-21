"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyCreatePageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/workspace/new");
    }, [router]);

    return null;
}

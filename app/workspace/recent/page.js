"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecentRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard#recent");
    }, [router]);

    return null;
}

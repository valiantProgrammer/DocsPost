"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublishedRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard#published");
    }, [router]);

    return null;
}

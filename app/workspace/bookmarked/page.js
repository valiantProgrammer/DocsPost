"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookmarkedRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard#bookmark");
    }, [router]);

    return null;
}

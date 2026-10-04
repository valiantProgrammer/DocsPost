"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SharedRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard#shared");
    }, [router]);

    return null;
}

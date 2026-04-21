import { NextResponse } from "next/server";

export function middleware(request) {
    const url = request.nextUrl;

    if (url.pathname === "/profile") {
        const username = request.cookies.get("docspost-username")?.value;

        if (!username) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.redirect(
            new URL(`/${username}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile"],
};
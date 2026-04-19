import { NextResponse } from "next/server";


export async function POST() {
    try {

        const response = NextResponse.json({
            success: true,
            message: "Logout successful.",
        }, { status: 200 });


        const cookieOptions = {
            path: "/",
            maxAge: 0,
            sameSite: "strict",
        };

        response.cookies.set("accessToken", "", cookieOptions);
        response.cookies.set("refreshToken", "", cookieOptions);
        response.cookies.set("docspost-auth", "", cookieOptions);
        response.cookies.set("docspost-username", "", cookieOptions);
        response.cookies.set("docspost-email", "", cookieOptions);

        return response;

    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json(
            { success: false, message: "An internal server error occurred during logout." },
            { status: 500 }
        );
    }
}


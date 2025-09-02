import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email_or_username } = body;

        if (!email_or_username) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: "Missing email or username",
            }, { status: 400 });
        }

        const requestBody = {
            email_or_username,
        };

        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/info/exist-by-email-or-username`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!backendRes.ok) {
            const err = await backendRes.json().catch(() => null);
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status || 401,
                message: err?.message || "Login failed"
            }, { status: backendRes.status || 401 });
        }

        const response = await backendRes.json();
        let payload: { success: boolean; message: string; statusCode?: number } = {
            success: false,
            statusCode: response.statusCode || 400,
            message: response.message || "Login or register failed",
        };

        if (response.success && response.message === "User found" && response.statusCode === 200) {
            payload = {
                success: true,
                statusCode: response.statusCode || 200,
                message: response.message || "User found",
            };
        } else if (response.success && response.message === "User not found" && response.statusCode === 400) {
            payload = {
                success: false,
                statusCode: response.statusCode || 400,
                message: response.message || "User not found",
            };
        } else {
            payload = {
                success: false,
                statusCode: response.statusCode || 400,
                message: response.message || "Login or register failed",
            };
        }

        const res = NextResponse.json(payload);
        res.cookies.set('email_or_username', email_or_username, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 3,
        });
        return res;

    } catch (error) {
        return NextResponse.json({
            success: false,
            statusCode: 400,
            message: error instanceof Error ? error.message : "Server error from login or register",
        }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        statusCode: 405,
        message: "Method Not Allowed",
    }, { status: 405 });
}
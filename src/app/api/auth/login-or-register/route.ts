import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const internalRequest = req.headers.get('frontend-internal-request');
        if (internalRequest !== 'true') {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing Frontend-Internal-Request header'
            }, { status: 400 });
        }

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

        const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/info/exist-by-email-or-username`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        if (!backendResponse.ok && backendResponse.status !== 400) {
            throw Object.assign(new Error(`HTTP ${backendResponse.status}`), { status: backendResponse.status });
        }

        const response = await backendResponse.json();

        if (response.success && response.message === "User found" && response.statusCode === 200) {
            const res = NextResponse.json({
                success: true,
                statusCode: response.statusCode || 200,
                message: response.message || "User found",
            })
            res.cookies.set('email_or_username', email_or_username, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 120,
            });

            res.cookies.set('gate-key-for-login', 'true', {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/login",
                maxAge: 120,
            });
            return res;
        }

        if (!response.success && response.message === "User not found" && response.statusCode === 400) {
            const res = NextResponse.json({
                success: false,
                statusCode: response.statusCode || 400,
                message: response.message || "User not found",
            })

            res.cookies.set('email_or_username', email_or_username, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 120,
            });

            res.cookies.set('gate-key-for-register', 'true', {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/register",
                maxAge: 120,
            });
            return res;
        }

        return NextResponse.json({
            success: false,
            statusCode: response.statusCode || 400,
            message: response.message || "Login or register failed",
        })


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
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Request from frontend:', body);

        const { email_or_username } = body;

        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/info/exist-by-email-or-username`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_or_username }),
        });

        if (!backendRes.ok) {
            const err = await backendRes.json().catch(() => null);
            console.log('Backend login failed:', { status: backendRes.status, error: err });
            return NextResponse.json(
                { message: err?.message || "Login failed" },
                { status: backendRes.status || 401 }
            );
        }
        
        const response = await backendRes.json();
        console.log('Backend response:', response);

        let payload: { success: boolean; message: string; statusCode?: number } = {
            success: false,
            message: response.message,
            statusCode: response.statusCode,
        };

        if (response.success && response.message === "User found" && response.statusCode === 200) {
            payload = { success: true, message: response.message, statusCode: response.statusCode };
        } else if (response.success && response.message === "User not found" && response.statusCode === 400) {
            payload = { success: false, message: response.message, statusCode: response.statusCode };
        } else {
            payload = { success: false, message: response.message, statusCode: response.statusCode };
        }

        const res = NextResponse.json(payload);
        res.cookies.set('email_or_username', email_or_username, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1,
        });
        return res;

    } catch (error) {
        console.error('Login or register error:', error);
        return NextResponse.json({
            message: "Login or register error"
        }, { status: 400 });
    }
}
import { cookies } from "next/headers";
import { NextResponse, userAgent } from "next/server";
import { fingerprintService } from "@/app/services/fingerprint.service";

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
        const { sessionId } = body;
        console.log('Request body Revoke API:', body);
        
        const cookieStore = await cookies();
        const deviceId = cookieStore.get("sessionId")?.value;
        const accessToken = cookieStore.get("accessToken")?.value;
        
        if (!sessionId || !deviceId) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing session ID or device ID'
            }, { status: 400 });
        }
        

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                statusCode: 401,
                message: 'No access token found'
            }, { status: 401 });
        }

        const requestBody = {
            session_id: sessionId
        };

        const userAgent = req.headers.get('user-agent') || '';
        const fingerprintResult = await fingerprintService(userAgent);
        const { fingerprint_hashed } = fingerprintResult;


        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/session/revoke`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'fingerprint': fingerprint_hashed,
            },
            body: JSON.stringify( requestBody ),
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });

        if (!backendRes.ok) {
            const error = await backendRes.json().catch(() => null);
            console.log('Backend response Revoke API:', error);
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status || 400,
                message: error?.message || 'Failed to revoke all device fingerprints'
            }, { status: backendRes.status || 400 });
        }

        const response = await backendRes.json();
        console.log('Backend response Revoke API:', response);

        if (sessionId === deviceId) {
            const res = NextResponse.json({
                success: true,
                statusCode: response.statusCode || 200,
                message: response.message || 'Device fingerprint revoked'
            }, { status: 200 });

            cookieStore.set("sessionId", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });
            cookieStore.set("accessToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });
            cookieStore.set("refreshToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });
            return res;
        }

        return NextResponse.json({
            success: response.success || true,
            statusCode: response.statusCode || 200,
            message: response.message || 'Device fingerprint revoked'
        }, { status: response.statusCode || 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to revoke all device fingerprints'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        statusCode: 405,
        message: "Method Not Allowed"
    }, { status: 405 });
}
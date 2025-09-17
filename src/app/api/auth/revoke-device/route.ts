import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/fingerprint.service";

interface Session {
    "_id": string;
    "user_id": string;
    "device_fingerprint_id": string;
    "session_token": string;
    "app": string;
    "expires_at": string;
    "is_active": boolean;
    "last_used_at": string;
    "createdAt": string;
    "updatedAt": string;
    "__v": number;
}

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
        const { deviceFingerprintId, sessions, currentSessionId } = body;

        if (!deviceFingerprintId) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing device fingerprint ID'
            }, { status: 400 });
        }

        const cookieStore = await cookies();
        const sessionId = cookieStore.get("sessionId")?.value;
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing session ID'
            }, { status: 400 });
        }

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                statusCode: 401,
                message: 'No access token found'
            }, { status: 401 });
        }

        // Check if any of the sessions being revoked is the current session
        // Use currentSessionId from localStorage (sent from frontend) for comparison
        const reload = sessions.some((session: Session) => session._id === sessionId) || 
                      (currentSessionId && sessions.some((session: Session) => session._id === currentSessionId));

        const requestBody = {
            device_fingerprint_id: deviceFingerprintId,
        };

        const userAgent = req.headers.get('user-agent') || '';
        const fingerprintResult = await fingerprintService(userAgent);
        const { fingerprint_hashed } = fingerprintResult;

        const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/fingerprints/revoke`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'fingerprint': fingerprint_hashed,
            },
            body: JSON.stringify(requestBody),
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });

        if (!backendResponse.ok) {
            return NextResponse.json({
                success: false,
                statusCode: backendResponse.status || 400,
                message: 'Failed to revoke device fingerprint'
            }, { status: backendResponse.status || 400 });
        }

        const response = await backendResponse.json();
        console.log('Backend response Revoke All API:', response);
        
        const res = NextResponse.json({
            success: response.success || true,
            statusCode: response.statusCode || 200,
            message: response.message || 'Device fingerprint revoked',
            reload: reload
        }, { status: response.statusCode || 200 });
        
        // Only clear cookies if the current device is being revoked
        if (reload) {
            res.cookies.set('accessToken', '', {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: '/',
                maxAge: 0,
            });
            res.cookies.set('refreshToken', '', {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: '/',
                maxAge: 0
            });
        }
        
        return res;

    } catch (error) {
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to revoke device fingerprint'
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
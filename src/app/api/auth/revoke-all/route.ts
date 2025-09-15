import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
        const { deviceFingerprintId } = body;

        if (!deviceFingerprintId) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing device fingerprint ID'
            }, { status: 400 });
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                statusCode: 401,
                message: 'No access token found'
            }, { status: 401 });
        }

        const requestBody = {
            device_fingerprint_id: deviceFingerprintId
        };

        const userAgent = req.headers.get('user-agent') || '';
        const fingerprintResult = await fingerprintService(userAgent);
        const { fingerprint_hashed } = fingerprintResult;

        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/fingerprints/revoke`, {
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

        if (!backendRes.ok) {
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status || 400,
                message: 'Failed to revoke all device fingerprints'
            }, { status: backendRes.status || 400 });
        }

        const response = await backendRes.json();
        console.log('Backend response:', response);

        const res = NextResponse.json({
            success: response.success || true,
            statusCode: response.statusCode || 200,
            message: response.message || 'Device fingerprint revoked'
        }, { status: response.statusCode || 200 });
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
        return res;

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
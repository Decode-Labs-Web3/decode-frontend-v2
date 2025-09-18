import { NextRequest, NextResponse } from 'next/server';
import { fingerprintService } from '@/services/fingerprint.service';

export async function POST(request: NextRequest) {
    try {
        const internalRequest = request.headers.get('frontend-internal-request');
        if (internalRequest !== 'true') {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing Frontend-Internal-Request header'
            }, { status: 400 });
        }

        const body = await request.json();
        const { address, signature } = body;

        if (!address || !signature) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: 'Missing address or signature'
            }, { status: 400 });
        }

        const userAgent = request.headers.get("user-agent") || "";
        const fingerprintResult = await fingerprintService(userAgent);
        const { fingerprint_hashed, device, browser } = fingerprintResult;

        const requestBody = {
            address,
            signature,
            fingerprint_hashed,
            device,
            browser
        };

        console.log("Request body from auth validation:", requestBody);



        const backendRes = await fetch(`http://localhost:4005/wallets/auth/validation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        if (!backendRes.ok) {
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status || 401,
                message: 'Invalid address or signature'
            }, { status: backendRes.status || 401 });
        }

        const response = await backendRes.json();
        console.log("Auth challenge response:", response);

        return NextResponse.json({
            success: true,
            statusCode: response.statusCode || 200,
            message: response.message || 'Auth challenge generated',
            data: response.data,
        }, { status: response.statusCode || 200 });
    } catch (error) {
        console.error('Auth challenge error:', error);
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Invalid address'
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

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/app/services/fingerprint.service";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                statusCode: 400,
                message: "Missing fingerprint"
            }, { status: 400 });
        }

        const userAgent = req.headers.get('user-agent') || '';
        const fingerprintResult = await fingerprintService(userAgent);
        const { fingerprint_hashed } = fingerprintResult;
        console.log('Fingerprint result from fingerprints api:', fingerprintResult);

        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/fingerprints`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'fingerprint': fingerprint_hashed,
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });

        if (!backendRes.ok) {
            const error = await backendRes.json().catch(() => null);
            console.log('Backend response Fingerprints API:', error);
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status,
                message: error?.message || "Failed to fetch fingerprints"
            }, { status: backendRes.status });
        }

        const responseData = await backendRes.json();

        if (responseData.success && responseData.statusCode === 200 && responseData.message === "Device fingerprint fetched") {
            return NextResponse.json({
                success: true,
                statusCode: responseData.statusCode || 200,
                message: responseData.message || "Device fingerprint fetched",
                data: responseData.data
            }, { status: responseData.statusCode || 200 });
        }

        return NextResponse.json({
            success: false,
            statusCode: responseData.statusCode || 400,
            message: responseData.message || "Failed to fetch fingerprints"
        }, { status: responseData.statusCode || 400 });

    } catch (error) {
        console.error('Fingerprints API error:', error);
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to fetch fingerprints'
        }, { status: 500 });
    }
}
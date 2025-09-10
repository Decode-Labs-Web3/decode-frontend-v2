import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
        }
        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/session/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!backendRes.ok) {
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status || 401,
                message: 'Failed to refresh token'
            }, { status: backendRes.status || 401 });
        }

        const response = await backendRes.json();
        return NextResponse.json({
            success: true,
            statusCode: response.statusCode || 200,
            message: response.message || 'Token refreshed successfully',
            data: response.data,
        }, { status: response.statusCode || 200 });
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to refresh token'
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
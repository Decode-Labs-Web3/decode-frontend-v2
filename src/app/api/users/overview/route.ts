import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const backendRes = await fetch(`${process.env.BACKEND_URL}/users/profile/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!backendRes.ok) {
            const err = await backendRes.json().catch(() => null);
            return NextResponse.json({
                success: false,
                statusCode: backendRes.status || 401,
                message: err?.message || 'Failed to fetch overview'
            }, { status: backendRes.status || 401 });
        }

        const data = await backendRes.json();
        return NextResponse.json({
            success: true,
            statusCode: data.statusCode || 200,
            message: data.message || 'Overview fetched successfully',
            data: data.data
        }, { status: data.statusCode || 200 });

    } catch (error) {
        console.error('Overview error:', error);
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to fetch overview'
        }, { status: 500 });
    }
}
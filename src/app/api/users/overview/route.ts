import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    try{
        const response = await fetch(`${process.env.BACKEND_URL}/users/profile/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        console.log("data.data.display_name:", data.data.display_name);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ 
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : "Failed to fetch overview"
        }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const body = await req.json().catch(() => ({}));
    try{
        const response = await fetch(`${process.env.BACKEND_URL}/users/profile/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            return NextResponse.json({
                success: false,
                statusCode: response.status,
                message: data?.message || 'Failed to update profile'
            }, { status: response.status });
        }
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            success: false,
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to update profile'
        }, { status: 500 });
    }
}
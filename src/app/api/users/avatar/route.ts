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

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

        const body = new FormData();
        body.append("file", file);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
            body,
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        const data = await res.json();
        console.log('Avatar data:', data);

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.error || "Upload failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            ipfsHash: data.IpfsHash,
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        statusCode: 405,
        message: "Method Not Allowed"
    }, { status: 405 });
}

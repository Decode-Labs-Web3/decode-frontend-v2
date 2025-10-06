import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRequestId, apiPathName, guardInternal} from "@/utils/index.utils"

// Allowed file types and configurations
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE_MB = 5;

/**
 * Basic file validation
 */
const validateFile = (file: File): boolean => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return false;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return false;
  }

  // Check file extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return false;
  }

  return true;
};

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req)
  const denied = guardInternal(req)
  if (denied) return denied
  try {
    // const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;
    const accessToken = (await cookies()).get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // File validation
    if (!validateFile(file)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type or size" },
        { status: 400 }
      );
    }

    // Upload to Pinata
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
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      console.error("Pinata upload failed:", res.status);
      return NextResponse.json(
        { success: false, message: "File upload failed" },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      ipfsHash: data.IpfsHash,
    });
  } catch (err: unknown) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
  finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  validateFileType,
  validateFileSize,
  isAllowedFileExtension,
  sanitizeFileName,
} from "@/utils/sanitization.utils";
import {
  createSecurityErrorResponse,
  SecurityErrorMessages,
  logSecurityEvent,
  generateRequestId,
} from "@/utils/security-error-handling.utils";

// Allowed file types and configurations
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validate image file by checking magic numbers
 */
const validateImageFile = async (file: File): Promise<boolean> => {
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Check for JPEG magic number: FF D8 FF
    if (
      uint8Array[0] === 0xff &&
      uint8Array[1] === 0xd8 &&
      uint8Array[2] === 0xff
    ) {
      return true;
    }

    // Check for PNG magic number: 89 50 4E 47
    if (
      uint8Array[0] === 0x89 &&
      uint8Array[1] === 0x50 &&
      uint8Array[2] === 0x4e &&
      uint8Array[3] === 0x47
    ) {
      return true;
    }

    // Check for WebP magic number: 52 49 46 46 ... 57 45 42 50
    if (
      uint8Array[0] === 0x52 &&
      uint8Array[1] === 0x49 &&
      uint8Array[2] === 0x46 &&
      uint8Array[3] === 0x46 &&
      uint8Array[8] === 0x57 &&
      uint8Array[9] === 0x45 &&
      uint8Array[10] === 0x42 &&
      uint8Array[11] === 0x50
    ) {
      return true;
    }

    return false;
  } catch (error) {
    logSecurityEvent(
      "FILE_VALIDATION_ERROR",
      { error: error instanceof Error ? error.message : "Unknown error" },
      "medium"
    );
    return false;
  }
};

export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Security header validation
    const internalRequest = req.headers.get("frontend-internal-request");
    if (internalRequest !== "true") {
      logSecurityEvent("MISSING_INTERNAL_HEADER", { requestId }, "high");
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          SecurityErrorMessages.MISSING_HEADER,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    // Authentication check
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      logSecurityEvent("UNAUTHORIZED_AVATAR_UPLOAD", { requestId }, "high");
      return NextResponse.json(
        createSecurityErrorResponse(
          401,
          SecurityErrorMessages.UNAUTHORIZED,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          "No file provided",
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    // File validation
    if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
      logSecurityEvent(
        "INVALID_FILE_TYPE",
        {
          requestId,
          fileType: file.type,
          fileName: file.name,
        },
        "medium"
      );
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          SecurityErrorMessages.INVALID_FILE,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      logSecurityEvent(
        "FILE_TOO_LARGE",
        {
          requestId,
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE_BYTES,
          fileName: file.name,
        },
        "medium"
      );
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    if (!isAllowedFileExtension(file.name, ALLOWED_EXTENSIONS)) {
      logSecurityEvent(
        "INVALID_FILE_EXTENSION",
        {
          requestId,
          fileName: file.name,
        },
        "medium"
      );
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          SecurityErrorMessages.INVALID_FILE,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    // Validate file content (magic number check)
    const isValidImage = await validateImageFile(file);
    if (!isValidImage) {
      logSecurityEvent(
        "INVALID_FILE_CONTENT",
        {
          requestId,
          fileName: file.name,
          fileType: file.type,
        },
        "high"
      );
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          SecurityErrorMessages.INVALID_FILE,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(file.name);

    // Create new file with sanitized name
    const sanitizedFile = new File([file], sanitizedFileName, {
      type: file.type,
    });

    // Upload to Pinata
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const body = new FormData();
    body.append("file", sanitizedFile);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000), // Increased timeout for file upload
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      logSecurityEvent(
        "PINATA_UPLOAD_ERROR",
        {
          requestId,
          status: res.status,
          error: errorData,
        },
        "medium"
      );

      return NextResponse.json(
        createSecurityErrorResponse(
          500,
          "File upload failed",
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 500 }
      );
    }

    const data = await res.json();

    // Log successful upload
    logSecurityEvent(
      "AVATAR_UPLOAD_SUCCESS",
      {
        requestId,
        ipfsHash: data.IpfsHash,
        fileSize: file.size,
        fileType: file.type,
      },
      "low"
    );

    return NextResponse.json({
      success: true,
      ipfsHash: data.IpfsHash,
      requestId,
    });
  } catch (err: unknown) {
    logSecurityEvent(
      "AVATAR_UPLOAD_ERROR",
      {
        requestId,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      "high"
    );

    return NextResponse.json(
      createSecurityErrorResponse(
        500,
        SecurityErrorMessages.SERVER_ERROR,
        process.env.NODE_ENV === "production",
        requestId
      ),
      { status: 500 }
    );
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

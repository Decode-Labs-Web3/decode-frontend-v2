import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ProfileData, RequestBody } from "@/interfaces/index.interfaces";
import { fingerprintService } from "@/services/index.services";
import { generateRequestId } from "@/utils/index.utils";

// Helper function to detect changed fields
function getChangedFields(current: ProfileData, original: ProfileData) {
  const changes: { [key: string]: { data: ProfileData; endpoint: string } } =
    {};

  if (current.avatar_ipfs_hash !== original.avatar_ipfs_hash) {
    changes.avatar_ipfs_hash = {
      data: { avatar_ipfs_hash: current.avatar_ipfs_hash },
      endpoint: "/users/profile/avatar",
    };
  }

  if (current.display_name !== original.display_name) {
    changes.display_name = {
      data: { display_name: current.display_name },
      endpoint: "/users/profile/display-name",
    };
  }

  if (current.bio !== original.bio) {
    changes.bio = {
      data: { bio: current.bio },
      endpoint: "/users/profile/bio",
    };
  }

  return changes;
}

// Helper function to make individual backend requests
async function makeBackendRequest(
  endpoint: string,
  data: ProfileData,
  req: Request,
  requestId: string
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return {
        success: false,
        message: "No access token found",
      };
    }

    const userAgent = req.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed } = fingerprintResult;

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}${endpoint}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          fingerprint: fingerprint_hashed,
          "X-Request-ID": requestId,
        },
        body: JSON.stringify(data),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return {
        success: false,
        message: error?.message || "Update failed",
      };
    }

    const response = await backendRes.json().catch(() => ({}));
    return {
      success: true,
      message: response.message || "Updated successfully",
    };
  } catch (error) {
    console.error("makeBackendRequest error:", error);
    return {
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function PUT(req: Request) {
  const requestId = generateRequestId();

  try {
    const internalRequest = req.headers.get("X-Frontend-Internal-Request");
    if (internalRequest !== "true") {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing X-Frontend-Internal-Request header",
        },
        { status: 400 }
      );
    }

    const body: RequestBody = await req.json();
    const { current, original } = body;

    if (!current || !original) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message:
            "Invalid request body. Must include current and original data",
        },
        { status: 400 }
      );
    }

    const changedFields = getChangedFields(current, original);

    if (Object.keys(changedFields).length === 0) {
      return NextResponse.json(
        {
          success: true,
          statusCode: 200,
          message: "No changes detected",
          results: {},
        },
        { status: 200 }
      );
    }

    // Process each changed field
    const results: { [key: string]: { success: boolean; message: string } } =
      {};
    const promises = Object.entries(changedFields).map(
      async ([field, config]) => {
        const result = await makeBackendRequest(
          config.endpoint,
          config.data,
          req,
          requestId
        );
        results[field] = result;
      }
    );

    await Promise.all(promises);

    // Check if all updates were successful
    const allSuccessful = Object.values(results).every(
      (result) => result.success
    );

    return NextResponse.json(
      {
        success: allSuccessful,
        statusCode: allSuccessful ? 200 : 207,
        message: allSuccessful
          ? "All updates successful"
          : "Some updates failed",
        results,
      },
      { status: allSuccessful ? 200 : 207 }
    );
  } catch (error) {
    console.error("/api/users/profile-change handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Failed to change profile",
      },
      { status: 500 }
    );
  } finally {
    console.info("/api/users/profile-change", requestId);
  }
}

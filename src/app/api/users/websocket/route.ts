import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { io as createClient, Socket } from "socket.io-client";

export const runtime = "nodejs";

type OutEvent =
  | { type: "disconnect"; data: string }
  | { type: "connect_error"; data: string }
  | { type: "connected"; data: { sid: string } }
  | { type: "user_connected"; data: Record<string, unknown> }
  | { type: "notification_received"; data: Record<string, unknown> };

function sse(controller: ReadableStreamDefaultController, evt: OutEvent) {
  try {
    const line = `data: ${JSON.stringify(evt)}\n\n`;
    controller.enqueue(new TextEncoder().encode(line));
  } catch (error) {
    console.error("Error writing SSE data:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    // const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;
    const accessToken = (await cookies()).get("accessToken")?.value;

    // console.log("this is access token from notification route ", accessToken);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const token = accessToken;

    let socket: Socket | null = null;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("retry: 3000\n\n"));

        try {
          console.log(
            `Connecting to: ${process.env.NOTIFICATIONS_SIO_URL}/notifications`
          );
          socket = createClient(
            `${process.env.NOTIFICATIONS_SIO_URL}/notifications`,
            {
              auth: { token },
              path: "/socket.io",
              timeout: 20000,
            }
          );

          socket.on("connect", () => {
            sse(controller, {
              type: "connected",
              data: { sid: socket!.id || "unknown" },
            });
          });

          socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            sse(controller, { type: "connect_error", data: err.message });
          });

          socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            sse(controller, { type: "disconnect", data: reason });
          });

          socket.on("user_connected", (data: Record<string, unknown>) => {
            sse(controller, { type: "user_connected", data });
          });

          socket.on(
            "notification_received",
            (data: Record<string, unknown>) => {
              sse(controller, { type: "notification_received", data });
            }
          );

          const close = () => {
            try {
              socket?.close();
            } catch (error) {
              console.error("Error closing socket:", error);
            }
            try {
              controller.close();
            } catch (error) {
              console.log("Error closing controller:", error);
            }
          };

          req.signal?.addEventListener("abort", close);
        } catch (error) {
          console.error("Error creating socket connection:", error);
          sse(controller, {
            type: "connect_error",
            data: "Failed to create socket connection",
          });
        }
      },
      cancel() {
        try {
          socket?.close();
        } catch (error) {
          console.error("Error closing socket on cancel:", error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-cache, no-transform",
        "Access-Control-Allow-Headers": "Cache-Control",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in notification route:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

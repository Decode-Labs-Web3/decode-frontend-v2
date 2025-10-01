"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { toastSuccess, toastError } from "@/utils/index.utils";

type SnapshotData = {
  _id: string;
  user_id: string;
  followers_number: number;
  snapshot_at: string; // ISO
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data: SnapshotData[];
};

type ChartRow = {
  day: string;       // "YYYY-MM-DD"
  followers: number; // tổng followers tại snapshot
  dateISO: string;   // dùng cho tooltip
};

export default function Page() {
  const [rows, setRows] = useState<SnapshotData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSnapShot = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/snapshot", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout?.(10000),
      });

      const response: ApiResponse = await apiResponse.json();

      if (!apiResponse.ok || !response?.success) {
        toastError(response?.message || "API error");
        return;
      }

      setRows(response.data || []);
      toastSuccess(response?.message || "Followers snapshot data last month fetched successfully");
    } catch (e: any) {
      console.error(e);
      toastError(e?.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapShot();
  }, [fetchSnapShot]);

  // Chuẩn hoá: sort và lấy snapshot cuối của mỗi ngày
  const data: ChartRow[] = useMemo(() => {
    if (!rows.length) return [];
    const sorted = [...rows].sort(
      (a, b) => new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime()
    );
    const byDay = new Map<string, SnapshotData>();
    for (const s of sorted) {
      const key = s.snapshot_at.slice(0, 10); // "YYYY-MM-DD"
      byDay.set(key, s); // cuối cùng trong ngày
    }
    const out = Array.from(byDay.values()).map((s) => ({
      day: s.snapshot_at.slice(0, 10),
      followers: s.followers_number,
      dateISO: s.snapshot_at,
    }));
    out.sort((a, b) => a.day.localeCompare(b.day));
    return out;
  }, [rows]);


  return (
    <main className="p-6">
      <div className="rounded-2xl border border-[color:var(--border)] p-4">
        <h3 className="text-sm font-semibold mb-3">Trend followers (Line)</h3>

        {loading && (
          <div className="rounded-xl border border-[color:var(--border)] p-4 text-sm text-[color:var(--muted-foreground)]">
            Đang tải biểu đồ…
          </div>
        )}

        {!loading && !data.length && (
          <div className="rounded-xl border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
            Chưa có dữ liệu 30 ngày gần đây
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d: string) => {
                    const [y, m, dd] = d.split("-");
                    return `${dd}/${m}`;
                  }}
                  minTickGap={20}
                />
                <YAxis allowDecimals={false} domain={["dataMin-1", "dataMax+1"]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="followers"
                  name="Followers"
                  dot={{ r: 2 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}

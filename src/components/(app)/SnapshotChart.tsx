"use client";

import { format, parseISO } from "date-fns";
import { getApiHeaders } from "@/utils/api.utils";
import { useState, useEffect, useMemo } from "react";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastError } from "@/utils/index.utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SnapshotData {
  _id: string;
  user_id: string;
  followers_number: number;
  snapshot_at: string;
}

interface ChartRow {
  day: string;
  followers: number;
  dateISO: string;
}

type Props = { userId: string };

export default function SnapshotChart({ userId }: Props) {
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<SnapshotData[]>([]);

  const CHART_HEIGHT = 288;

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);
      try {
        const apiResponse = await fetch("/api/users/snapshot", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ id: userId }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        });

        const response = await apiResponse.json();

        if (!apiResponse.ok || !response?.success) {
          toastError(response?.message || "API error");
          return;
        }

        setRows(response.data || []);
        // toastSuccess(
        //   response?.message ||
        //     "Followers snapshot data last month fetched successfully"
        // );
      } catch (error) {
        console.error(error);
        toastError("Fetch error");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, fingerprintHash]);

  const data: ChartRow[] = useMemo(() => {
    if (!rows.length) return [];
    const sorted = [...rows].sort(
      (a, b) =>
        new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime()
    );

    const byDay = new Map<string, SnapshotData>();
    for (const s of sorted) {
      byDay.set(s.snapshot_at.slice(0, 10), s);
    }

    const out = Array.from(byDay.values()).map((s) => ({
      day: s.snapshot_at.slice(0, 10),
      followers: s.followers_number,
      dateISO: s.snapshot_at,
    }));
    out.sort((a, b) => a.day.localeCompare(b.day));
    return out;
  }, [rows]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload?: ChartRow }>;
  }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload as ChartRow | undefined;
    if (!p) return null;
    return (
      <div className="rounded-xl border border--border bg--surface px-3 py-2 shadow-xl">
        <div className="text-xs text--muted-foreground">
          {format(parseISO(p.dateISO), "dd/MM/yyyy HH:mm")}
        </div>
        <div className="text-sm font-medium text--foreground">
          Followers: {p.followers}
        </div>
      </div>
    );
  };

  return (
    <>
      {!loading && data.length === 0 && (
        <div className="rounded-xl border border-dashed border--border p-6 text-sm text--muted-foreground">
          No data found in last 30 days
        </div>
      )}

      {!loading && data.length > 0 && (
        <div style={{ height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickFormatter={(d: string) => {
                  const [m, dd] = d.split("-");
                  return `${dd}/${m}`;
                }}
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                domain={["dataMin-1", "dataMax+1"]}
              />
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

      {loading && (
        <div className="h-72 animate-pulse rounded-xl border border--border bg--surface" />
      )}
    </>
  );
}

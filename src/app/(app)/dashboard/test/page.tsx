"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/utils/index.utils";
import {
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserInfoContext } from "@/contexts/UserInfoContext.contexts";
import {
  faEnvelope,
  faCamera,
  faPen,
  faXmark,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
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
import { format, parseISO } from "date-fns";

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

export default function PersonalPage() {
  const router = useRouter();
  const userContext = useContext(UserInfoContext);
  const user = userContext?.user;
  const refetchUserData = userContext?.refetchUserData;
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<SnapshotData[]>([]);
  const [modal, setModal] = useState({
    delete: false,
    edit: false
  });

  const fetchSnapShot = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ id: user?.id }),
        cache: "no-cache",
        signal: AbortSignal.timeout?.(10000),
      });

      const response = await apiResponse.json();

      if (!apiResponse.ok || !response?.success) {
        toastError(response?.message || "API error");
        return;
      }

      setRows(response.data || []);
      toastSuccess(
        response?.message ||
          "Followers snapshot data last month fetched successfully"
      );
    } catch (error) {
      console.error(error);
      toastError("Fetch error");
    } finally {
      // setLoading(true);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSnapShot();
  }, [fetchSnapShot]);

  const data: ChartRow[] = useMemo(() => {
    if (!rows.length) return [];
    const sorted = [...rows].sort(
      (a, b) =>
        new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime()
    );
    const byDay = new Map<string, SnapshotData>();
    for (const s of sorted) {
      const key = s.snapshot_at.slice(0, 10);
      byDay.set(key, s);
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
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 shadow-xl">
        <div className="text-xs text-[color:var(--muted-foreground)]">
          {format(parseISO(p.dateISO), "dd/MM/yyyy HH:mm")}
        </div>
        <div className="text-sm font-medium text-[color:var(--foreground)]">
          Followers: {p.followers}
        </div>
      </div>
    );
  };

  return (
    <>
      {!loading && !data.length && (
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
          No data found in 30 days
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
                  const parts = d.split("-");
                  const dd = parts[2];
                  const m = parts[1];
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
    </>
  );
}

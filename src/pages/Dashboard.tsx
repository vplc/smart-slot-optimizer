import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreatePolicy } from "@/lib/policy";
import { optimizeSlotForUser, type OptimizeSummary } from "@/lib/optimizer";
import type { Policy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  Loader2,
  Link2,
  ClipboardCheck,
} from "lucide-react";

interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  noShowRate: number;
  revenueToday: number;
}

interface SlotEntry {
  start: Date;
  summary: OptimizeSummary | null;
  error?: string;
}

interface DaySlots {
  date: Date;
  slots: SlotEntry[];
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    noShowRate: 0,
    revenueToday: 0,
  });
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [slotGrid, setSlotGrid] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [computingSlots, setComputingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const load = async () => {
      setLoading(true);
      setSlotError(null);

      try {
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        if (appointments) {
          const today = new Date().toISOString().split("T")[0];
          const now = new Date();
          const upcoming = appointments.filter(
            (apt) => new Date(apt.starts_at) > now && apt.status === "booked"
          );
          const todayAppointments = appointments.filter((apt) =>
            apt.starts_at.startsWith(today)
          );
          const noShows = appointments.filter((apt) => apt.status === "no_show");

          setStats({
            totalAppointments: appointments.length,
            upcomingAppointments: upcoming.length,
            noShowRate:
              appointments.length > 0 ? (noShows.length / appointments.length) * 100 : 0,
            revenueToday: todayAppointments
              .filter((apt) => apt.status === "showed")
              .reduce((sum, apt) => sum + Number(apt.price ?? 0), 0),
          });
        } else {
          setStats({
            totalAppointments: 0,
            upcomingAppointments: 0,
            noShowRate: 0,
            revenueToday: 0,
          });
        }

        const policyData = await getOrCreatePolicy(user.id);
        setPolicy(policyData);
        await computeSlots(user.id, policyData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        const message =
          error instanceof Error ? error.message : "Unable to load dashboard data";
        setSlotError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, navigate]);

  const computeSlots = async (userId: string, activePolicy: Policy) => {
    if (!activePolicy.serviceMinutes || activePolicy.serviceMinutes <= 0) {
      setSlotGrid([]);
      return;
    }

    setComputingSlots(true);
    setSlotGrid([]);
    setSlotError(null);

    try {
      const now = new Date();
      const results: DaySlots[] = [];
      const incrementMs = activePolicy.serviceMinutes * 60 * 1000;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dayDate = new Date(now);
        dayDate.setHours(0, 0, 0, 0);
        dayDate.setDate(dayDate.getDate() + dayOffset);

        const slots: SlotEntry[] = [];
        const startOfDay = new Date(dayDate);
        startOfDay.setHours(9, 0, 0, 0);
        const endOfDay = new Date(dayDate);
        endOfDay.setHours(17, 0, 0, 0);

        for (let time = startOfDay.getTime(); time < endOfDay.getTime(); time += incrementMs) {
          const slotStart = new Date(time);
          if (dayOffset === 0 && slotStart <= now) {
            continue;
          }

          try {
            const summary = await optimizeSlotForUser(userId, {
              slotStart: slotStart.toISOString(),
            });
            slots.push({ start: slotStart, summary });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Optimization failed";
            slots.push({ start: slotStart, summary: null, error: message });
          }
        }

        results.push({ date: dayDate, slots });
      }

      setSlotGrid(results);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to compute optimization grid";
      setSlotError(message);
    } finally {
      setComputingSlots(false);
    }
  };

  const waitStyle = (summary: OptimizeSummary | null) => {
    if (!policy) return "border-border";
    if (!summary) return "border-destructive/50 bg-destructive/10";
    if (!Number.isFinite(summary.Wq) || summary.Wq > policy.slaWaitMin) {
      return "border-destructive/50 bg-destructive/10";
    }
    if (summary.Wq > policy.slaWaitMin * 0.75) {
      return "border-yellow-500/40 bg-yellow-500/10";
    }
    return "border-emerald-500/30 bg-emerald-500/10";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-foreground">OverbookIQ Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.noShowRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-revenue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-revenue">
                ${stats.revenueToday.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Optimization forecast</CardTitle>
            {policy ? (
              <CardDescription>
                Capacity {policy.capacityS} | Max overbook +{policy.maxOverbook} | SLA ≤ {" "}
                {policy.slaWaitMin} min
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {slotError ? (
              <p className="text-sm text-destructive">{slotError}</p>
            ) : null}

            {computingSlots ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Computing slot recommendations...
              </div>
            ) : null}

            {!computingSlots && slotGrid.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No future slots to evaluate. Update your policy or scheduling window to generate recommendations.
              </p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {slotGrid.map((day) => (
                <div key={day.date.toISOString()} className="rounded-lg border border-border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {dayFormatter.format(day.date)}
                    </span>
                    <Badge variant="secondary">{day.slots.length} slots</Badge>
                  </div>
                  <div className="space-y-2">
                    {day.slots.map((slot) => (
                      <div
                        key={slot.start.toISOString()}
                        className={cn(
                          "rounded-md border p-3 space-y-1 transition-colors",
                          waitStyle(slot.summary)
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{timeFormatter.format(slot.start)}</span>
                          {slot.summary ? (
                            <Badge variant="default">n* {slot.summary.nStar}</Badge>
                          ) : (
                            <Badge variant="destructive">error</Badge>
                          )}
                        </div>
                        {slot.summary ? (
                          <>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>p̄</span>
                              <span>{(slot.summary.pBar * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Wait</span>
                              <span>
                                {Number.isFinite(slot.summary.Wq)
                                  ? `${slot.summary.Wq.toFixed(1)} min`
                                  : `>${policy?.slaWaitMin ?? 0} min`}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-destructive">
                            {slot.error ?? "Optimization failed"}
                          </p>
                        )}
                      </div>
                    ))}
                    {day.slots.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No available slots in this window.</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/customers")}>
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/connect")}>
                <Link2 className="h-4 w-4 mr-2" />
                Connect Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/policy")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Edit Policy
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Business Settings
              </Button>
              <Button variant="hero" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity. Start by importing your calendar or adding appointments.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

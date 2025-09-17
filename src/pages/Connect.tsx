import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Link2, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { importCalendarFromIcs } from "@/lib/calendar";
import type { IcsImportResult } from "@/lib/calendar";

const Connect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [icsUrl, setIcsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IcsImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleImport = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const importResult = await importCalendarFromIcs(user.id, { url: icsUrl });
      setResult(importResult);
      toast({
        title: "Calendar imported",
        description: `Inserted ${importResult.inserted} and updated ${importResult.updated} appointments`,
      });
    } catch (error: unknown) {
      console.error("Failed to import ICS", error);
      const message = error instanceof Error ? error.message : "Unable to import calendar";
      setError(message);
      toast({
        title: "Import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStub = (feature: string) => {
    toast({
      title: `${feature} coming soon`,
      description: "We're working on this integration.",
    });
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Connect your calendar</h1>
        <p className="text-muted-foreground">
          Import existing bookings and keep OverbookIQ in sync with your scheduling tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Import via ICS Link
          </CardTitle>
          <CardDescription>
            Paste the public ICS feed from Google Calendar, Calendly, or another provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="ics-url">
              <Link2 className="h-4 w-4" /> ICS URL
            </label>
            <Input
              id="ics-url"
              placeholder="https://calendar.google.com/calendar/ical/..."
              value={icsUrl}
              onChange={(event) => setIcsUrl(event.target.value)}
            />
          </div>
          <Button onClick={handleImport} disabled={!icsUrl || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Importing..." : "Import Calendar"}
          </Button>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          {result ? (
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary">Inserted: {result.inserted}</Badge>
              <Badge variant="secondary">Updated: {result.updated}</Badge>
              <Badge variant="secondary">Skipped: {result.skipped}</Badge>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming integrations</CardTitle>
          <CardDescription>
            One-click calendar sync and SMS reminders are on the roadmap. Get notified when they launch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={() => handleStub("Google Calendar sync")}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
          <Button variant="outline" onClick={() => handleStub("SMS reminders")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Configure SMS reminders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connect;

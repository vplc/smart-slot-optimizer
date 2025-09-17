import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { DEFAULT_POLICY, getOrCreatePolicy, savePolicy } from "@/lib/policy";
import type { Policy } from "@/lib/types";

const PolicyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const data = await getOrCreatePolicy(user.id);
        setPolicy(data);
      } catch (error) {
        console.error("Failed to load policy", error);
        toast({
          title: "Unable to load policy",
          description: "Please retry in a moment.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, navigate, toast]);

  const updateField = (field: keyof Policy) => (value: string) => {
    const parsed = Number.parseInt(value, 10);
    setPolicy((prev) => ({ ...prev, [field]: Number.isNaN(parsed) ? 0 : parsed }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await savePolicy(user.id, policy);
      toast({ title: "Policy saved" });
    } catch (error) {
      console.error("Failed to save policy", error);
      toast({
        title: "Save failed",
        description: "Check your entries and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overbooking policy</h1>
          <p className="text-muted-foreground">
            Tune service capacity, penalties, and wait time targets. Updates apply instantly to the optimizer.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving" : "Save policy"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Capacity & cadence</CardTitle>
            <CardDescription>Match available chairs or providers with appointment length.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capacityS">Concurrent appointments</Label>
              <Input
                id="capacityS"
                type="number"
                min={1}
                value={policy.capacityS}
                onChange={(event) => updateField("capacityS")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceMinutes">Service length (minutes)</Label>
              <Input
                id="serviceMinutes"
                type="number"
                min={5}
                value={policy.serviceMinutes}
                onChange={(event) => updateField("serviceMinutes")(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Economics</CardTitle>
            <CardDescription>Define the value of a show and cost of overtime or idle time.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceCents">Revenue per visit (cents)</Label>
              <Input
                id="priceCents"
                type="number"
                min={0}
                value={policy.priceCents}
                onChange={(event) => updateField("priceCents")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cOverCents">Penalty for overtime (cents)</Label>
              <Input
                id="cOverCents"
                type="number"
                min={0}
                value={policy.cOverCents}
                onChange={(event) => updateField("cOverCents")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uUnderCents">Penalty for idle time (cents)</Label>
              <Input
                id="uUnderCents"
                type="number"
                min={0}
                value={policy.uUnderCents}
                onChange={(event) => updateField("uUnderCents")(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk guardrails</CardTitle>
            <CardDescription>Control how aggressively the optimizer can overbook.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slaWaitMin">Target wait time (minutes)</Label>
              <Input
                id="slaWaitMin"
                type="number"
                min={0}
                value={policy.slaWaitMin}
                onChange={(event) => updateField("slaWaitMin")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOverbook">Maximum extra bookings per slot</Label>
              <Input
                id="maxOverbook"
                type="number"
                min={0}
                value={policy.maxOverbook}
                onChange={(event) => updateField("maxOverbook")(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PolicyPage;

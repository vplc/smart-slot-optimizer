import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, DollarSign, Clock, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessSettings {
  capacity: number;
  revenue_per_appointment: number;
  overtime_cost: number;
  idle_cost: number;
  max_wait_time_minutes: number;
  max_overbook_per_slot: number;
}

interface Profile {
  business_name: string;
  phone: string;
  email: string;
  timezone: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    capacity: 1,
    revenue_per_appointment: 80,
    overtime_cost: 40,
    idle_cost: 10,
    max_wait_time_minutes: 5,
    max_overbook_per_slot: 2,
  });
  const [profile, setProfile] = useState<Profile>({
    business_name: "",
    phone: "",
    email: "",
    timezone: "America/New_York",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      // Fetch business settings
      const { data: businessData, error: businessError } = await supabase
        .from('business_settings')
        .select('*')
        .maybeSingle();

      if (businessError && businessError.code !== 'PGRST116') throw businessError;
      
      if (businessData) {
        setBusinessSettings(businessData);
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      if (profileData) {
        setProfile(profileData);
      } else if (user.email) {
        setProfile(prev => ({ ...prev, email: user.email! }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Upsert business settings
      const { error: businessError } = await supabase
        .from('business_settings')
        .upsert({
          user_id: user!.id,
          ...businessSettings,
        });

      if (businessError) throw businessError;

      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user!.id,
          ...profile,
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your business optimization parameters</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription>
              Basic information about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={profile.business_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="business@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={profile.timezone}
                  onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="America/New_York"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Optimization
            </CardTitle>
            <CardDescription>
              Configure parameters for optimal booking decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue_per_appointment">Revenue per Appointment ($)</Label>
                <Input
                  id="revenue_per_appointment"
                  type="number"
                  value={businessSettings.revenue_per_appointment}
                  onChange={(e) => setBusinessSettings(prev => ({ 
                    ...prev, 
                    revenue_per_appointment: parseFloat(e.target.value) || 0 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">Average revenue (r)</p>
              </div>
              <div>
                <Label htmlFor="overtime_cost">Overtime Cost per Minute ($)</Label>
                <Input
                  id="overtime_cost"
                  type="number"
                  step="0.01"
                  value={businessSettings.overtime_cost}
                  onChange={(e) => setBusinessSettings(prev => ({ 
                    ...prev, 
                    overtime_cost: parseFloat(e.target.value) || 0 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">Cost of running over (c)</p>
              </div>
              <div>
                <Label htmlFor="idle_cost">Idle Cost per Minute ($)</Label>
                <Input
                  id="idle_cost"
                  type="number"
                  step="0.01"
                  value={businessSettings.idle_cost}
                  onChange={(e) => setBusinessSettings(prev => ({ 
                    ...prev, 
                    idle_cost: parseFloat(e.target.value) || 0 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">Cost of idle time (ℓ)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Constraints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity & Constraints
            </CardTitle>
            <CardDescription>
              Set your operational limits and service level agreements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="capacity">Service Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={businessSettings.capacity}
                  onChange={(e) => setBusinessSettings(prev => ({ 
                    ...prev, 
                    capacity: parseInt(e.target.value) || 1 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">Concurrent appointments</p>
              </div>
              <div>
                <Label htmlFor="max_wait_time_minutes">Max Wait Time (minutes)</Label>
                <Input
                  id="max_wait_time_minutes"
                  type="number"
                  min="0"
                  value={businessSettings.max_wait_time_minutes}
                  onChange={(e) => setBusinessSettings(prev => ({ 
                    ...prev, 
                    max_wait_time_minutes: parseInt(e.target.value) || 0 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">SLA target (W*)</p>
              </div>
              <div>
                <Label htmlFor="max_overbook_per_slot">Max Overbookings per Slot</Label>
                <Input
                  id="max_overbook_per_slot"
                  type="number"
                  min="0"
                  value={businessSettings.max_overbook_per_slot}
                  onChange={(e) => setBusinessSettings(prev => ({ 
                    ...prev, 
                    max_overbook_per_slot: parseInt(e.target.value) || 0 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">Risk tolerance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              How Optimization Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Revenue per Appointment (r):</strong> Expected revenue when a customer shows up. 
                Higher values favor accepting more bookings.
              </p>
              <p>
                <strong>Overtime Cost (c):</strong> Cost per minute when appointments run over schedule. 
                Higher values reduce overbooking to avoid delays.
              </p>
              <p>
                <strong>Idle Cost (ℓ):</strong> Cost per minute of unused capacity. 
                Higher values encourage more aggressive overbooking.
              </p>
              <p>
                <strong>Max Wait Time (W*):</strong> Service level agreement for customer wait times. 
                The system optimizes to keep wait times below this threshold.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
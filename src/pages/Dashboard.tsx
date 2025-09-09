import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { optimizeSlot, sampleScenarios } from '@/lib/optimization';

interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  noShowRate: number;
  revenueToday: number;
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
  const [businessSettings, setBusinessSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch business settings
      const { data: settings } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (settings) {
        setBusinessSettings(settings);
      } else {
        // Create default settings if none exist
        const { data: newSettings } = await supabase
          .from('business_settings')
          .insert({
            user_id: user!.id,
            capacity: 1,
            revenue_per_appointment: 80.00,
            overtime_cost: 40.00,
            idle_cost: 10.00,
            max_wait_time_minutes: 5,
            max_overbook_per_slot: 2,
          })
          .select()
          .single();
        setBusinessSettings(newSettings);
      }

      // Fetch appointments for stats
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user!.id);

      if (appointments) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appointments.filter(apt => 
          new Date(apt.starts_at) > new Date() && apt.status === 'booked'
        );
        const todayAppointments = appointments.filter(apt => 
          apt.starts_at.startsWith(today)
        );
        const noShows = appointments.filter(apt => apt.status === 'no_show');
        
        setStats({
          totalAppointments: appointments.length,
          upcomingAppointments: upcoming.length,
          noShowRate: appointments.length > 0 ? (noShows.length / appointments.length) * 100 : 0,
          revenueToday: todayAppointments
            .filter(apt => apt.status === 'showed')
            .reduce((sum, apt) => sum + (parseFloat(apt.price?.toString() || '0')), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Sample optimization calculation
  const sampleOptimization = businessSettings ? 
    optimizeSlot({
      capacity: businessSettings.capacity,
      revenue: parseFloat(businessSettings.revenue_per_appointment),
      overtimeCost: parseFloat(businessSettings.overtime_cost),
      idleCost: parseFloat(businessSettings.idle_cost),
      showProbability: 0.8,
      maxWaitTime: businessSettings.max_wait_time_minutes,
    }) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-foreground">OverbookIQ Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
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
        {/* Stats Overview */}
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
              <div className="text-2xl font-bold text-revenue">${stats.revenueToday.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-revenue" />
                Today's Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sampleOptimization ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Optimal Bookings per Slot:</span>
                    <Badge variant="default" className="bg-primary">
                      {sampleOptimization.optimalBookings}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expected Revenue:</span>
                    <span className="font-semibold text-revenue">
                      ${sampleOptimization.expectedRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expected Wait Time:</span>
                    <span className="font-semibold">
                      {sampleOptimization.expectedWaitTime.toFixed(1)} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overbook Risk:</span>
                    <Badge variant={sampleOptimization.riskMetrics.overbookProbability > 0.3 ? "destructive" : "secondary"}>
                      {(sampleOptimization.riskMetrics.overbookProbability * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Configure your business settings to see optimizations.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/appointments')}>
                <Calendar className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/customers')}>
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Business Settings
              </Button>
              <Button variant="hero" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity. Start by adding your first appointment!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
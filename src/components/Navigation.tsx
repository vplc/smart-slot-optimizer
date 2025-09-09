import { Button } from "@/components/ui/button";
import { Calculator, BarChart3, Settings, Calendar, Bell } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">OverbookIQ</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Button variant="ghost" size="sm" className="text-foreground">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Bell className="h-4 w-4 mr-2" />
                  Reminders
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Demo Mode
            </div>
            <Button size="sm">Connect Calendar</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
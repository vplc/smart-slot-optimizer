import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { optimizeSlot, sampleScenarios, type SlotParams } from "@/lib/optimization";
import { TrendingUp, Clock, DollarSign, AlertTriangle, Users, Calculator } from "lucide-react";

const OptimizationDemo = () => {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof sampleScenarios>('barber');
  
  const scenario = sampleScenarios[selectedScenario];
  const result = optimizeSlot(scenario);
  
  const scenarios = [
    { key: 'barber' as const, label: 'Barber Shop', icon: '✂️' },
    { key: 'salon' as const, label: 'Hair Salon', icon: '💇‍♀️' },
    { key: 'therapist' as const, label: 'Massage Therapy', icon: '🧘‍♀️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          See the Math in Action
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our Bayesian optimization engine computes the perfect balance between revenue maximization 
          and customer satisfaction for your specific business.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Scenario Selector */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-primary" />
                Business Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenarios.map((s) => (
                <Button
                  key={s.key}
                  variant={selectedScenario === s.key ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedScenario(s.key)}
                >
                  <span className="mr-2">{s.icon}</span>
                  {s.label}
                </Button>
              ))}
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Revenue:</span>
                  <span className="font-medium">${scenario.revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{scenario.capacity} slot{scenario.capacity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Show Rate:</span>
                  <span className="font-medium">{(scenario.showProbability * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Wait:</span>
                  <span className="font-medium">{scenario.maxWaitTime} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Results */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-revenue" />
                  Optimization Results
                </span>
                <Badge variant="secondary" className="bg-revenue/10 text-revenue border-revenue/20">
                  Optimal Strategy
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-revenue/5 border border-revenue/20">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-revenue mr-3" />
                        <span className="font-medium">Optimal Bookings</span>
                      </div>
                      <span className="text-2xl font-bold text-revenue">
                        {result.optimalBookings}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-primary mr-3" />
                        <span className="font-medium">Expected Revenue</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        ${result.expectedRevenue.toFixed(0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-warning mr-3" />
                        <span className="font-medium">Expected Wait</span>
                      </div>
                      <span className="text-2xl font-bold text-warning">
                        {result.expectedWaitTime.toFixed(1)}m
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                    Risk Analysis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Overbook Risk:</span>
                      <Badge variant={result.riskMetrics.overbookProbability > 0.3 ? "destructive" : "secondary"}>
                        {(result.riskMetrics.overbookProbability * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Idle Risk:</span>
                      <Badge variant={result.riskMetrics.idleProbability > 0.2 ? "destructive" : "secondary"}>
                        {(result.riskMetrics.idleProbability * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">SLA Compliance:</span>
                      <Badge variant={result.riskMetrics.slaViolationRisk > 0.8 ? "destructive" : "secondary"}>
                        {((1 - result.riskMetrics.slaViolationRisk) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h5 className="font-medium text-foreground mb-2">Expected Utility</h5>
                    <div className="text-2xl font-bold text-foreground">
                      ${result.expectedUtility.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revenue minus costs and wait penalties
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 font-semibold">
                    1
                  </div>
                  <h5 className="font-medium mb-1">Bayesian Modeling</h5>
                  <p className="text-muted-foreground">Learns each client's no-show probability from history and external factors</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 font-semibold">
                    2
                  </div>
                  <h5 className="font-medium mb-1">Utility Optimization</h5>
                  <p className="text-muted-foreground">Maximizes expected revenue while respecting wait time constraints</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 font-semibold">
                    3
                  </div>
                  <h5 className="font-medium mb-1">Smart Reminders</h5>
                  <p className="text-muted-foreground">Uses bandit algorithms to optimize reminder timing and content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OptimizationDemo;
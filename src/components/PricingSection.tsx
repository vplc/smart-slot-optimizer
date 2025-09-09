import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";

const PricingSection = () => {
  const features = [
    "Bayesian no-show prediction",
    "Optimal overbooking recommendations", 
    "Smart reminder optimization",
    "Google Calendar integration",
    "Real-time revenue tracking",
    "Wait time SLA monitoring",
    "SMS reminder automation",
    "Performance analytics"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start optimizing your appointments today. No setup fees, cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Trial */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-center">
              <Badge variant="secondary" className="mb-2">14-Day Free Trial</Badge>
              <div className="text-3xl font-bold text-foreground">$0</div>
              <div className="text-muted-foreground">Get started risk-free</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-revenue mr-3" />
                <span className="text-sm">Up to 150 SMS reminders</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-revenue mr-3" />
                <span className="text-sm">Google Calendar sync</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-revenue mr-3" />
                <span className="text-sm">Basic optimization</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-revenue mr-3" />
                <span className="text-sm">Performance dashboard</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Start Free Trial
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge variant="default" className="bg-primary text-primary-foreground">
              Most Popular
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-3xl font-bold text-foreground">$19</div>
              <div className="text-muted-foreground">per location/month</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-revenue mr-3" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground mb-4">
              Includes 300 SMS/month, then $0.02 per SMS
            </div>
            <Button variant="hero" className="w-full">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <div className="inline-flex items-center space-x-8 text-sm text-muted-foreground">
          <span>✓ No setup fees</span>
          <span>✓ Cancel anytime</span>
          <span>✓ 24/7 support</span>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
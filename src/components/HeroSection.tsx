import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Clock, DollarSign } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground mb-8">
            <TrendingUp className="h-4 w-4 mr-2" />
            Increase revenue by 10-18% with math-optimized overbooking
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Stop Losing Money to
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"> No-Shows</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            OverbookIQ uses advanced Bayesian modeling to compute optimal appointment overbooking 
            and reminder timing, maximizing your revenue while keeping wait times under control.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Start 14-Day Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-revenue/10 text-revenue mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">+$1,200/month</h3>
                <p className="text-muted-foreground">Average revenue increase per chair</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">&lt;6 minutes</h3>
                <p className="text-muted-foreground">Average added wait time</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 text-warning mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">95%+ accuracy</h3>
                <p className="text-muted-foreground">No-show prediction model</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
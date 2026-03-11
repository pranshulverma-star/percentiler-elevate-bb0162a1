import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, ClipboardList, ArrowRight, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  converted: boolean;
  mentorshipActive: boolean;
}

export default function DashboardCourses({ converted, mentorshipActive }: Props) {
  return (
    <>
      {/* CAT + OMET Course */}
      <Card className={converted ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-primary/15"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> CAT + OMET Course
            </span>
            {converted ? (
              <Badge className="bg-emerald-600 text-white">Enrolled ✅</Badge>
            ) : (
              <Badge variant="outline" className="text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" /> 95%ile Guarantee
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {converted ? (
            <p className="text-sm text-muted-foreground">
              You're enrolled in the 95%ile Guarantee Batch. Access your course content and live classes.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-secondary/60 p-2">
                  <div className="font-semibold text-foreground">200+</div>
                  <div className="text-muted-foreground">Hours</div>
                </div>
                <div className="rounded-lg bg-secondary/60 p-2">
                  <div className="font-semibold text-foreground">Live</div>
                  <div className="text-muted-foreground">Classes</div>
                </div>
                <div className="rounded-lg bg-secondary/60 p-2">
                  <div className="font-semibold text-foreground">30+</div>
                  <div className="text-muted-foreground">Mocks</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Complete CAT + XAT + SNAP + NMAT preparation with live classes, recorded lectures & doubt sessions.</p>
            </>
          )}
          <Button asChild variant={converted ? "outline" : "default"} size="sm" className="w-full">
            <Link to="/courses/cat-omet">
              {converted ? "View Course" : "Explore Course"} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Mentorship */}
      <Card className={mentorshipActive ? "border-amber-500/30 bg-amber-500/[0.02]" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" /> Mentorship
            </span>
            {mentorshipActive ? (
              <Badge className="bg-amber-500 text-white">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                <Star className="h-3 w-3 mr-1" /> 99%ile Mentors
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mentorshipActive ? (
            <p className="text-sm text-muted-foreground">
              Your mentorship is active! Connect with your mentor for personalized guidance.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Get 1-on-1 sessions with 99%ile mentors for personalized CAT strategy & motivation.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">Weekly Calls</Badge>
                <Badge variant="secondary" className="text-xs">Study Plan</Badge>
                <Badge variant="secondary" className="text-xs">Mock Analysis</Badge>
              </div>
            </>
          )}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/mentorship">
              {mentorshipActive ? "View Mentorship" : "Learn More"} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Test Series */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Test Series
            </span>
            <Badge variant="outline" className="text-xs">30 Mocks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Full-length CAT mocks, sectional tests, and OMET papers with detailed analytics.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">CAT</Badge>
            <Badge variant="secondary" className="text-xs">XAT</Badge>
            <Badge variant="secondary" className="text-xs">SNAP</Badge>
            <Badge variant="secondary" className="text-xs">Sectional</Badge>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/test-series">
              View Test Series <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

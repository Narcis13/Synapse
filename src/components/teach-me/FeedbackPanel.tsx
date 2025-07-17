"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Brain,
  Target,
  Lightbulb,
  History,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConceptCoverage {
  concept: string;
  covered: boolean;
  quality: number; // 0-100
}

interface SessionHistory {
  sessionId: string;
  timestamp: number;
  overallScore: number;
  conceptsCovered: number;
  totalConcepts: number;
}

interface FeedbackPanelProps {
  sessionId?: string;
  evaluation?: {
    accuracy: number;
    clarity: number;
    completeness: number;
    misconceptions: string[];
    missingConcepts: string[];
    strengths: string[];
    suggestions: string[];
  };
  conceptsCoverage?: ConceptCoverage[];
  sessionHistory?: SessionHistory[];
  isLoading?: boolean;
}

export function FeedbackPanel({
  sessionId,
  evaluation,
  conceptsCoverage = [],
  sessionHistory = [],
  isLoading = false
}: FeedbackPanelProps) {
  const [activeTab, setActiveTab] = useState("realtime");
  
  // Calculate overall score
  const overallScore = evaluation 
    ? Math.round((evaluation.accuracy + evaluation.clarity + evaluation.completeness) / 3)
    : 0;

  // Determine performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 60) return { label: "Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-100" };
  };

  const performance = getPerformanceLevel(overallScore);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Teaching Feedback
            </CardTitle>
            <CardDescription>
              Real-time analysis of your teaching effectiveness
            </CardDescription>
          </div>
          {evaluation && (
            <Badge className={cn("text-lg px-3 py-1", performance.bg, performance.color)}>
              {performance.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="concepts">Concepts</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4">
            {/* Scoring Display */}
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                title="Accuracy"
                value={evaluation?.accuracy || 0}
                icon={<Target className="h-4 w-4" />}
                description="How correct your explanation is"
              />
              <MetricCard
                title="Clarity"
                value={evaluation?.clarity || 0}
                icon={<Lightbulb className="h-4 w-4" />}
                description="How easy to understand"
              />
              <MetricCard
                title="Completeness"
                value={evaluation?.completeness || 0}
                icon={<CheckCircle2 className="h-4 w-4" />}
                description="Coverage of key concepts"
              />
            </div>

            {/* Weak Areas & Strengths */}
            <div className="grid grid-cols-2 gap-4">
              {/* Weak Areas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {evaluation?.misconceptions.map((item, idx) => (
                        <Alert key={idx} className="py-2">
                          <AlertDescription className="text-sm">
                            {item}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {evaluation?.missingConcepts.map((item, idx) => (
                        <Alert key={`missing-${idx}`} className="py-2 border-orange-200">
                          <AlertDescription className="text-sm text-orange-700">
                            Missing: {item}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {(!evaluation?.misconceptions.length && !evaluation?.missingConcepts.length) && (
                        <p className="text-sm text-muted-foreground">
                          No issues identified. Great job!
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {evaluation?.strengths.map((strength, idx) => (
                        <Alert key={idx} className="py-2 border-green-200">
                          <AlertDescription className="text-sm text-green-700">
                            {strength}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {!evaluation?.strengths.length && (
                        <p className="text-sm text-muted-foreground">
                          Keep explaining to identify strengths!
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Suggestions */}
            {evaluation?.suggestions && evaluation.suggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Suggestions for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evaluation.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="concepts" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Concept Coverage Tracker</CardTitle>
                <CardDescription className="text-xs">
                  Track which concepts you've covered and how well
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {conceptsCoverage.length > 0 ? (
                      conceptsCoverage.map((concept, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{concept.concept}</span>
                            <Badge variant={concept.covered ? "default" : "outline"}>
                              {concept.covered ? "Covered" : "Not Covered"}
                            </Badge>
                          </div>
                          {concept.covered && (
                            <Progress value={concept.quality} className="h-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No concepts tracked yet. Start teaching to see coverage!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Session History
                </CardTitle>
                <CardDescription className="text-xs">
                  Track your progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {sessionHistory.length > 0 ? (
                      sessionHistory.map((session, idx) => (
                        <Card key={session.sessionId} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                Session {sessionHistory.length - idx}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Progress value={session.overallScore} className="w-20 h-2" />
                                <span className="text-sm font-semibold">
                                  {session.overallScore}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {session.conceptsCovered}/{session.totalConcepts} concepts
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No session history yet. Complete a teaching session to see your progress!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
  const getColorClass = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-blue-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{title}</span>
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className={cn("text-2xl font-bold", getColorClass(value))}>
              {value}%
            </span>
            {value > 50 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mb-1" />
            )}
          </div>
          <Progress value={value} className="h-2" />
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
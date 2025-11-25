import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Share2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import type { TestResult } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TestResultCardProps {
  result: TestResult;
  compact?: boolean;
}

export function TestResultCard({ result, compact = false }: TestResultCardProps) {
  const hasAbnormal = result.results.some(r => r.status === 'abnormal');
  
  if (compact) {
    return (
      <Card data-testid={`card-result-${result.id}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <div className="flex items-center gap-2">
            {hasAbnormal ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
            <div>
              <CardTitle className="text-base">Test Results</CardTitle>
              <CardDescription className="text-xs">
                {new Date(result.testedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          {!result.viewed && (
            <Badge variant="destructive" data-testid="badge-new">New</Badge>
          )}
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            asChild
            data-testid="button-view-result"
          >
            <a href={`/results/${result.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Results
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`card-result-${result.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {hasAbnormal ? (
              <AlertCircle className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
            <CardTitle>Sexual Health Test Results</CardTitle>
          </div>
          {!result.viewed && (
            <Badge variant="destructive" data-testid="badge-new">New</Badge>
          )}
        </div>
        <CardDescription>
          Tested {formatDistanceToNow(new Date(result.testedAt), { addSuffix: true })} at a verified diagnostic center
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Test Date:</span>
            <span className="font-medium" data-testid={`text-date-${result.id}`}>{new Date(result.testedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={hasAbnormal ? "destructive" : "default"} data-testid={`badge-status-${result.id}`}>
              {hasAbnormal ? "Attention Required" : "All Normal"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="default" size="sm" asChild data-testid="button-view-full">
            <a href={`/results/${result.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Full Results
            </a>
          </Button>
          <Button variant="outline" size="sm" data-testid="button-share">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" data-testid="button-download">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

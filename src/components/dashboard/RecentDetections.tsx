import { Link } from 'react-router-dom';
import { ArrowRight, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Detection, DISEASE_INFO } from '@/types';
import { cn } from '@/lib/utils';

interface RecentDetectionsProps {
  detections: Detection[];
}

export function RecentDetections({ detections }: RecentDetectionsProps) {
  const recentDetections = detections
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusIcon = (status: Detection['status']) => {
    switch (status) {
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'analyzed':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-success';
    if (confidence >= 0.7) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="medical-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Recent Analyses
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/history" className="flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentDetections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No analyses yet</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/dashboard/analyze">Start First Analysis</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDetections.map((detection) => (
              <Link
                key={detection.id}
                to={`/dashboard/detection/${detection.id}`}
                className="block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(detection.status)}
                    <div>
                      <p className="font-medium text-foreground">
                        {detection.patientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(detection.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {detection.classification && (
                      <Badge variant="secondary">
                        {DISEASE_INFO[detection.classification]?.name || detection.classification}
                      </Badge>
                    )}
                    <span className={cn('font-semibold', getConfidenceColor(detection.confidence))}>
                      {(detection.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

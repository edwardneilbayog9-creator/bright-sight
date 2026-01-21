import { CheckCircle2, XCircle, AlertTriangle, Clock, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PreliminaryFinding, DiseaseType } from '@/types';

interface PreliminaryFindingsProps {
  classification: DiseaseType;
  confidence: number;
  findings: PreliminaryFinding[];
  reviewUrgency: 'routine' | 'priority' | 'urgent';
}

export function PreliminaryFindings({ 
  classification, 
  confidence, 
  findings,
  reviewUrgency 
}: PreliminaryFindingsProps) {
  const getUrgencyConfig = () => {
    switch (reviewUrgency) {
      case 'urgent':
        return {
          label: 'Urgent Review Required',
          color: 'bg-destructive text-destructive-foreground',
          icon: AlertTriangle,
          description: 'Findings suggest significant pathology. Immediate ophthalmologist consultation recommended.',
        };
      case 'priority':
        return {
          label: 'Priority Review',
          color: 'bg-warning text-warning-foreground',
          icon: Clock,
          description: 'Abnormalities detected. Schedule ophthalmologist review within 1-2 weeks.',
        };
      default:
        return {
          label: 'Routine Follow-up',
          color: 'bg-success text-success-foreground',
          icon: CheckCircle2,
          description: 'No urgent findings. Continue regular screening schedule.',
        };
    }
  };

  const urgencyConfig = getUrgencyConfig();
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Preliminary Findings Card */}
      <Card className="medical-shadow border-l-4 border-l-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="w-5 h-5 text-secondary" />
            Preliminary Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <div 
                key={finding.id || index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  finding.detected ? "bg-muted/50" : "bg-background"
                )}
              >
                {finding.detected ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={cn(
                  "text-sm",
                  finding.detected ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {finding.finding}
                </span>
                {finding.detected && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-auto text-xs",
                      finding.confidence === 'high' && "border-success text-success",
                      finding.confidence === 'medium' && "border-warning text-warning",
                      finding.confidence === 'low' && "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {finding.confidence}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Confidence Note */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Model Confidence:</strong> {(confidence * 100).toFixed(1)}% certainty for {classification.replace('_', ' ')} classification.
              Findings are algorithmically generated based on disease patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Recommendation Card */}
      <Card className={cn(
        "medical-shadow border-l-4",
        reviewUrgency === 'urgent' && "border-l-destructive",
        reviewUrgency === 'priority' && "border-l-warning",
        reviewUrgency === 'routine' && "border-l-success"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UrgencyIcon className={cn(
                "w-5 h-5",
                reviewUrgency === 'urgent' && "text-destructive",
                reviewUrgency === 'priority' && "text-warning",
                reviewUrgency === 'routine' && "text-success"
              )} />
              Ophthalmologist Review Recommendation
            </CardTitle>
            <Badge className={urgencyConfig.color}>
              {urgencyConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {urgencyConfig.description}
          </p>
          
          {classification !== 'normal' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Recommended Actions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {reviewUrgency === 'urgent' && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Schedule immediate consultation with ophthalmologist
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Prepare complete patient medical history
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Consider additional imaging if available
                    </li>
                  </>
                )}
                {reviewUrgency === 'priority' && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      Schedule ophthalmologist appointment within 1-2 weeks
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      Monitor for any symptom changes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      Document current visual acuity
                    </li>
                  </>
                )}
                {reviewUrgency === 'routine' && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Continue regular eye examination schedule
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Annual fundus screening recommended
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

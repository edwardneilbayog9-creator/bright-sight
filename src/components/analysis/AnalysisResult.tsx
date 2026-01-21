import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DiseaseType, DISEASE_INFO } from '@/types';
import { cn } from '@/lib/utils';

interface AnalysisResultProps {
  classification: DiseaseType;
  confidence: number;
}

export function AnalysisResult({ classification, confidence }: AnalysisResultProps) {
  const diseaseInfo = DISEASE_INFO[classification];
  const confidencePercent = confidence * 100;

  const getSeverityColor = () => {
    if (classification === 'normal') return 'bg-success text-success-foreground';
    if (confidencePercent >= 85) return 'bg-destructive text-destructive-foreground';
    if (confidencePercent >= 70) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getConfidenceColor = () => {
    if (confidencePercent >= 85) return 'text-success';
    if (confidencePercent >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Result */}
      <Card className="medical-shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {classification === 'normal' ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-warning" />
              )}
              Classification Result
            </CardTitle>
            <Badge className={getSeverityColor()}>
              {diseaseInfo.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Confidence Meter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Confidence Level
              </span>
              <span className={cn('text-2xl font-bold', getConfidenceColor())}>
                {confidencePercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={confidencePercent} className="h-3" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Low</span>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disease Description */}
      <Card className="medical-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            About {diseaseInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {diseaseInfo.description}
          </p>

          {diseaseInfo.symptoms.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Common Symptoms</h4>
              <ul className="grid md:grid-cols-2 gap-2">
                {diseaseInfo.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diseaseInfo.riskFactors.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Risk Factors</h4>
              <ul className="grid md:grid-cols-2 gap-2">
                {diseaseInfo.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-foreground mb-2">Treatment Overview</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {diseaseInfo.treatment}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Medical Disclaimer</p>
            <p className="text-sm text-muted-foreground mt-1">
              This is a pre-diagnosis tool and should not replace professional medical advice. 
              Please consult an ophthalmologist for a comprehensive examination and final diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
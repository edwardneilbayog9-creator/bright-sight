import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import { DiseaseType, DISEASE_INFO, MODEL_PERFORMANCE } from '@/types';
import { cn } from '@/lib/utils';

interface ProbabilityChartProps {
  allProbabilities: Record<DiseaseType, number>;
  topClassification: DiseaseType;
}

export function ProbabilityChart({ allProbabilities, topClassification }: ProbabilityChartProps) {
  // Sort probabilities by value descending
  const sortedProbabilities = Object.entries(allProbabilities)
    .sort(([, a], [, b]) => b - a) as [DiseaseType, number][];

  const getBarColor = (diseaseType: DiseaseType, isTop: boolean) => {
    if (isTop) {
      if (diseaseType === 'normal') return 'bg-success';
      return 'bg-primary';
    }
    return 'bg-muted-foreground/30';
  };

  return (
    <Card className="medical-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Classification Probabilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedProbabilities.map(([diseaseType, probability]) => {
          const isTop = diseaseType === topClassification;
          const percent = probability * 100;
          const performance = MODEL_PERFORMANCE[diseaseType];
          
          return (
            <div key={diseaseType} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isTop ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {DISEASE_INFO[diseaseType].name}
                  </span>
                  {isTop && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Top Match
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    F1: {(performance.f1Score * 100).toFixed(0)}%
                  </span>
                  <span className={cn(
                    "text-sm font-bold min-w-[50px] text-right",
                    isTop ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress 
                  value={percent} 
                  className={cn(
                    "h-2",
                    isTop && "[&>div]:bg-primary",
                    !isTop && "[&>div]:bg-muted-foreground/30"
                  )}
                />
              </div>
            </div>
          );
        })}

        {/* Model Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="text-sm font-medium text-foreground">ViT-Base-16</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Training Samples</p>
              <p className="text-sm font-medium text-foreground">844</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

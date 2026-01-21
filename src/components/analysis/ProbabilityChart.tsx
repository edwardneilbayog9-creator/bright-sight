import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DiseaseType, DISEASE_INFO } from '@/types';

interface ProbabilityChartProps {
  allProbabilities: Record<DiseaseType, number>;
  topClassification: DiseaseType;
}

export function ProbabilityChart({ allProbabilities, topClassification }: ProbabilityChartProps) {
  // Sort by probability descending
  const sortedProbs = Object.entries(allProbabilities)
    .sort(([, a], [, b]) => b - a) as [DiseaseType, number][];

  return (
    <Card className="medical-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Classification Probabilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedProbs.map(([diseaseType, probability]) => {
          const percent = probability * 100;
          const isTop = diseaseType === topClassification;
          
          return (
            <div key={diseaseType} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isTop ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {DISEASE_INFO[diseaseType].name}
                  </span>
                  {isTop && (
                    <Badge variant="secondary" className="text-xs">
                      Top Match
                    </Badge>
                  )}
                </div>
                <span className={`text-sm font-bold ${isTop ? 'text-primary' : 'text-muted-foreground'}`}>
                  {percent.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={percent} 
                className={`h-2 ${isTop ? '' : 'opacity-60'}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
import { Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Detection } from '@/types';

interface StatsCardsProps {
  detections: Detection[];
}

export function StatsCards({ detections }: StatsCardsProps) {
  const totalAnalyses = detections.length;
  const reviewed = detections.filter(d => d.status === 'reviewed').length;
  const pending = detections.filter(d => d.status === 'pending' || d.status === 'analyzed').length;
  const highConfidence = detections.filter(d => d.confidence >= 0.85).length;

  const stats = [
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      icon: Eye,
      color: 'bg-primary text-primary-foreground',
    },
    {
      label: 'Reviewed',
      value: reviewed,
      icon: CheckCircle,
      color: 'bg-success text-success-foreground',
    },
    {
      label: 'Pending Review',
      value: pending,
      icon: Clock,
      color: 'bg-warning text-warning-foreground',
    },
    {
      label: 'High Confidence',
      value: highConfidence,
      icon: AlertTriangle,
      color: 'bg-secondary text-secondary-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="medical-shadow hover:medical-shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

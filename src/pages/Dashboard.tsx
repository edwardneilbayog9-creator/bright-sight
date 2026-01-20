import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentDetections } from '@/components/dashboard/RecentDetections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDetections } from '@/hooks/useDetections';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { detections, isLoading } = useDetections();

  // Calculate disease distribution
  const diseaseStats = detections.reduce((acc, d) => {
    if (d.classification) {
      acc[d.classification] = (acc[d.classification] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your eye disease analyses
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/analyze">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-24" />
              </Card>
            ))}
          </div>
        ) : (
          <StatsCards detections={detections} />
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Detections - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentDetections detections={detections} />
          </div>

          {/* Disease Distribution */}
          <Card className="medical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Disease Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(diseaseStats).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(diseaseStats).map(([disease, count]) => {
                    const total = detections.length;
                    const percentage = ((count / total) * 100).toFixed(1);
                    const colors: Record<string, string> = {
                      cataract: 'bg-primary',
                      diabetic_retinopathy: 'bg-warning',
                      glaucoma: 'bg-destructive',
                      normal: 'bg-success',
                    };
                    return (
                      <div key={disease} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-foreground">
                            {disease.replace('_', ' ')}
                          </span>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[disease] || 'bg-primary'} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="medical-shadow bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Quick Start Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a fundus image to get started with eye disease pre-diagnosis
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link to="/dashboard/history">View History</Link>
                </Button>
                <Button asChild>
                  <Link to="/dashboard/analyze">Start Analysis</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

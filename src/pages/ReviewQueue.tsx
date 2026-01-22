import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Eye, AlertTriangle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDetections } from '@/hooks/useDetections';
import { Detection, DISEASE_INFO } from '@/types';
import { cn } from '@/lib/utils';

export default function ReviewQueue() {
  const { detections, isLoading } = useDetections();
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Filter only analyzed (not yet reviewed) detections
  const pendingReviews = detections
    .filter(d => d.status === 'analyzed')
    .filter(d => urgencyFilter === 'all' || d.reviewUrgency === urgencyFilter)
    .sort((a, b) => {
      // Sort by urgency first (urgent > priority > routine), then by date
      const urgencyOrder = { urgent: 0, priority: 1, routine: 2 };
      const aUrgency = urgencyOrder[a.reviewUrgency || 'routine'];
      const bUrgency = urgencyOrder[b.reviewUrgency || 'routine'];
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const urgentCount = detections.filter(d => d.status === 'analyzed' && d.reviewUrgency === 'urgent').length;
  const priorityCount = detections.filter(d => d.status === 'analyzed' && d.reviewUrgency === 'priority').length;
  const routineCount = detections.filter(d => d.status === 'analyzed' && d.reviewUrgency === 'routine').length;

  const getUrgencyBadge = (urgency: Detection['reviewUrgency']) => {
    const config = {
      urgent: { label: 'Urgent', className: 'bg-destructive/20 text-destructive border-destructive/30' },
      priority: { label: 'Priority', className: 'bg-warning/20 text-warning border-warning/30' },
      routine: { label: 'Routine', className: 'bg-muted text-muted-foreground border-muted' },
    };
    const { label, className } = config[urgency || 'routine'];
    return <Badge variant="outline" className={cn('font-medium', className)}>{label}</Badge>;
  };

  const getUrgencyIcon = (urgency: Detection['reviewUrgency']) => {
    switch (urgency) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'priority':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Review Queue
            </h1>
            <p className="text-muted-foreground">
              Analyzed cases awaiting ophthalmologist review
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn(
            'medical-shadow cursor-pointer transition-all hover:ring-2 hover:ring-destructive/50',
            urgencyFilter === 'urgent' && 'ring-2 ring-destructive'
          )} onClick={() => setUrgencyFilter(urgencyFilter === 'urgent' ? 'all' : 'urgent')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{urgentCount}</p>
                <p className="text-sm text-muted-foreground">Urgent Reviews</p>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            'medical-shadow cursor-pointer transition-all hover:ring-2 hover:ring-warning/50',
            urgencyFilter === 'priority' && 'ring-2 ring-warning'
          )} onClick={() => setUrgencyFilter(urgencyFilter === 'priority' ? 'all' : 'priority')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{priorityCount}</p>
                <p className="text-sm text-muted-foreground">Priority Reviews</p>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            'medical-shadow cursor-pointer transition-all hover:ring-2 hover:ring-muted-foreground/50',
            urgencyFilter === 'routine' && 'ring-2 ring-muted-foreground'
          )} onClick={() => setUrgencyFilter(urgencyFilter === 'routine' ? 'all' : 'routine')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{routineCount}</p>
                <p className="text-sm text-muted-foreground">Routine Reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pendingReviews.length} case{pendingReviews.length !== 1 ? 's' : ''} awaiting review
          </p>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="urgent">Urgent Only</SelectItem>
              <SelectItem value="priority">Priority Only</SelectItem>
              <SelectItem value="routine">Routine Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Queue List */}
        <Card className="medical-shadow">
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>
              Cases sorted by urgency level and submission date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : pendingReviews.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No cases pending review</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {urgencyFilter !== 'all' 
                    ? `No ${urgencyFilter} cases found. Try changing the filter.`
                    : 'All analyzed cases have been reviewed.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((detection) => (
                  <div
                    key={detection.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors',
                      detection.reviewUrgency === 'urgent' && 'border-l-4 border-l-destructive',
                      detection.reviewUrgency === 'priority' && 'border-l-4 border-l-warning'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {detection.imageBase64 ? (
                          <img
                            src={detection.imageBase64}
                            alt="Fundus"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getUrgencyIcon(detection.reviewUrgency)}
                          <p className="font-medium text-foreground">
                            {detection.patientName}
                          </p>
                          {getUrgencyBadge(detection.reviewUrgency)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Age: {detection.patientAge} • Analyzed: {new Date(detection.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          {detection.classification && (
                            <Badge variant="secondary">
                              {DISEASE_INFO[detection.classification]?.name || detection.classification}
                            </Badge>
                          )}
                          <span className={cn(
                            'text-sm font-medium',
                            detection.confidence >= 0.85 ? 'text-success' :
                            detection.confidence >= 0.7 ? 'text-warning' : 'text-destructive'
                          )}>
                            {(detection.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button asChild>
                      <Link to={`/dashboard/detection/${detection.id}`}>
                        Review Case
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

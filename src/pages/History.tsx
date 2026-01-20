import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Search, Filter, Eye, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDetections } from '@/hooks/useDetections';
import { useToast } from '@/hooks/use-toast';
import { Detection, DISEASE_INFO } from '@/types';
import { cn } from '@/lib/utils';

export default function History() {
  const { detections, deleteDetection, isLoading } = useDetections();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');

  const filteredDetections = detections
    .filter(d => {
      const matchesSearch = d.patientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesDisease = diseaseFilter === 'all' || d.classification === diseaseFilter;
      return matchesSearch && matchesStatus && matchesDisease;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = (id: string) => {
    deleteDetection(id);
    toast({
      title: 'Detection Deleted',
      description: 'The analysis record has been removed.',
    });
  };

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

  const getStatusBadge = (status: Detection['status']) => {
    const variants: Record<Detection['status'], string> = {
      pending: 'bg-muted text-muted-foreground',
      analyzed: 'bg-warning/20 text-warning',
      reviewed: 'bg-success/20 text-success',
    };
    return (
      <Badge className={cn('capitalize', variants[status])}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-primary" />
              Analysis History
            </h1>
            <p className="text-muted-foreground">
              View and manage all previous analyses
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/analyze">New Analysis</Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="medical-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Disease" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Diseases</SelectItem>
                    <SelectItem value="cataract">Cataract</SelectItem>
                    <SelectItem value="diabetic_retinopathy">Diabetic Retinopathy</SelectItem>
                    <SelectItem value="glaucoma">Glaucoma</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Records</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredDetections.length} results
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredDetections.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No analyses found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/dashboard/analyze">Start First Analysis</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
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
                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(detection.status)}
                          <p className="font-medium text-foreground">
                            {detection.patientName}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Age: {detection.patientAge} • {new Date(detection.createdAt).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(detection.status)}
                          {detection.classification && (
                            <Badge variant="secondary">
                              {DISEASE_INFO[detection.classification]?.name || detection.classification}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-semibold',
                        detection.confidence >= 0.85 ? 'text-success' :
                        detection.confidence >= 0.7 ? 'text-warning' : 'text-destructive'
                      )}>
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/detection/${detection.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this analysis for {detection.patientName}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(detection.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

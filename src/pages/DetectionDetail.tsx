import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Eye, Stethoscope, FileText, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalysisResult } from '@/components/analysis/AnalysisResult';
import { DoctorReviewForm } from '@/components/analysis/DoctorReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDetections } from '@/hooks/useDetections';
import { DoctorReview } from '@/types';

export default function DetectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDetectionById, addDoctorReview } = useDetections();

  const detection = id ? getDetectionById(id) : null;

  if (!detection) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Eye className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Detection Not Found</h2>
            <p className="text-muted-foreground mb-4">The analysis you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/dashboard/history">Back to History</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleReviewSubmit = (review: Omit<DoctorReview, 'reviewedAt'>) => {
    addDoctorReview(detection.id, review);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Analysis Details
              </h1>
              <p className="text-muted-foreground">
                {detection.patientName} • {new Date(detection.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            <Badge
              className={
                detection.status === 'reviewed'
                  ? 'bg-success text-success-foreground'
                  : detection.status === 'analyzed'
                  ? 'bg-warning text-warning-foreground'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {detection.status.charAt(0).toUpperCase() + detection.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Image & Patient Info */}
          <div className="space-y-6">
            {/* Fundus Image */}
            <Card className="medical-shadow overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="w-4 h-4 text-primary" />
                  Fundus Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {detection.imageBase64 ? (
                  <img
                    src={detection.imageBase64}
                    alt="Fundus"
                    className="w-full h-64 object-contain bg-muted"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted flex items-center justify-center">
                    <Eye className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">{detection.patientName}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium text-foreground">{detection.patientAge} years</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(detection.createdAt).toLocaleString()}
                  </span>
                </div>
                {detection.remarks && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1 mb-2">
                        <FileText className="w-3 h-3" />
                        Remarks
                      </span>
                      <p className="text-sm text-foreground">{detection.remarks}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results & Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Results */}
            {detection.classification && (
              <AnalysisResult
                classification={detection.classification}
                confidence={detection.confidence}
              />
            )}

            {/* Doctor's Review */}
            {detection.doctorReview ? (
              <Card className="medical-shadow border-l-4 border-l-success">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-success" />
                    Doctor's Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Reviewed By</p>
                      <p className="font-medium text-foreground">{detection.doctorReview.doctorName}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Severity</p>
                      <Badge
                        className={
                          detection.doctorReview.severity === 'severe'
                            ? 'bg-destructive text-destructive-foreground'
                            : detection.doctorReview.severity === 'moderate'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-success text-success-foreground'
                        }
                      >
                        {detection.doctorReview.severity}
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Follow-up</p>
                      <p className="font-medium text-foreground">
                        {detection.doctorReview.followUpDate
                          ? new Date(detection.doctorReview.followUpDate).toLocaleDateString()
                          : 'Not scheduled'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Clinical Diagnosis</h4>
                    <p className="text-muted-foreground">{detection.doctorReview.diagnosis}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Recommendations</h4>
                    <p className="text-muted-foreground">{detection.doctorReview.recommendations}</p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Reviewed on {new Date(detection.doctorReview.reviewedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <DoctorReviewForm
                detectionId={detection.id}
                onSubmit={handleReviewSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

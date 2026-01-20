import { useState } from 'react';
import { Stethoscope, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoctorReview } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DoctorReviewFormProps {
  detectionId: string;
  existingReview?: DoctorReview | null;
  onSubmit: (review: Omit<DoctorReview, 'reviewedAt'>) => void;
}

export function DoctorReviewForm({ existingReview, onSubmit }: DoctorReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: existingReview?.diagnosis || '',
    recommendations: existingReview?.recommendations || '',
    severity: existingReview?.severity || 'mild' as DoctorReview['severity'],
    followUpDate: existingReview?.followUpDate || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.diagnosis.trim() || !formData.recommendations.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      onSubmit({
        doctorId: user?.id || '',
        doctorName: user?.name || 'Unknown Doctor',
        diagnosis: formData.diagnosis,
        recommendations: formData.recommendations,
        severity: formData.severity,
        followUpDate: formData.followUpDate || undefined,
      });

      toast({
        title: 'Review Saved',
        description: 'The doctor review has been saved successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save review.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="medical-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          Doctor / Ophthalmologist Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Assessment *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as DoctorReview['severity'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Clinical Diagnosis *</Label>
            <Textarea
              id="diagnosis"
              placeholder="Enter your clinical diagnosis based on the fundus image analysis..."
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations *</Label>
            <Textarea
              id="recommendations"
              placeholder="Enter treatment recommendations and next steps..."
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {existingReview ? 'Update Review' : 'Save Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, User, Calendar, FileText, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ImageUploader } from '@/components/analysis/ImageUploader';
import { AnalysisResult } from '@/components/analysis/AnalysisResult';
import { PreliminaryFindings } from '@/components/analysis/PreliminaryFindings';
import { ProbabilityChart } from '@/components/analysis/ProbabilityChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useDetections } from '@/hooks/useDetections';
import { useToast } from '@/hooks/use-toast';
import { DiseaseType, PreliminaryFinding, PRELIMINARY_FINDINGS_MAP } from '@/types';

// Flask backend URL - Update this when running the Python backend
const FLASK_API_URL = 'http://localhost:5000';

interface AnalysisResultData {
  classification: DiseaseType;
  confidence: number;
  allProbabilities: Record<DiseaseType, number>;
  preliminaryFindings: PreliminaryFinding[];
  reviewUrgency: 'routine' | 'priority' | 'urgent';
}

export default function Analyze() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addDetection } = useDetections();
  const { toast } = useToast();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [remarks, setRemarks] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);

  const handleImageSelect = (file: File, base64: string) => {
    setImageFile(file);
    setImageBase64(base64);
    setResult(null);
  };

  const generatePreliminaryFindings = (
    classification: DiseaseType, 
    confidence: number
  ): PreliminaryFinding[] => {
    const findingsTemplate = PRELIMINARY_FINDINGS_MAP[classification] || [];
    const confidenceLevel = confidence >= 0.85 ? 'high' : confidence >= 0.70 ? 'medium' : 'low';
    
    return findingsTemplate.map((item, index) => ({
      id: `finding-${index}`,
      finding: item.finding,
      detected: item.defaultDetected,
      confidence: confidenceLevel,
    }));
  };

  const getReviewUrgency = (classification: DiseaseType, confidence: number): 'routine' | 'priority' | 'urgent' => {
    if (classification === 'normal') return 'routine';
    
    if (confidence >= 0.85) {
      if (classification === 'diabetic_retinopathy' || classification === 'glaucoma') {
        return 'urgent';
      }
      return 'priority';
    } else if (confidence >= 0.70) {
      return 'priority';
    }
    return 'routine';
  };

  const analyzeImage = async () => {
    if (!imageFile || !patientName || !patientAge) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in patient details and upload an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Try to call the Flask backend
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${FLASK_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const classification = data.classification as DiseaseType;
        const confidence = data.confidence;
        
        // Use backend findings if available, otherwise generate
        const findings = data.preliminary_findings 
          ? data.preliminary_findings.map((f: { finding: string; detected: boolean }, i: number) => ({
              id: `finding-${i}`,
              finding: f.finding,
              detected: f.detected,
              confidence: confidence >= 0.85 ? 'high' : confidence >= 0.70 ? 'medium' : 'low',
            }))
          : generatePreliminaryFindings(classification, confidence);
        
        setResult({
          classification,
          confidence,
          allProbabilities: data.all_probabilities || {
            cataract: 0,
            diabetic_retinopathy: 0,
            glaucoma: 0,
            normal: 0,
            [classification]: confidence,
          },
          preliminaryFindings: findings,
          reviewUrgency: data.review_urgency || getReviewUrgency(classification, confidence),
        });
      } else {
        throw new Error('Backend not available');
      }
    } catch {
      // Mock response if Flask backend is not running
      console.log('Flask backend not available, using mock response');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock classification result
      const mockResults: DiseaseType[] = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal'];
      const classification = mockResults[Math.floor(Math.random() * mockResults.length)];
      const confidence = 0.75 + Math.random() * 0.20; // 75-95%
      
      // Generate mock probabilities
      const allProbabilities: Record<DiseaseType, number> = {
        cataract: Math.random() * 0.15,
        diabetic_retinopathy: Math.random() * 0.15,
        glaucoma: Math.random() * 0.15,
        normal: Math.random() * 0.15,
      };
      allProbabilities[classification] = confidence;
      
      // Normalize
      const total = Object.values(allProbabilities).reduce((a, b) => a + b, 0);
      (Object.keys(allProbabilities) as DiseaseType[]).forEach(key => {
        allProbabilities[key] = allProbabilities[key] / total;
      });
      allProbabilities[classification] = confidence;
      
      setResult({
        classification,
        confidence,
        allProbabilities,
        preliminaryFindings: generatePreliminaryFindings(classification, confidence),
        reviewUrgency: getReviewUrgency(classification, confidence),
      });

      toast({
        title: 'Demo Mode',
        description: 'Flask backend not detected. Using simulated results.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveDetection = () => {
    if (!result) return;

    const detection = addDetection({
      userId: user?.id || '',
      patientName,
      patientAge: parseInt(patientAge),
      imagePath: imageFile?.name || '',
      imageBase64,
      classification: result.classification,
      confidence: result.confidence,
      description: '',
      remarks,
      doctorReview: null,
      status: 'analyzed',
      preliminaryFindings: result.preliminaryFindings,
      allProbabilities: result.allProbabilities,
      reviewUrgency: result.reviewUrgency,
    });

    toast({
      title: 'Detection Saved',
      description: 'The analysis has been saved to history.',
    });

    navigate(`/dashboard/detection/${detection.id}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scan className="w-6 h-6 text-primary" />
            New Analysis
          </h1>
          <p className="text-muted-foreground">
            Upload a fundus image for eye disease pre-diagnosis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Patient Information */}
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      placeholder="Enter patient name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientAge">Age *</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="patientAge"
                        type="number"
                        placeholder="Age"
                        min="0"
                        max="120"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Additional Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    placeholder="Any relevant medical history or observations..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-primary" />
                  Fundus Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  isAnalyzing={isAnalyzing}
                />

                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={analyzeImage}
                    disabled={!imageFile || isAnalyzing}
                    className="flex-1"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <AnalysisResult
                  classification={result.classification}
                  confidence={result.confidence}
                />
                
                {/* Probability Distribution */}
                <ProbabilityChart
                  allProbabilities={result.allProbabilities}
                  topClassification={result.classification}
                />
                
                {/* Preliminary Findings & Review Recommendation */}
                <PreliminaryFindings
                  classification={result.classification}
                  confidence={result.confidence}
                  findings={result.preliminaryFindings}
                  reviewUrgency={result.reviewUrgency}
                />
                
                <Button onClick={saveDetection} className="w-full" size="lg">
                  Save & Continue to Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <Card className="medical-shadow h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="p-6 rounded-full bg-muted inline-block mb-4">
                    <Scan className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Upload a fundus image and click "Analyze Image" to get the pre-diagnosis results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanEye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Branding & Info */}
      <div className="flex-1 gradient-hero flex flex-col justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto lg:mr-8 xl:mr-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 rounded-xl bg-secondary/20 backdrop-blur-sm">
              <ScanEye className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-secondary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">BrightSight</h1>
              <p className="text-xs sm:text-sm text-white/70">Eye Disease Detection</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              AI-Powered
              <span className="block text-secondary">Eye Diagnostics</span>
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-md">
              Advanced machine learning technology for accurate eye disease detection and pre-diagnosis assistance.
            </p>

            {/* Features List */}
            <ul className="space-y-2 sm:space-y-3 text-white/70 text-sm sm:text-base">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                <span>Multi-disease detection support</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                <span>Instant preliminary analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                <span>Professional review workflow</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - CTA */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-card">
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:mr-auto lg:ml-8 xl:ml-16">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-2">
                Get Started
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sign in to access the diagnostic platform
              </p>
            </div>

            <Button 
              onClick={() => navigate('/login')}
              size="lg"
              className="w-full sm:w-auto gradient-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm sm:text-base py-5 sm:py-6 px-6 sm:px-8"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>

            <div className="pt-4 sm:pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">
                BrightSight is a desktop application designed for medical professionals to assist in eye disease screening and diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

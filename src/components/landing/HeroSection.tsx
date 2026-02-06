import { Eye, Shield, Activity, Microscope, ScanEye } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative h-full gradient-hero flex flex-col justify-center px-8 lg:px-12 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Primary pulse ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-secondary/20 animate-pulse-ring" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-secondary/15 animate-pulse-ring-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary-foreground/10 animate-pulse-ring-slow" />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary-foreground/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-secondary/15 blur-2xl animate-pulse-soft" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/30 rounded-2xl blur-xl animate-pulse-soft" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-secondary/30 to-primary-foreground/10 backdrop-blur-sm border border-secondary/30">
              <ScanEye className="w-12 h-12 text-secondary" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <span className="text-primary-foreground font-bold text-2xl tracking-tight">
              BrightSight
            </span>
            <span className="block text-secondary/80 text-sm font-medium tracking-wide">
              Vision Intelligence
            </span>
          </div>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
          Advanced Eye Disease
          <span className="block text-secondary">Pre-Diagnosis System</span>
        </h1>

        <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
          Leveraging computer vision and deep learning to detect Cataract, 
          Diabetic Retinopathy, and Glaucoma from fundus images with clinical precision.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            icon={Microscope}
            title="EfficientNet Model"
            description="EfficientNetV2-S architecture"
          />
          <FeatureCard
            icon={Activity}
            title="High Accuracy"
            description="Enhanced classification model"
          />
          <FeatureCard
            icon={Shield}
            title="Secure"
            description="HIPAA-compliant handling"
          />
          <FeatureCard
            icon={Eye}
            title="3 Diseases"
            description="Cataract, DR, Glaucoma"
          />
        </div>

        {/* Thesis Info */}
        <div className="mt-10 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
          <p className="text-primary-foreground/70 text-sm font-medium mb-1">Research Project</p>
          <p className="text-primary-foreground text-sm">
            "Development of a Computer Vision-Based System for Pre-Diagnosis of Eye Diseases Using Fundus Images"
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof Eye; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 transition-all duration-300 hover:bg-primary-foreground/15 hover:border-secondary/30 hover:scale-[1.02]">
      <Icon className="w-6 h-6 text-secondary mb-2" />
      <h3 className="text-primary-foreground font-semibold text-sm">{title}</h3>
      <p className="text-primary-foreground/60 text-xs">{description}</p>
    </div>
  );
}

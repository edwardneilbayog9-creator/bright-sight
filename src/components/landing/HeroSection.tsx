import { Eye, Shield, Activity, Microscope } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative h-full gradient-hero flex flex-col justify-center px-8 lg:px-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-secondary/20 backdrop-blur-sm">
            <Eye className="w-10 h-10 text-secondary" />
          </div>
          <span className="text-secondary font-semibold tracking-wide uppercase text-sm">
            EyeCare AI
          </span>
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
            title="ViT Model"
            description="Vision Transformer architecture"
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
    <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 transition-all hover:bg-primary-foreground/15">
      <Icon className="w-6 h-6 text-secondary mb-2" />
      <h3 className="text-primary-foreground font-semibold text-sm">{title}</h3>
      <p className="text-primary-foreground/60 text-xs">{description}</p>
    </div>
  );
}

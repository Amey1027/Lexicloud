import { MessageSquare, Brain, FileCheck, Download } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Describe Your Need",
    description: "Use natural language to describe the legal document you need. No legal jargon required - just explain in your own words."
  },
  {
    icon: Brain,
    number: "02",
    title: "AI Analysis",
    description: "Our Vertex AI engine analyzes your request, identifies applicable laws, and structures the document using Document AI."
  },
  {
    icon: FileCheck,
    number: "03",
    title: "Validation & Compliance",
    description: "The Law & Clause Intelligence Engine validates every clause against current statutes and precedents stored in BigQuery."
  },
  {
    icon: Download,
    number: "04",
    title: "Review & Export",
    description: "Receive a professionally formatted, legally sound document ready for use. Export in your preferred format."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How LexiCloud Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From prompt to perfect legal document in four simple steps
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-primary opacity-20" 
                    style={{ transform: 'translateX(-50%)' }} 
                  />
                )}
                
                <div className="relative space-y-4">
                  {/* Number badge */}
                  <div className="text-6xl font-bold text-primary/10">{step.number}</div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

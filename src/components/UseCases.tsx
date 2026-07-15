import { Building2, Scale, Briefcase, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const useCases = [
  {
    icon: Scale,
    title: "Law Firms",
    description: "Accelerate contract drafting, reduce billable hours on routine documents, and focus on high-value legal strategy.",
    benefits: ["50% faster drafting", "Reduced errors", "Scalable workflows"]
  },
  {
    icon: Building2,
    title: "Startups",
    description: "Access enterprise-grade legal documentation without the enterprise budget. Perfect for early-stage compliance.",
    benefits: ["Cost-effective", "Startup-friendly", "Quick incorporation"]
  },
  {
    icon: Briefcase,
    title: "Corporate Legal Teams",
    description: "Standardize legal processes across departments. Ensure compliance while managing high document volumes.",
    benefits: ["Template management", "Audit trails", "Team collaboration"]
  },
  {
    icon: Users,
    title: "Legal Professionals",
    description: "Solo practitioners and consultants can compete with large firms through AI-powered legal automation.",
    benefits: ["Professional templates", "Client management", "Practice growth"]
  }
];

const UseCases = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Built for Legal Professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're a solo practitioner or managing a large legal team, LexiCloud scales to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card 
              key={index}
              className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-medium group"
            >
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <useCase.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">{useCase.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-border">
                  {useCase.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;

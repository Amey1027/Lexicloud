import { FileText, Shield, Zap, Search, Database, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Smart Document Drafting",
    description: "Generate contracts, agreements, and legal notices through natural language prompts. Our AI understands legal context and creates comprehensive documents."
  },
  {
    icon: Shield,
    title: "Law & Clause Intelligence",
    description: "Every clause is validated against current Indian statutes and case precedents. Ensure compliance and reduce legal risks automatically."
  },
  {
    icon: Zap,
    title: "Lightning Fast Generation",
    description: "What takes hours manually, takes minutes with LexiCloud. Powered by Google Vertex AI for instant, accurate document generation."
  },
  {
    icon: Search,
    title: "Real-Time Verification",
    description: "Cross-reference legal clauses with up-to-date Indian laws. Get instant feedback on compliance and potential issues."
  },
  {
    icon: Database,
    title: "BigQuery Integration",
    description: "Access vast repositories of legal precedents and statutory provisions. Make data-driven decisions backed by comprehensive legal research."
  },
  {
    icon: CheckCircle,
    title: "Compliance Assurance",
    description: "Built-in risk detection identifies potential legal vulnerabilities. Stay compliant with ever-changing Indian legal landscape."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Intelligent Legal Automation
          </h2>
          <p className="text-lg text-muted-foreground">
            Combine the power of Google Cloud AI with deep legal expertise to transform your legal workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-medium group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

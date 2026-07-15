import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTemplates,
  fetchHistory,
  addHistory,
  deleteHistory,
  generateDocument,
  checkCompliance,
  suggestClauses,
  sendDocumentEmail,
  type Template,
  type HistoryItem,
} from "@/lib/backend";
import { Copy, Download, FileText, History, Sparkles, Shield, Trash2, Mail, FileDown, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { AppUser } from "@/lib/auth";
import jsPDF from "jspdf";
import DocumentComparison from "./DocumentComparison";

interface DocumentGeneratorProps {
  user: AppUser | null;
}

const DocumentGenerator = ({ user }: DocumentGeneratorProps) => {
  const [documentType, setDocumentType] = useState("");
  const [parties, setParties] = useState("");
  const [purpose, setPurpose] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [complianceAnalysis, setComplianceAnalysis] = useState("");
  const [clauseSuggestions, setClauseSuggestions] = useState("");
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadHistory();
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data } = await fetchTemplates();
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadHistory = async () => {
    if (!user) return;

    try {
      const { data } = await fetchHistory();
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error loading history:", error);
    }
  };

  const saveToHistory = async (docType: string, content: string) => {
    if (!user) return;

    try {
      await addHistory(docType, content, { parties, purpose });
      loadHistory();
    } catch (error: any) {
      console.error("Error saving to history:", error);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await deleteHistory(id);
      loadHistory();
      toast({
        title: "Deleted",
        description: "Document removed from history",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!documentType || !parties || !purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { document } = await generateDocument({
        documentType,
        parties,
        purpose,
        additionalDetails,
      });

      setGeneratedDocument(document);
      await saveToHistory(documentType, document);
      toast({
        title: "Success!",
        description: "Legal document generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckCompliance = async () => {
    if (!generatedDocument) {
      toast({
        title: "No Document",
        description: "Please generate a document first",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingCompliance(true);
    try {
      const { analysis } = await checkCompliance({
        document: generatedDocument,
        documentType,
      });

      setComplianceAnalysis(analysis);
      toast({
        title: "Compliance Check Complete",
        description: "Review the analysis below",
      });
    } catch (error: any) {
      toast({
        title: "Compliance Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!documentType) {
      toast({
        title: "Document Type Required",
        description: "Please select a document type first",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const { suggestions } = await suggestClauses({
        documentType,
        context: additionalDetails || purpose,
      });

      setClauseSuggestions(suggestions);
      toast({
        title: "Suggestions Ready",
        description: "Smart clause suggestions generated",
      });
    } catch (error: any) {
      toast({
        title: "Suggestion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedDocument) {
      toast({
        title: "No Document",
        description: "Please generate a document first",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;

      doc.setFontSize(16);
      doc.text(documentType || "Legal Document", margin, margin);

      doc.setFontSize(10);
      const lines = doc.splitTextToSize(generatedDocument, maxLineWidth);
      let y = margin + 10;

      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 7;
      });

      doc.save(`${documentType.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

      toast({
        title: "PDF Exported",
        description: "Document saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!generatedDocument || !emailRecipient) {
      toast({
        title: "Missing Information",
        description: "Please generate a document and provide recipient email",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      await sendDocumentEmail({
        to: emailRecipient,
        subject: `Legal Document: ${documentType}`,
        documentType,
        content: generatedDocument,
      });

      toast({
        title: "Email Sent",
        description: `Document sent to ${emailRecipient}`,
      });
      setEmailRecipient("");
    } catch (error: any) {
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const useTemplate = (template: Template) => {
    setDocumentType(template.document_type);
    setGeneratedDocument(template.content);
    toast({
      title: "Template Loaded",
      description: `${template.name} is ready to customize`,
    });
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setDocumentType(item.document_type);
    setGeneratedDocument(item.content);
    if (item.metadata) {
      setParties(item.metadata.parties || "");
      setPurpose(item.metadata.purpose || "");
    }
    toast({
      title: "Restored",
      description: "Document loaded from history",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Legal Document Generator</h1>
        <p className="text-muted-foreground">AI-powered legal drafting with Indian law compliance</p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generator">
            <FileText className="w-4 h-4 mr-2" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Sparkles className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Shield className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="compare">
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <CardDescription>Provide information about your legal document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employment Contract">Employment Contract</SelectItem>
                      <SelectItem value="Non-Disclosure Agreement">Non-Disclosure Agreement</SelectItem>
                      <SelectItem value="Partnership Deed">Partnership Deed</SelectItem>
                      <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
                      <SelectItem value="Service Agreement">Service Agreement</SelectItem>
                      <SelectItem value="Sale Agreement">Sale Agreement</SelectItem>
                      <SelectItem value="Legal Notice">Legal Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parties">Parties Involved *</Label>
                  <Input
                    id="parties"
                    placeholder="e.g., Company XYZ and Employee John Doe"
                    value={parties}
                    onChange={(e) => setParties(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Brief description of the agreement's purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Any specific clauses or requirements"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? "Generating..." : "Generate Document"}
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Document</CardTitle>
                <CardDescription>Your AI-generated legal document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {generatedDocument ? (
                    <pre className="text-sm whitespace-pre-wrap font-sans">{generatedDocument}</pre>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Your generated document will appear here
                    </p>
                  )}
                </ScrollArea>

                {generatedDocument && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => copyToClipboard(generatedDocument)}>
                        <Copy className="mr-2 w-4 h-4" />
                        Copy
                      </Button>
                      <Button variant="outline" onClick={handleExportPDF}>
                        <FileDown className="mr-2 w-4 h-4" />
                        PDF
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="email">Send via Email</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          placeholder="recipient@example.com"
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                        />
                        <Button onClick={handleSendEmail} disabled={isSendingEmail}>
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => useTemplate(template)} className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No document history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.document_type}</CardTitle>
                          <CardDescription>
                            {new Date(item.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreFromHistory(item)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteFromHistory(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Check</CardTitle>
                <CardDescription>Validate against Indian laws and precedents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleCheckCompliance}
                  disabled={isCheckingCompliance || !generatedDocument}
                  className="w-full"
                >
                  {isCheckingCompliance ? "Checking..." : "Run Compliance Check"}
                  <Shield className="ml-2 w-4 h-4" />
                </Button>

                {complianceAnalysis && (
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <pre className="text-sm whitespace-pre-wrap">{complianceAnalysis}</pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Clause Suggestions</CardTitle>
                <CardDescription>AI-powered clause recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGetSuggestions}
                  disabled={isLoadingSuggestions || !documentType}
                  className="w-full"
                >
                  {isLoadingSuggestions ? "Loading..." : "Get Suggestions"}
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>

                {clauseSuggestions && (
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <pre className="text-sm whitespace-pre-wrap">{clauseSuggestions}</pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Document Comparison</CardTitle>
              <CardDescription>Compare two documents side-by-side</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentComparison />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentGenerator;

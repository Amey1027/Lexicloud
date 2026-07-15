import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GitCompare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DocumentComparison = () => {
  const { toast } = useToast();
  const [doc1, setDoc1] = useState("");
  const [doc2, setDoc2] = useState("");
  const [differences, setDifferences] = useState<string[]>([]);

  const compareDocuments = () => {
    if (!doc1 || !doc2) {
      toast({
        title: "Please provide both documents",
        variant: "destructive",
      });
      return;
    }

    // Simple word-by-word comparison
    const words1 = doc1.split(/\s+/);
    const words2 = doc2.split(/\s+/);
    const diffs: string[] = [];

    if (words1.length !== words2.length) {
      diffs.push(`Document lengths differ: ${words1.length} vs ${words2.length} words`);
    }

    const maxLen = Math.max(words1.length, words2.length);
    for (let i = 0; i < maxLen; i++) {
      if (words1[i] !== words2[i]) {
        diffs.push(
          `Position ${i + 1}: "${words1[i] || '(missing)'}" ≠ "${words2[i] || '(missing)'}"`
        );
      }
    }

    if (diffs.length === 0) {
      diffs.push("Documents are identical");
    }

    setDifferences(diffs);
    toast({
      title: "Comparison complete",
      description: `Found ${diffs.length === 1 && diffs[0] === "Documents are identical" ? "no" : diffs.length} difference(s)`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doc1">Document 1</Label>
          <Textarea
            id="doc1"
            placeholder="Paste first document here..."
            value={doc1}
            onChange={(e) => setDoc1(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc2">Document 2</Label>
          <Textarea
            id="doc2"
            placeholder="Paste second document here..."
            value={doc2}
            onChange={(e) => setDoc2(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
      </div>

      <Button onClick={compareDocuments} className="w-full" size="lg">
        <GitCompare className="mr-2 w-4 h-4" />
        Compare Documents
      </Button>

      {differences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Differences Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {differences.map((diff, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted rounded-md text-sm font-mono"
                >
                  {diff}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentComparison;

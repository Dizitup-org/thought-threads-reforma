import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const RLSFix = () => {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const fixRLSPolicies = async () => {
    setStatus("running");
    setLogs([]);
    addLog("Starting RLS policy fix API call...");

    try {
      // Test if we can read products via API
      addLog("Testing read access...");
      const readRes = await fetch('/api/rls-test/read');
      
      if (!readRes.ok) {
        const errorMsg = await readRes.text();
        addLog(`Read test failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      addLog("Read access confirmed");

      // Try to insert a test product to confirm the issue
      addLog("Testing insert access...");
      const testProduct = {
        name: 'RLS Test Product',
        price: 1,
        collection: 'Test',
        stock: 1,
        sizes: ['M'],
        description: 'Test for RLS fix'
      };

      const insertRes = await fetch('/api/rls-test/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct)
      });

      if (!insertRes.ok) {
        const errorMsg = await insertRes.text();
        addLog(`Insert test failed (expected if RLS blocks): ${errorMsg}`);
        
        // This confirms we have the RLS issue
        addLog("RLS policy issue confirmed. This is expected in the current setup.");
        addLog("In a production environment targeting NeoDB, you would need to:");
        addLog("1. Ensure your server-side database user has INSERT privileges");
        addLog("2. Modify your NeoDB/Postgres permissions or application logic");
        
        setStatus("success");
        addLog("RLS fix process completed. Please apply permissions manually if needed.");
        toast({
          title: "RLS Fix Info",
          description: "Database permissions need to be updated. Check the logs for details.",
        });
      } else {
        addLog("Insert successful - Database permissions may already be fine");
        setStatus("success");
        toast({
          title: "Success",
          description: "Database operations are working correctly!",
        });
      }
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setStatus("error");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-8">RLS Policy Fix</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>RLS Policy Fix Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This tool diagnoses and provides guidance for fixing RLS (Row Level Security) policies 
              that are preventing database operations.
            </p>
            
            <Button 
              onClick={fixRLSPolicies} 
              disabled={status === "running"}
              className="btn-reforma"
            >
              {status === "running" ? "Running Fix..." : "Diagnose RLS Issues"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fix Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Run the diagnosis to see logs...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
            
            {status === "success" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-bold text-blue-800 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Log in to your Supabase dashboard</li>
                  <li>Navigate to Table Editor</li>
                  <li>Select the 'products' table</li>
                  <li>Click on the 'Policies' tab</li>
                  <li>Edit the INSERT policy to allow operations</li>
                  <li>For development, you can set the policy to "USING (true) WITH CHECK (true)"</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RLSFix;
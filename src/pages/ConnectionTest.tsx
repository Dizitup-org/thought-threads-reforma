import { useState, useEffect } from "react";
import { supabase, getAdminClient } from "@/integrations/supabase/client";

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...");
  const [adminConnectionStatus, setAdminConnectionStatus] = useState<string>("Checking...");
  
  useEffect(() => {
    // Test regular connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .limit(1);
        
        if (error) {
          setConnectionStatus(`Error: ${error.message}`);
        } else {
          setConnectionStatus("Connected successfully with regular client");
        }
      } catch (error: any) {
        setConnectionStatus(`Exception: ${error.message}`);
      }
    };
    
    // Test admin connection
    const testAdminConnection = async () => {
      try {
        const adminClient = getAdminClient();
        if (adminClient) {
          const { data, error } = await adminClient
            .from('products')
            .select('id')
            .limit(1);
          
          if (error) {
            setAdminConnectionStatus(`Error: ${error.message}`);
          } else {
            setAdminConnectionStatus("Connected successfully with admin client");
          }
        } else {
          setAdminConnectionStatus("Admin client not available");
        }
      } catch (error: any) {
        setAdminConnectionStatus(`Exception: ${error.message}`);
      }
    };
    
    testConnection();
    testAdminConnection();
  }, []);
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-2">Connection Test</h1>
          <p className="text-muted-foreground">Testing Supabase connections</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Regular Client Connection</h2>
            <p className={connectionStatus.includes("successfully") ? "text-green-600" : "text-red-600"}>
              {connectionStatus}
            </p>
          </div>
          
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Client Connection</h2>
            <p className={adminConnectionStatus.includes("successfully") ? "text-green-600" : "text-red-600"}>
              {adminConnectionStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
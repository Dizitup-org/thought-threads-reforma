import { useState, useEffect } from "react";

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...");
  const [adminConnectionStatus, setAdminConnectionStatus] = useState<string>("Checking...");
  
  useEffect(() => {
    // Test regular connection
    const testConnection = async () => {
      try {
        const response = await fetch('/api/connection-test/regular');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setConnectionStatus("Connected successfully with API");
      } catch (error: any) {
        setConnectionStatus(`Exception: ${error.message}`);
      }
    };
    
    // Test admin connection
    const testAdminConnection = async () => {
      try {
        const response = await fetch('/api/connection-test/admin');
        if (!response.ok) {
          if (response.status === 404 || response.status === 401 || response.status === 403) {
            setAdminConnectionStatus("Admin API endpoint not available or unauthorized");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          setAdminConnectionStatus("Connected successfully with Admin API");
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
          <p className="text-muted-foreground">Testing Backend & Database API connections</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Regular API Connection</h2>
            <p className={connectionStatus.includes("successfully") ? "text-green-600" : "text-red-600"}>
              {connectionStatus}
            </p>
          </div>
          
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Admin API Connection</h2>
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
import { useState } from "react";
import { supabase, getAdminClient } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const StorageTest = () => {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const testStorageUpload = async () => {
    setIsUploading(true);
    setUploadStatus("Uploading test file...");
    
    try {
      // Create a simple test file
      const testContent = "This is a test file for storage upload";
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], "test-file.txt", { type: 'text/plain' });
      
      // Generate unique file name
      const fileName = `test-${Date.now()}.txt`;
      const filePath = `test/${fileName}`;
      
      // Try to upload file using admin client for full permissions
      const adminClient = getAdminClient();
      const { data: uploadData, error: uploadError } = adminClient
        ? await adminClient.storage.from('images').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        : await supabase.storage.from('images').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        setUploadStatus(`Upload failed: ${uploadError.message}`);
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      setUploadStatus(`Upload successful! File path: ${uploadData.path}`);
      
      // Get public URL
      const { data: { publicUrl } } = adminClient
        ? adminClient.storage.from('images').getPublicUrl(filePath)
        : supabase.storage.from('images').getPublicUrl(filePath);
      
      setUploadStatus(`Upload successful! Public URL: ${publicUrl}`);
      
      toast({
        title: "Upload successful",
        description: "Test file uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-2">Storage Test</h1>
          <p className="text-muted-foreground">Testing Supabase storage functionality</p>
        </div>
        
        <div className="border border-border rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Storage Upload Test</h2>
          
          <div className="mb-6">
            <p className="mb-4">This test will upload a small text file to the 'images' bucket using the admin client.</p>
            <Button 
              onClick={testStorageUpload} 
              disabled={isUploading}
              className="btn-reforma"
            >
              {isUploading ? "Uploading..." : "Test Storage Upload"}
            </Button>
          </div>
          
          {uploadStatus && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Upload Status:</h3>
              <p className={uploadStatus.includes("successful") ? "text-green-600" : "text-red-600"}>
                {uploadStatus}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageTest;
import { useState } from "react";
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
      
      // Try to upload file using simple fetch pointing to a backend endpoint
      const formData = new FormData();
      formData.append('file', file, fileName);
      formData.append('path', filePath);
      
      const response = await fetch(`${API_BASE_URL}/api/storage/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Upload failed';
        console.error('Upload error:', errorMessage);
        setUploadStatus(`Upload failed: ${errorMessage}`);
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const uploadData = await response.json();
      
      setUploadStatus(`Upload successful! File path: ${uploadData.path}`);
      
      const publicUrl = uploadData.publicUrl || `/api/storage/${filePath}`;
      
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
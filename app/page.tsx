"use client";

import { useState } from "react";

export default function TestHarness() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Waiting for upload...");
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTestWorkflow = async () => {
    if (!file) {
      alert("Please select an invoice first!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Phase 1: Upload the file to your backend
      setStatus("Uploading to Supabase Storage...");
      const formData = new FormData();
      formData.append("file", file);

      // NOTE: This assumes Yuvaraj has built this endpoint!
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url;

      // Phase 2: Trigger the Agentic AI Workflow
      setStatus("Processing via LangGraph Agents...");
      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!processRes.ok) throw new Error("AI Processing failed");
      const processData = await processRes.json();

      // Phase 3: Display Results
      setStatus("Workflow Complete!");
      setResult(processData);

    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">COMPLIANCEPILOT.ai Test Harness</h1>
          <p className="text-gray-500">Upload an invoice to test the backend extraction and LangGraph workflow.</p>
        </div>

        {/* Control Panel */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <input 
            type="file" 
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />
          <button 
            onClick={handleTestWorkflow}
            disabled={loading || !file}
            className="w-full py-2 px-4 bg-black text-white rounded-md font-medium disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Running Agents..." : "Run Autonomous Workflow"}
          </button>
        </div>

        {/* Status & Output */}
        <div className="space-y-2">
          <div className="font-medium">Status: <span className="text-blue-600">{status}</span></div>
          
          <div className="p-4 bg-gray-900 rounded-xl overflow-auto h-96">
            <pre className="text-sm text-green-400 font-mono">
              {result ? JSON.stringify(result, null, 2) : "// AI Output will appear here as structured JSON"}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
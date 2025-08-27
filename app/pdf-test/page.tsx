"use client";

import { PDFExportButton } from '@/components/pdf-export-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PDFTestPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">PDF Export Test Page</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          This page tests the PDF export functionality with debugging enabled.
          Check the browser console for detailed logs.
        </p>
        
        <div className="space-y-2 text-sm">
          <p><strong>Expected Debug Elements:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Red border around each page</li>
            <li>Yellow debug box in top-right corner</li>
            <li>Blue borders around image placeholders</li>
            <li>Console logs showing image data and positioning</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">PDF Export Controls</h2>
        <div className="space-y-4">
          <PDFExportButton />
          
          <div className="text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Click "Export PDFs" to generate both internal pages and cover</li>
              <li>Check the browser console for debug logs</li>
              <li>Open the generated PDF and look for debug elements</li>
              <li>Share the console logs if there are issues</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}

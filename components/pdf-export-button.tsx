"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, BookOpen, Settings, Loader2 } from 'lucide-react';
import { 
  exportBothPDFs, 
  exportInternalPages, 
  exportCover, 
  downloadBothPDFs,
  downloadPDF,
  type CombinedExportOptions,
  type BookLayout 
} from '@/lib/pdf';
import { useLayout } from '@/contexts/LayoutContext';

interface PDFExportButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PDFExportButton({ 
  className, 
  variant = 'default', 
  size = 'default' 
}: PDFExportButtonProps) {
  const { layout } = useLayout();
  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [exportOptions, setExportOptions] = useState<CombinedExportOptions>({
    layout: layout!,
    quality: 'medium',
    includePageNumbers: true,
    includeSpineText: true,
    spineTextColor: '#000000',
    spineFontSize: 12,
  });

  const handleExport = async () => {
    if (!layout) {
      alert('No book layout available for export');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportBothPDFs({
        ...exportOptions,
        layout,
      });

      if (result.success && result.internalPagesPdf && result.coverPdf) {
        downloadBothPDFs(result.internalPagesPdf, result.coverPdf, 'story');
        console.log('PDFs exported successfully:', {
          internalPageCount: result.internalPageCount,
          coverSpineWidth: result.coverSpineWidth,
          coverTotalWidth: result.coverTotalWidth,
        });
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportInternalPagesOnly = async () => {
    if (!layout) {
      alert('No book layout available for export');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportInternalPages({
        layout,
        quality: exportOptions.quality,
        includePageNumbers: exportOptions.includePageNumbers,
        watermark: exportOptions.watermark,
      });

      if (result.success && result.pdfBlob) {
        downloadPDF(result.pdfBlob, 'story-internal-pages.pdf');
        console.log('Internal pages exported successfully:', {
          pageCount: result.pageCount,
        });
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCoverOnly = async () => {
    if (!layout) {
      alert('No book layout available for export');
      return;
    }

    setIsExporting(true);
    try {
      const interiorPageCount = 1 + (layout.spreads.length * 2) + 1;
      const result = await exportCover({
        layout,
        interiorPageCount,
        quality: exportOptions.quality,
        includeSpineText: exportOptions.includeSpineText,
        spineTextColor: exportOptions.spineTextColor,
        spineFontSize: exportOptions.spineFontSize,
      });

      if (result.success && result.pdfBlob) {
        downloadPDF(result.pdfBlob, 'story-cover.pdf');
        console.log('Cover exported successfully:', {
          spineWidth: result.spineWidth,
          totalWidth: result.totalWidth,
        });
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOptions = (updates: Partial<CombinedExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  if (!layout) {
    return (
      <Button disabled variant={variant} size={size} className={className}>
        <FileText className="w-4 h-4 mr-2" />
        No Book to Export
      </Button>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant={variant}
          size={size}
          className={className}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export PDFs'}
        </Button>
        
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          size={size}
          disabled={isExporting}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {showSettings && (
        <Card className="absolute top-full mt-2 p-4 w-80 z-50 bg-white shadow-lg border">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Quality</Label>
              <Select
                value={exportOptions.quality}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  updateExportOptions({ quality: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Fast)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pageNumbers"
                checked={exportOptions.includePageNumbers}
                onCheckedChange={(checked) => 
                  updateExportOptions({ includePageNumbers: !!checked })
                }
              />
              <Label htmlFor="pageNumbers" className="text-sm">
                Include page numbers
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="spineText"
                checked={exportOptions.includeSpineText}
                onCheckedChange={(checked) => 
                  updateExportOptions({ includeSpineText: !!checked })
                }
              />
              <Label htmlFor="spineText" className="text-sm">
                Include spine text
              </Label>
            </div>

            {exportOptions.includeSpineText && (
              <div>
                <Label className="text-sm font-medium">Spine font size</Label>
                <Slider
                  value={[exportOptions.spineFontSize || 12]}
                  onValueChange={([value]) => 
                    updateExportOptions({ spineFontSize: value })
                  }
                  min={8}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">
                  {exportOptions.spineFontSize}pt
                </span>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={handleExportInternalPagesOnly}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Internal Only
                </Button>
                <Button
                  onClick={handleExportCoverOnly}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Cover Only
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

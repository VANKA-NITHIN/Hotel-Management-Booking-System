import { useState } from 'react';
import toast from 'react-hot-toast';

interface ExportOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  filenamePrefix?: string;
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = async (
    apiCall: () => Promise<any>,
    format: 'pdf' | 'csv',
    options: ExportOptions = {}
  ) => {
    try {
      setIsExporting(true);
      const response = await apiCall();
      
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = url;
      
      // Determine filename from content-disposition header if available, else fallback
      let filename = `${options.filenamePrefix || 'Export'}_${new Date().getTime()}.${format}`;
      const contentDisposition = response.headers?.['content-disposition'];
      if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (options.onSuccess) options.onSuccess();
      toast.success(`${format.toUpperCase()} export completed successfully.`);
    } catch (error) {
      console.error('Export failed:', error);
      if (options.onError) options.onError(error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, downloadFile };
}

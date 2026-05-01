// src/components/PDFPreview.jsx
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { API_URL } from '../config/api';

// ✅ Local worker — no CDN, no CSP issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PDFPreview({ noteId, token }) {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!noteId || !token) return;
    let cancelled = false;

    setLoading(true);
    setError('');
    setPdfDoc(null);
    setCurrentPage(1);

    fetch(`${API_URL}/api/notes/${noteId}/preview-url`, {
      headers: { 'x-auth-token': token },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.arrayBuffer(); // ✅ raw bytes, not JSON
      })
      .then(buffer => {
        if (cancelled) return;
        return pdfjsLib.getDocument({ data: buffer }).promise;
      })
      .then(pdf => {
        if (cancelled || !pdf) return;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('PDF load error:', err);
        setError('Could not load preview');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [noteId, token]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    pdfDoc.getPage(currentPage).then(page => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: ctx, viewport });
    });

    return () => { cancelled = true; };
  }, [pdfDoc, currentPage]);

  if (loading) return (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      <span className="ml-2 text-gray-500">Loading preview...</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <p className="text-gray-500 italic">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full overflow-auto border rounded-lg bg-gray-100 flex justify-center p-2">
        <canvas ref={canvasRef} className="max-w-full shadow-sm" />
      </div>
      {totalPages > 1 && (
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
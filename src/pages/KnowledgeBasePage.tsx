import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  File,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { api } from '../api';
import { KnowledgeDocument, DocumentChunk } from '../types';

export const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Chunks Inspector Modal
  const [activeDocForChunks, setActiveDocForChunks] = useState<KnowledgeDocument | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  // Search filter
  const [search, setSearch] = useState('');

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch knowledge base documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds the 10 MB maximum limit.');
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle.trim()) {
      setUploadError('Please specify a title and select a file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await api.uploadDocument(selectedFile, uploadTitle.trim());
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadTitle('');
      await loadDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete document "${title}" and all its vector chunks?`)) return;
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleViewChunks = async (doc: KnowledgeDocument) => {
    setActiveDocForChunks(doc);
    setIsLoadingChunks(true);
    try {
      const data = await api.getDocumentChunks(doc.id);
      setChunks(data);
    } catch (err: any) {
      alert('Failed to load chunks: ' + err.message);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return doc.title.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q);
  });

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Knowledge Base & RAG Index</h2>
          <p className="text-xs text-slate-400">
            Upload product manuals, API references, or support policies to ground AI Copilot responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDocuments}
            className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-400 hover:text-white transition"
            title="Refresh documents"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-glow-sm transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={loadDocuments} className="underline text-white font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Search and Stats bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search indexed knowledge documents..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-4 flex-shrink-0">
          <span>
            Total Documents: <strong className="text-white">{documents.length}</strong>
          </span>
          <span>
            Total Chunks:{' '}
            <strong className="text-brand-400">
              {documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* Documents List */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-card">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading knowledge documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BookOpen}
              title="No documents uploaded yet"
              description="Upload documentation (.txt, .md, .pdf) so ResolveAI can ground answers in your data."
              actionText="Upload First Document"
              onAction={() => setIsUploadModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/60 border-b border-navy-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-navy-850/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent-violet flex-shrink-0" />
                        <span className="font-semibold text-white">{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {doc.fileName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatBytes(doc.fileSize)}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono text-[11px] font-semibold">
                        <Layers className="w-3 h-3" />
                        {doc.chunkCount} chunks
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          doc.status === 'INDEXED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : doc.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === 'INDEXED' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewChunks(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                          title="View Vector Chunks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Knowledge Document"
        subtitle="Supported formats: .txt, .md, .pdf (Max 10 MB)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Display Title
            </label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. API Integration Guide v2.4"
              className="w-full px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">File</label>
            <div className="border-2 border-dashed border-navy-700 hover:border-brand-500/50 rounded-xl p-6 text-center transition cursor-pointer bg-navy-850/50">
              <input
                type="file"
                accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                <p className="text-xs text-white font-semibold">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Plaintext, Markdown, or PDF text up to 10 MB
                </p>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-sm transition flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing & Chunking...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Ingest & Index Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vector Chunks Inspector Modal */}
      <Modal
        isOpen={Boolean(activeDocForChunks)}
        onClose={() => setActiveDocForChunks(null)}
        title={`Vector Chunks: ${activeDocForChunks?.title || ''}`}
        subtitle={`Total chunks indexed: ${chunks.length}`}
        maxWidth="xl"
      >
        {isLoadingChunks ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <span className="inline-block w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading document chunks...</p>
          </div>
        ) : chunks.length === 0 ? (
          <p className="py-8 text-center text-slate-500 text-xs">
            No chunks found for this document.
          </p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span className="text-brand-300 font-semibold">
                    Chunk #{chunk.chunkIndex + 1}
                  </span>
                  <span>ID: {chunk.id.slice(0, 8)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  {chunk.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

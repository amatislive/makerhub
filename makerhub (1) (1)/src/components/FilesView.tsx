import React, { useState, useRef } from 'react';
import {
  FolderArchive,
  Upload,
  Trash2,
  Download,
  File,
  FileText,
  FileCode,
  Image as ImageIcon,
  HardDrive
} from 'lucide-react';
import { FileRecord, Project } from '../types';
import { EmptyState } from './EmptyState';

interface FilesViewProps {
  files: FileRecord[];
  projects: Project[];
  onUploadFile: (file: { name: string; size: number; type: string; dataUrl: string; projectId?: string }) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  projects,
  onUploadFile,
  onDeleteFile,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (fileObj: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onUploadFile({
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type || 'application/octet-stream',
        dataUrl: e.target?.result as string,
        projectId: selectedProjectId || undefined,
      });
    };
    reader.readAsDataURL(fileObj);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return ImageIcon;
    if (type.includes('text') || type.includes('pdf')) return FileText;
    if (type.includes('json') || type.includes('code') || type.includes('javascript')) return FileCode;
    return File;
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Files & Documents
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Store hardware schematics, PCB Gerber archives, 3D STL files, and datasheets.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Assign Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-700"
            >
              <option value="">General Workshop</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
          dragOver ? 'border-[#fe5029] bg-[#fe5029]/5' : 'border-neutral-200 hover:border-neutral-300 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-500">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-neutral-800">
          Click or drag & drop files here to upload
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">
          Supports datasheets, CAD files, STL models, firmware binaries, and schematics
        </p>
      </div>

      {files.length === 0 ? (
        <EmptyState
          icon={FolderArchive}
          title="No files yet."
          description="Add documentation, project resources, STL models, or supported attachments to keep everything organized."
          accentColor="neutral"
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 font-semibold uppercase text-[10px]">
                <th className="p-3">File Name</th>
                <th className="p-3">Project</th>
                <th className="p-3">Size</th>
                <th className="p-3">Uploaded</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.type);
                const proj = projects.find((p) => p.id === file.projectId);
                return (
                  <tr key={file.id} className="hover:bg-neutral-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-neutral-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-600">{proj?.name || 'General Workshop'}</td>
                    <td className="p-3 text-neutral-500">{(file.size / 1024).toFixed(1)} KB</td>
                    <td className="p-3 text-neutral-400">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {file.dataUrl && (
                          <a
                            href={file.dataUrl}
                            download={file.name}
                            className="p-1 text-neutral-400 hover:text-neutral-900"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteFile(file.id)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

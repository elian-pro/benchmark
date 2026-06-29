
import React, { useCallback } from 'react';
import { FileData } from '../types';

interface FileUploaderProps {
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];

      selectedFiles.forEach(file => {
        if (file.type !== 'application/pdf') {
          alert(`El archivo ${file.name} no es un PDF.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setFiles(prev => [...prev, {
            name: file.name,
            base64,
            type: file.type
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  }, [setFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium text-text uppercase tracking-[0.2em] font-mono">Documentos de Referencia (PDF)</label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-line-strong rounded-input cursor-pointer bg-surface-2 hover:border-accent transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-muted" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-muted font-normal">Click para subir o arrastra aquí</p>
            <p className="text-[10px] text-muted uppercase font-medium tracking-wider font-mono">Solo archivos PDF</p>
          </div>
          <input type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
        </label>
      </div>

      {files.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-surface border border-line rounded-control shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <svg className="w-5 h-5 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 18h12V6h-4V2H4v16zm4-11h4v2H8V7zm0 4h4v2H8v-2zm0 4h4v2H8v-2z" />
                </svg>
                <span className="text-sm font-normal text-text truncate">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                aria-label={`Quitar ${file.name}`}
                className="text-muted hover:text-text transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;

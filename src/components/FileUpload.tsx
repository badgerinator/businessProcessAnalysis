import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { validateQuestionnaire, calculateHash } from '../utils/validators';
import useStore from '../store';


interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addQuestionnaire = useStore((state) => state.addQuestionnaire);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      const { valid, errors } = validateQuestionnaire(json);
      
      if (!valid) {
        console.error('Doğrulama hataları:', errors);
        setError('Geçersiz soru formatı. Lütfen JSON yapısını kontrol edin.');
        return;
      }
      
      const hash = calculateHash(json);
      
      const questionnaire = {
        json,
        name: json.analysis_name || 'İsimsiz Soru Seti',
        version: json.version || '1.0',
        createdAt: new Date().toISOString(),
        hash,
      };
      
      addQuestionnaire(questionnaire);
      
      setError(null);
      onUploadSuccess();
      
    } catch (err) {
      console.error('Dosya işleme hatası:', err);
      setError('JSON dosyası ayrıştırılamadı. Lütfen geçerli bir JSON olduğundan emin olun.');
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="mt-6">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
            : 'border-gray-300 dark:border-gray-700'
        } transition-colors duration-200`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold">Soru seti yükle</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          JSON dosyanızı sürükleyip bırakın veya seçmek için tıklayın
        </p>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleButtonClick}
            className="mx-auto"
          >
            Dosya Seç
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
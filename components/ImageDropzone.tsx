
import React, { useCallback, FC, DragEvent } from 'react';
import { UploadIcon } from './icons/UploadIcon';

export interface ImageFile {
  file: File;
  preview: string;
}

interface ImageDropzoneProps {
  id: string;
  image: ImageFile | null;
  onFileChange: (file: File) => void;
  title: string;
  description: string;
}

export const ImageDropzone: FC<ImageDropzoneProps> = ({ id, image, onFileChange, title, description }) => {
  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      onFileChange(files[0]);
    }
  };
  
  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [onFileChange]);
  
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-80 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors relative overflow-hidden`}
      >
        {image ? (
          <img src={image.preview} alt="Preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Drop or click to upload</span></p>
            <p className="text-xs text-gray-500">{title}</p>
          </div>
        )}
        <input id={id} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} />
      </label>
      {image && (
        <div className="mt-2 text-xs text-gray-400 truncate">
          {image.file.name} ({(image.file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
       {!image && <div className="mt-2 text-xs text-gray-400">{description}</div>}
    </div>
  );
};

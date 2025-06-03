import React, { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

interface ExhibitUploadProps {
  selectedExhibits: File[];
  setSelectedExhibits: (files: File[]) => void;
  setValue: (name: any, value: any, options?: any) => void;
  errors: any;
  handleRemoveFile: (fileName: string) => void;
}

const ExhibitUpload: React.FC<ExhibitUploadProps> = ({ selectedExhibits, setSelectedExhibits, setValue, errors, handleRemoveFile }) => {
  const onDrop = (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    const combinedFiles = [...selectedExhibits, ...pdfFiles];
    const limitedFiles = combinedFiles.slice(0, 50);
    setSelectedExhibits(limitedFiles);
    setValue('exhibitFiles', limitedFiles, { shouldValidate: true });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    maxFiles: 50,
  });

  // Helper to generate previews for accepted files
  const filePreviews = useMemo(() => selectedExhibits.slice(0, 10).map(file => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    let previewUrl = '';
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      isImage,
      isPDF,
    };
  }), [selectedExhibits]);

  return (
    <section className="form-section">
      <h2 className="form-section-title">Exhibit & File Upload</h2>
      <div className="form-group">
        <div className="flex items-center justify-center w-full">
          <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#f0f0f0] dark:bg-[#f0f0f0] hover:bg-gray-100 dark:hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
            <input {...getInputProps()} id="dropzone-file" className="hidden" />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF only (up to 50 files)</p>
            </div>
          </div>
        </div>
        {/* Accepted Files Preview */}
        {selectedExhibits.length > 0 && (
          <div className="mt-6 border rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">Accepted Files</h3>
            <hr className="mb-4" />
            <div className="flex flex-wrap gap-6">
              {filePreviews.map((file, idx) => (
                <div key={file.name} className="relative flex flex-col items-center w-32">
                  <div className="w-28 h-28 flex items-center justify-center bg-gray-100 border rounded-lg overflow-hidden">
                    {file.isImage ? (
                      <img src={file.previewUrl} alt={file.name} className="object-contain w-full h-full" />
                    ) : file.isPDF ? (
                      <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <span className="mt-2 text-xs text-gray-700 text-center break-all w-full">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {errors.exhibitFiles && (
          <p className="form-error">{errors.exhibitFiles.message?.toString() || 'Invalid file(s)'} </p>
        )}
      </div>
    </section>
  );
};

export default ExhibitUpload; 
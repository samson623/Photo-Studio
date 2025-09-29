import React, { useState, useCallback, useEffect } from 'react';
import { PLATFORM_SPECS, getPostTypes, getAspectRatioForPlatform, isFormatSupported } from '../data/platformSpecs';

interface SocialMediaUploadProps {
  mediaFile?: File | Blob | null;
  mediaUrl?: string;
  mediaType: 'image' | 'video';
  onPlatformSelect?: (platform: string, postType: string, aspectRatio: string) => void;
  onUpload?: (platform: string, postType: string, file: File | Blob) => Promise<void>;
  generationMode?: boolean; // If true, shows platform selection for generation
}

const SocialMediaUpload: React.FC<SocialMediaUploadProps> = ({
  mediaFile,
  mediaUrl,
  mediaType,
  onPlatformSelect,
  onUpload,
  generationMode = false
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedPostType, setSelectedPostType] = useState<string>('');
  const [availablePostTypes, setAvailablePostTypes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update preview URL when media changes
  useEffect(() => {
    if (mediaFile && mediaFile instanceof File) {
      const url = URL.createObjectURL(mediaFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (mediaUrl) {
      setPreviewUrl(mediaUrl);
    }
  }, [mediaFile, mediaUrl]);

  // Update available post types when platform changes
  useEffect(() => {
    if (selectedPlatform) {
      const postTypes = getPostTypes(selectedPlatform, mediaType);
      setAvailablePostTypes(postTypes);
      if (postTypes.length > 0 && !selectedPostType) {
        setSelectedPostType(postTypes[0].id);
      }
    }
  }, [selectedPlatform, mediaType, selectedPostType]);

  // Handle platform selection
  const handlePlatformSelect = useCallback((platform: string) => {
    setSelectedPlatform(platform);
    const postTypes = getPostTypes(platform, mediaType);
    if (postTypes.length > 0) {
      const defaultPostType = postTypes[0];
      setSelectedPostType(defaultPostType.id);
      
      if (generationMode && onPlatformSelect) {
        const aspectRatio = getAspectRatioForPlatform(platform, mediaType, defaultPostType.id);
        onPlatformSelect(platform, defaultPostType.id, aspectRatio);
      }
    }
  }, [mediaType, generationMode, onPlatformSelect]);

  // Handle post type selection
  const handlePostTypeSelect = useCallback((postType: string) => {
    setSelectedPostType(postType);
    if (generationMode && onPlatformSelect && selectedPlatform) {
      const aspectRatio = getAspectRatioForPlatform(selectedPlatform, mediaType, postType);
      onPlatformSelect(selectedPlatform, postType, aspectRatio);
    }
  }, [generationMode, onPlatformSelect, selectedPlatform, mediaType]);

  // Toggle platform for multi-upload
  const togglePlatform = (platform: string) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
    } else {
      newSelected.add(platform);
    }
    setSelectedPlatforms(newSelected);
  };

  // Handle upload to selected platforms
  const handleUpload = async () => {
    if (!mediaFile || selectedPlatforms.size === 0) return;

    setUploading(true);
    const results: { [key: string]: string } = {};

    for (const platform of selectedPlatforms) {
      try {
        results[platform] = 'Uploading...';
        setUploadStatus({ ...results });

        if (onUpload) {
          const postTypes = getPostTypes(platform, mediaType);
          const postType = postTypes[0]?.id || 'feed';
          await onUpload(platform, postType, mediaFile);
          results[platform] = '✅ Uploaded';
        } else {
          // Simulate upload
          await new Promise(resolve => setTimeout(resolve, 1500));
          results[platform] = '✅ Uploaded';
        }
      } catch (error) {
        results[platform] = '❌ Failed';
      }
      setUploadStatus({ ...results });
    }

    setUploading(false);
  };

  // Render platform selection for generation mode
  const renderGenerationMode = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-3">Select Target Platform</h3>
      
      {/* Platform Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(PLATFORM_SPECS).map(([key, spec]) => (
          <button
            key={key}
            onClick={() => handlePlatformSelect(key)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPlatform === key
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="text-2xl mb-1">{spec.icon}</div>
            <div className="text-sm font-medium text-white">{spec.name}</div>
          </button>
        ))}
      </div>

      {/* Post Type Selection */}
      {selectedPlatform && availablePostTypes.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Select Post Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availablePostTypes.map((postType) => (
              <button
                key={postType.id}
                onClick={() => handlePostTypeSelect(postType.id)}
                className={`p-3 rounded-md text-left transition-all ${
                  selectedPostType === postType.id
                    ? 'bg-blue-500/30 border border-blue-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="text-sm font-medium text-white">{postType.label}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {postType.width} × {postType.height} ({postType.aspectRatio})
                  {postType.maxDuration && (
                    <span className="ml-2">• Max {postType.maxDuration}s</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Platform Requirements */}
      {selectedPlatform && (
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Platform Requirements</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Max {mediaType} size: {PLATFORM_SPECS[selectedPlatform].requirements.maxFileSize[mediaType]} MB</div>
            <div>• Supported formats: {PLATFORM_SPECS[selectedPlatform].supportedFormats[mediaType].join(', ')}</div>
            {mediaType === 'video' && PLATFORM_SPECS[selectedPlatform].requirements.minDuration && (
              <div>• Duration: {PLATFORM_SPECS[selectedPlatform].requirements.minDuration}s - {PLATFORM_SPECS[selectedPlatform].requirements.maxDuration}s</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render upload mode
  const renderUploadMode = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-3">Upload to Social Media</h3>
      
      {/* Preview */}
      {previewUrl && (
        <div className="mb-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-900/50 p-4">
            {mediaType === 'image' ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <video src={previewUrl} controls className="max-h-64 mx-auto rounded" />
            )}
          </div>
        </div>
      )}

      {/* Platform Multi-Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Select Platforms to Upload</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(PLATFORM_SPECS).map(([key, spec]) => {
            const fileFormat = mediaFile?.name?.split('.').pop()?.toLowerCase() || '';
            const isSupported = !mediaFile || isFormatSupported(key, mediaType, fileFormat);
            
            return (
              <button
                key={key}
                onClick={() => isSupported && togglePlatform(key)}
                disabled={!isSupported}
                className={`p-4 rounded-lg border-2 transition-all relative ${
                  selectedPlatforms.has(key)
                    ? 'border-green-500 bg-green-500/20'
                    : isSupported
                    ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    : 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                }`}
              >
                {selectedPlatforms.has(key) && (
                  <div className="absolute top-2 right-2 text-green-400">✓</div>
                )}
                <div className="text-2xl mb-1">{spec.icon}</div>
                <div className="text-sm font-medium text-white">{spec.name}</div>
                {uploadStatus[key] && (
                  <div className="text-xs mt-1">{uploadStatus[key]}</div>
                )}
                {!isSupported && (
                  <div className="text-xs text-red-400 mt-1">Format not supported</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Platforms Info */}
      {selectedPlatforms.size > 0 && (
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Selected Platforms ({selectedPlatforms.size})
          </h4>
          <div className="space-y-2">
            {Array.from(selectedPlatforms).map(platform => {
              const spec = PLATFORM_SPECS[platform];
              const postTypes = getPostTypes(platform, mediaType);
              const defaultType = postTypes[0];
              
              return (
                <div key={platform} className="text-xs text-gray-400 flex items-center justify-between">
                  <span>{spec.icon} {spec.name}</span>
                  {defaultType && (
                    <span>{defaultType.label} • {defaultType.aspectRatio}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedPlatforms.size > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading || !mediaFile}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            uploading || !mediaFile
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {uploading ? 'Uploading...' : `Upload to ${selectedPlatforms.size} Platform${selectedPlatforms.size > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900/50 rounded-xl p-6">
      {generationMode ? renderGenerationMode() : renderUploadMode()}
    </div>
  );
};

export default SocialMediaUpload;
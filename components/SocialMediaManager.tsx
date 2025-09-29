import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GalleryItem } from '../types';
import { getBlob } from '../services/dbService';
import SocialMediaUpload from './SocialMediaUpload';
import { PLATFORM_SPECS } from '../data/platformSpecs';

const SocialMediaManager: React.FC = () => {
  const { user } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedItemBlob, setSelectedItemBlob] = useState<Blob | null>(null);
  const [selectedItemUrl, setSelectedItemUrl] = useState<string>('');
  const [uploadHistory, setUploadHistory] = useState<Array<{
    platform: string;
    postType: string;
    timestamp: Date;
    itemId: number;
    status: 'success' | 'failed';
  }>>([]);

  // Load gallery items from user
  useEffect(() => {
    if (user?.gallery) {
      setGalleryItems(user.gallery);
    }
  }, [user]);

  // Load selected item blob
  useEffect(() => {
    const loadItemBlob = async () => {
      if (selectedItem) {
        try {
          const blob = await getBlob(selectedItem.blobId);
          setSelectedItemBlob(blob);
          const url = URL.createObjectURL(blob);
          setSelectedItemUrl(url);
        } catch (error) {
          console.error('Failed to load item blob:', error);
          setSelectedItemUrl('');
        }
      } else {
        setSelectedItemUrl('');
        setSelectedItemBlob(null);
      }
    };
    loadItemBlob();

    // Cleanup URL on change
    return () => {
      if (selectedItemUrl) {
        URL.revokeObjectURL(selectedItemUrl);
      }
    };
  }, [selectedItem]);

  const handleUpload = async (platform: string, postType: string, file: File | Blob) => {
    // Simulate upload to platform
    // In a real implementation, this would connect to platform APIs
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate for demo
        if (success) {
          setUploadHistory(prev => [...prev, {
            platform,
            postType,
            timestamp: new Date(),
            itemId: selectedItem?.id || 0,
            status: 'success'
          }]);
          resolve();
        } else {
          setUploadHistory(prev => [...prev, {
            platform,
            postType,
            timestamp: new Date(),
            itemId: selectedItem?.id || 0,
            status: 'failed'
          }]);
          reject(new Error('Upload failed'));
        }
      }, 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Social Media Manager</h2>
        <p className="text-gray-400 mt-2">
          Manage and distribute your generated content across multiple social media platforms with optimized dimensions and formats.
        </p>
      </div>

      {/* Platform Overview */}
      <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Supported Platforms</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(PLATFORM_SPECS).map(([key, spec]) => (
            <div key={key} className="text-center">
              <div className="text-3xl mb-2">{spec.icon}</div>
              <div className="text-xs text-gray-300">{spec.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Your Gallery</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {galleryItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No items in gallery yet. Generate some content first!</p>
              ) : (
                galleryItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedItem?.id === item.id
                        ? 'bg-blue-600/30 border border-blue-500'
                        : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.type === 'image' ? '🖼️' : '🎬'} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {item.prompt.substring(0, 50)}...
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Upload History */}
          <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Upload History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadHistory.length === 0 ? (
                <p className="text-gray-400 text-sm">No uploads yet</p>
              ) : (
                uploadHistory.slice().reverse().map((record, idx) => (
                  <div key={idx} className="p-2 bg-gray-800/50 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className={record.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {record.status === 'success' ? '✅' : '❌'} {PLATFORM_SPECS[record.platform]?.name}
                      </span>
                      <span className="text-gray-500">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-400 mt-1">
                      {record.postType} • Item #{record.itemId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upload Interface */}
        <div className="lg:col-span-2 space-y-4">
          {selectedItem ? (
            <>
              {/* Preview */}
              <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Selected Content</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  {selectedItem.type === 'image' && selectedItemUrl && (
                    <img src={selectedItemUrl} alt="Selected" className="max-h-64 mx-auto rounded" />
                  )}
                  {selectedItem.type === 'video' && selectedItemUrl && (
                    <video src={selectedItemUrl} controls className="max-h-64 mx-auto rounded" />
                  )}
                  <div className="mt-4 p-3 bg-gray-800/50 rounded">
                    <p className="text-sm text-gray-300 font-medium">Prompt:</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedItem.prompt}</p>
                    {selectedItem.narrationScript && (
                      <>
                        <p className="text-sm text-gray-300 font-medium mt-3">Narration:</p>
                        <p className="text-xs text-gray-400 mt-1">{selectedItem.narrationScript}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Controls */}
              <SocialMediaUpload
                mediaFile={selectedItemBlob}
                mediaUrl={selectedItemUrl}
                mediaType={selectedItem.type}
                onUpload={handleUpload}
                generationMode={false}
              />
            </>
          ) : (
            <div className="bg-[#111832] p-6 rounded-lg border border-gray-700 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-400">Select an item from your gallery to upload</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Guidelines */}
      <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-300 mb-2">📷 Instagram</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Square (1:1) for feed posts</li>
              <li>• Portrait (9:16) for stories/reels</li>
              <li>• Max 90s for reels, 60s for stories</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-red-300 mb-2">📺 YouTube</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Landscape (16:9) for videos</li>
              <li>• Portrait (9:16) for Shorts</li>
              <li>• Max 60s for Shorts</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-300 mb-2">🎵 TikTok</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Portrait (9:16) for all videos</li>
              <li>• 3s minimum, 10min maximum</li>
              <li>• Optimize for mobile viewing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaManager;
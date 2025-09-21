import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GalleryItem } from '../types';
import { getBlob } from '../services/dbService';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { VideoIcon } from './icons/VideoIcon';
import NarratedVideoPlayer from './NarratedVideoPlayer';

interface GalleryItemWithUrl extends GalleryItem {
  url: string;
}

interface GalleryProps {
    onUseForVideo: (imageFile: File) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onUseForVideo }) => {
  const { user, removeFromGallery } = useAuth();
  const [items, setItems] = useState<GalleryItemWithUrl[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      if (!user?.gallery || user.gallery.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const itemsWithUrls = await Promise.all(
          user.gallery.map(async (item) => {
            const blob = await getBlob(item.blobId);
            const url = URL.createObjectURL(blob);
            return { ...item, url };
          })
        );
        if (isMounted) {
          setItems(itemsWithUrls.sort((a, b) => b.id - a.id)); // Sort by most recent
        }
      } catch (error) {
          console.error("Failed to load gallery items", error);
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
      items.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [user?.gallery]);

  const handleDelete = async (itemId: number) => {
    // Optimistically update UI
    setItems(prev => prev.filter(item => item.id !== itemId));
    await removeFromGallery(itemId);
  };

  const handleDownload = (item: GalleryItemWithUrl) => {
    const link = document.createElement('a');
    link.href = item.url;
    const extension = item.type === 'image' ? 'png' : 'mp4';
    link.download = `${item.type}-${item.id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadScript = (item: GalleryItemWithUrl) => {
    if (!item.narrationScript) return;
    const blob = new Blob([item.narrationScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `narration-script-${item.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUseForVideo = async (item: GalleryItemWithUrl) => {
    const response = await fetch(item.url);
    const blob = await response.blob();
    const file = new File([blob], `gallery-image-${item.id}.png`, { type: blob.type });
    onUseForVideo(file);
  };

  if (loading) {
      return <div>Loading gallery...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">My Gallery</h2>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-[#111832] rounded-lg border border-gray-700 overflow-hidden group relative">
              <div className="aspect-square w-full bg-gray-900">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                ) : (
                  <NarratedVideoPlayer src={item.url} script={item.narrationScript || ''} />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-2 truncate" title={item.prompt}>
                  <span className="font-bold">Prompt:</span> {item.prompt}
                </p>
                <div className="flex flex-wrap gap-2">
                   <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-800/50 hover:bg-red-700/50 rounded-md transition-colors"><TrashIcon className="w-4 h-4 text-red-300"/></button>
                   <button onClick={() => handleDownload(item)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"><DownloadIcon className="w-4 h-4 text-gray-200"/></button>
                   {item.type === 'image' && (
                       <button onClick={() => handleUseForVideo(item)} className="p-2 bg-indigo-800/50 hover:bg-indigo-700/50 rounded-md transition-colors"><VideoIcon className="w-4 h-4 text-indigo-300"/></button>
                   )}
                   {item.type === 'video' && item.narrationScript && (
                       <button onClick={() => handleDownloadScript(item)} title="Download narration script" className="p-2 bg-green-800/50 hover:bg-green-700/50 rounded-md transition-colors text-green-300 text-xs font-bold">TXT</button>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#111832] rounded-lg border-2 border-dashed border-gray-700">
          <h3 className="text-xl font-semibold text-white">Your Gallery is Empty</h3>
          <p className="text-gray-400 mt-2">Generate images or videos and save them to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
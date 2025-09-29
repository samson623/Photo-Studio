
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, calculateVideoCost, PRICING } from '../services/falService';
import { ImageDropzone, ImageFile } from './ImageDropzone';
import { DownloadIcon } from './icons/DownloadIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useAuth } from '../context/AuthContext';
import { PLANS } from '../data/plans';
import NarratedVideoPlayer from './NarratedVideoPlayer';
import SocialMediaUpload from './SocialMediaUpload';

interface GenerateVideoProps {
  initialImage: File | null;
  clearInitialImage: () => void;
}

type VideoModel = 'hailuo' | 'framepack';

const GenerateVideo: React.FC<GenerateVideoProps> = ({ initialImage, clearInitialImage }) => {
    const { user, incrementVideoUsage, addToGallery } = useAuth();
    const [prompt, setPrompt] = useState<string>('');
    const [narrationScript, setNarrationScript] = useState<string>('');
    const [image, setImage] = useState<ImageFile | null>(null);
    const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [videoModel, setVideoModel] = useState<VideoModel>('hailuo');
    const [duration] = useState<number>(6); // Hailuo: 6s, Framepack: 5s
    const [showSocialUpload, setShowSocialUpload] = useState<boolean>(false);
    const [outputVideoBlob, setOutputVideoBlob] = useState<Blob | null>(null);
    const [targetPlatform, setTargetPlatform] = useState<string>('');
    const [targetPostType, setTargetPostType] = useState<string>('');

    useEffect(() => {
        if (initialImage) {
            const newFile = new File([initialImage], initialImage.name, { type: initialImage.type });
            setImage({ 
                file: newFile, 
                preview: URL.createObjectURL(newFile) 
            });
            clearInitialImage();
        }
    }, [initialImage, clearInitialImage]);


    const handleFileChange = (file: File) => {
        setImage({ file, preview: URL.createObjectURL(file) });
        setIsSaved(false);
    };

    const handlePlatformSelect = (platform: string, postType: string, aspectRatio: string) => {
        setTargetPlatform(platform);
        setTargetPostType(postType);
        // For video, we could adjust model or parameters based on platform
        // For now, we'll just track the selection
    };

    const handleClear = () => {
        setPrompt('');
        setNarrationScript('');
        setShowSocialUpload(false);
        setImage(null);
        setOutputVideoUrl(null);
        setError(null);
        setIsLoading(false);
        setProgressMessage('');
        setIsSaved(false);
    };

    const handleGenerate = async () => {
        const videoDuration = videoModel === 'hailuo' ? 6 : 5;
        const userPlan = PLANS[user!.plan];
        
        if(user!.videoSecondsUsed + videoDuration > userPlan.videoSecondsIncluded) {
            setError(`Generating another video would exceed your quota of ${userPlan.videoSecondsIncluded} seconds for the '${user!.plan}' plan. Please upgrade.`);
            return;
        }

        if (!prompt) {
            setError("A text prompt is required to generate a video.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setOutputVideoUrl(null);
        setIsSaved(false);

        try {
            const url = await generateVideo(prompt, image?.file || null, setProgressMessage, videoModel);
            setOutputVideoUrl(url);
            
            // Fetch and store the video blob for potential upload
            const response = await fetch(url);
            const blob = await response.blob();
            setOutputVideoBlob(blob);
            
            incrementVideoUsage(videoDuration);
        } catch (err) {
            let errorMessage = "An unknown error occurred during video generation.";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };
    
    const copyPromptToNarration = () => {
        setNarrationScript(prompt);
    };

    const handleDownload = () => {
        if (!outputVideoUrl) return;
        const link = document.createElement('a');
        link.href = outputVideoUrl;
        link.download = `generated-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadScript = () => {
        if (!narrationScript) return;
        const blob = new Blob([narrationScript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `narration-script-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveToGallery = async () => {
        if (!outputVideoUrl || !prompt) return;
        try {
            const response = await fetch(outputVideoUrl);
            const blob = await response.blob();
            await addToGallery({ type: 'video', prompt, narrationScript, blob });
            setIsSaved(true);
        } catch (error) {
            setError("Failed to save video to gallery.");
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white">Video Generation Studio</h2>
            <p className="text-gray-400 mt-2 mb-8">Create stunning video clips using AI models from Fal.ai. Choose between Hailuo-02 Pro for premium quality or Framepack for cost-effective generation.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left/Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                         <h3 className="text-lg font-semibold text-white mb-4">Model Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">Video Model</label>
                                <select 
                                    value={videoModel} 
                                    onChange={(e) => setVideoModel(e.target.value as VideoModel)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="hailuo">Hailuo-02 Pro - Premium Quality ($0.08/sec)</option>
                                    <option value="framepack">Framepack - Cost Effective (~$0.033/sec)</option>
                                </select>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded">
                                <p className="mb-1"><strong>Hailuo-02 Pro:</strong> 6-second 1080p videos with superior quality and motion</p>
                                <p><strong>Framepack:</strong> 5-second videos optimized for speed and cost efficiency</p>
                            </div>
                        </div>
                    </div>

                    {/* Platform Selection for Pre-Generation */}
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Target Platform (Optional)</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Select a social media platform to optimize your video for that platform's requirements.
                        </p>
                        <SocialMediaUpload
                            mediaType="video"
                            generationMode={true}
                            onPlatformSelect={handlePlatformSelect}
                        />
                        {targetPlatform && (
                            <div className="mt-3 p-3 bg-blue-900/30 rounded-lg">
                                <p className="text-xs text-blue-300">
                                    Video will be optimized for {targetPlatform} - {targetPostType}.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <label htmlFor="prompt" className="text-lg font-semibold text-white block">PROMPT</label>
                        <p className="text-sm text-gray-400 mb-2">Describe the video you want to create.</p>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => { setPrompt(e.target.value); setIsSaved(false); }}
                            rows={4}
                            placeholder="Example: A majestic lion roaring on a rocky outcrop at sunset."
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                            <label htmlFor="narration" className="text-lg font-semibold text-white block">NARRATION SCRIPT (OPTIONAL)</label>
                            <button onClick={copyPromptToNarration} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors">Use prompt as script</button>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Write a script here to have it read aloud during in-browser playback.</p>
                        <textarea
                            id="narration"
                            value={narrationScript}
                            onChange={(e) => { setNarrationScript(e.target.value); setIsSaved(false); }}
                            rows={4}
                            placeholder="Example: Here we see the king of the savannah, in all his glory."
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-yellow-400 mt-2">
                            Note: The narration audio plays in your browser only and is NOT included in the downloaded video file.
                        </p>
                    </div>

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Start Image (Optional)</h3>
                        <div className="flex gap-4">
                            <ImageDropzone id="file1" image={image} onFileChange={handleFileChange} title="Initial Image" description="Provide a starting frame for the video." />
                        </div>
                    </div>

                    <div className="flex justify-end items-center">
                        <div className="flex gap-2">
                             <button onClick={handleClear} className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors">Clear</button>
                            <button onClick={handleGenerate} disabled={isLoading || !prompt} className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700 min-h-[400px] flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4">Output</h3>
                        <div className="flex-grow flex flex-col items-center justify-center bg-gray-900/50 rounded-md border-2 border-dashed border-gray-700 p-2">
                           {isLoading && (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                                <p className="text-gray-400 font-medium">{progressMessage}</p>
                                <p className="text-xs text-gray-500 mt-2">Please keep this tab open.</p>
                            </div>
                           )}
                           {error && <div className="text-red-400 p-4 text-center">{error}</div>}
                           {outputVideoUrl && (
                               <div className="w-full flex flex-col items-center gap-4">
                                   <NarratedVideoPlayer src={outputVideoUrl} script={narrationScript} />
                                    <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                                       <button onClick={handleSaveToGallery} disabled={isSaved} className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors flex items-center justify-center disabled:bg-green-800 disabled:cursor-not-allowed">
                                           <SaveIcon className="w-5 h-5 mr-2" />
                                           {isSaved ? 'Saved' : 'Save'}
                                       </button>
                                       <button onClick={handleDownload} className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors flex items-center justify-center">
                                           <DownloadIcon className="w-5 h-5 mr-2" />
                                           Download Video
                                       </button>
                                       <button onClick={handleDownloadScript} disabled={!narrationScript} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:bg-indigo-800 disabled:cursor-not-allowed">
                                           <DownloadIcon className="w-5 h-5 mr-2" />
                                           Download Script
                                       </button>
                                       <button 
                                         onClick={() => setShowSocialUpload(!showSocialUpload)} 
                                         className="px-4 py-2 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors flex items-center justify-center"
                                       >
                                         📱 Social Upload
                                       </button>
                                   </div>
                                   <p className="text-xs text-gray-400 mt-2 text-center">
                                     Heads up! The narration audio plays in your browser only. Use the downloaded script with a video editor to add it to your video permanently.
                                   </p>
                               </div>
                           )}
                           {!isLoading && !error && !outputVideoUrl && <div className="text-gray-500 text-center p-4">Your generated video will appear here.</div>}
                        </div>
                    </div>
                    
                    {/* Social Media Upload Section */}
                    {showSocialUpload && outputVideoBlob && (
                        <SocialMediaUpload
                            mediaFile={outputVideoBlob}
                            mediaUrl={outputVideoUrl || undefined}
                            mediaType="video"
                            generationMode={false}
                        />
                    )}
                    
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">1</span> Choose your video model and describe the scene.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">2</span> Optionally add a script for narration.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">3</span> Optionally, upload a starting image.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">4</span> Press Generate and wait for processing.</li>
                        </ul>
                        <div className="bg-blue-900/40 border border-blue-800/60 p-3 rounded-md mt-4">
                            <p className="text-xs text-blue-300">Powered by Fal.ai's advanced video generation models.</p>
                        </div>
                    </div>
                    
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Cost Estimator</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Model</span><span>{videoModel === 'hailuo' ? 'Hailuo-02 Pro' : 'Framepack'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Duration</span><span>{videoModel === 'hailuo' ? '6' : '5'} seconds</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Rate per second</span><span>${PRICING.video[videoModel]}</span></div>
                            <hr className="border-gray-700 my-2"/>
                            <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-200">Est. cost:</span>
                                <span className="text-green-400">
                                    ${calculateVideoCost(videoModel === 'hailuo' ? 6 : 5, videoModel).toFixed(3)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateVideo;
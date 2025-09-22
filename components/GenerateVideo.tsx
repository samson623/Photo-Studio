import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import { ImageDropzone, ImageFile } from './ImageDropzone';
import { DownloadIcon } from './icons/DownloadIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useAuth } from '../context/AuthContext';
import { PLANS } from '../data/plans';
import NarratedVideoPlayer from './NarratedVideoPlayer';

interface GenerateVideoProps {
  initialImage: File | null;
  clearInitialImage: () => void;
}

const VIDEO_GENERATION_COST_SECONDS = 5; // Assume each video generation costs 5s of quota

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

    const handleClear = () => {
        setPrompt('');
        setNarrationScript('');
        setImage(null);
        setOutputVideoUrl(null);
        setError(null);
        setIsLoading(false);
        setProgressMessage('');
        setIsSaved(false);
    };

    const handleGenerate = async () => {
        const userPlan = PLANS[user!.plan];
        if(user!.videoSecondsUsed + VIDEO_GENERATION_COST_SECONDS > userPlan.videoSecondsIncluded) {
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
            const url = await generateVideo(prompt, image?.file || null, setProgressMessage);
            setOutputVideoUrl(url);
            incrementVideoUsage(VIDEO_GENERATION_COST_SECONDS);
        } catch (err) {
            let errorMessage = "An unknown error occurred during video generation.";
            if (err instanceof Error) {
                if (err.message.includes('quota exceeded') || err.message.includes('RESOURCE_EXHAUSTED')) {
                    errorMessage = "Your API usage has exceeded the lifetime quota for this model. Please check your API key's quota settings in your Google Cloud project or Google AI Studio.";
                } else {
                    errorMessage = err.message;
                }
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
            <h2 className="text-3xl font-bold text-white">Video Generation</h2>
            <p className="text-gray-400 mt-2 mb-8">Create short video clips from a text prompt and an optional starting image. You can also add a narration script to be read aloud during playback.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left/Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                         <h3 className="text-lg font-semibold text-white mb-4">Model Configuration</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Model</label>
                            <select disabled className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed">
                                <option>veo-2.0-generate-001</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-2">
                                Note: For video generation, we use the powerful <strong>veo-2.0-generate-001</strong> model.
                            </p>
                        </div>
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
                                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                       <button onClick={handleSaveToGallery} disabled={isSaved} className="w-full px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors flex items-center justify-center disabled:bg-green-800 disabled:cursor-not-allowed">
                                           <SaveIcon className="w-5 h-5 mr-2" />
                                           {isSaved ? 'Saved' : 'Save'}
                                       </button>
                                       <button onClick={handleDownload} className="w-full px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors flex items-center justify-center">
                                           <DownloadIcon className="w-5 h-5 mr-2" />
                                           Download Video
                                       </button>
                                       <button onClick={handleDownloadScript} disabled={!narrationScript} className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:bg-indigo-800 disabled:cursor-not-allowed">
                                           <DownloadIcon className="w-5 h-5 mr-2" />
                                           Download Script
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
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">1</span> Describe the video scene in the prompt.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">2</span> Optionally add a script for narration.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">3</span> Optionally, upload a starting image.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">4</span> Press Generate. The process can take several minutes.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateVideo;
import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import { ImageDropzone, ImageFile } from './ImageDropzone';
import { DownloadIcon } from './icons/DownloadIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useAuth } from '../context/AuthContext';
import { PLANS } from '../data/plans';

const suggestionPrompts = [
  "Remove people", "phone -> banana", "Side angle", "Studio Ghibli style", "Colorize B&W", "Isometric"
];

interface GenerateImageProps {
  onUseForVideo: (imageFile: File) => void;
}

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
};

const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const blob = await dataUrlToBlob(dataUrl);
    return new File([blob], filename, { type: blob.type });
};

const GenerateImage: React.FC<GenerateImageProps> = ({ onUseForVideo }) => {
    const { user, incrementImageUsage, addToGallery } = useAuth();
    const [prompt, setPrompt] = useState<string>('');
    const [image1, setImage1] = useState<ImageFile | null>(null);
    const [image2, setImage2] = useState<ImageFile | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [higherDetail, setHigherDetail] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const handleFileChange = (imageNumber: 1 | 2) => (file: File) => {
        const setter = imageNumber === 1 ? setImage1 : setImage2;
        setter({ file, preview: URL.createObjectURL(file) });
        setIsSaved(false);
    };

    const handleSwap = () => {
        const temp = image1;
        setImage1(image2);
        setImage2(temp);
    };

    const handleClear = () => {
        setPrompt('');
        setImage1(null);
        setImage2(null);
        setOutputImage(null);
        setError(null);
        setHigherDetail(false);
        setIsSaved(false);
    };
    
    const handleGenerate = async () => {
        const userPlan = PLANS[user!.plan];
        if(user!.imagesUsed >= userPlan.imagesIncluded) {
            setError(`You have used all ${userPlan.imagesIncluded} images for your '${user!.plan}' plan. Please upgrade your plan.`);
            return;
        }

        if (!prompt || !image1) {
            setError("Prompt and at least one image are required.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutputImage(null);
        setIsSaved(false);

        try {
            const result = await editImage(prompt, image1.file, image2?.file);
            setOutputImage(result);
            incrementImageUsage();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!outputImage) return;
        const link = document.createElement('a');
        link.href = outputImage;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUseForVideo = async () => {
        if (!outputImage) return;
        const imageFile = await dataUrlToFile(outputImage, `generated-image-${Date.now()}.png`);
        onUseForVideo(imageFile);
    };

    const handleSaveToGallery = async () => {
        if (!outputImage || !prompt) return;
        try {
            const blob = await dataUrlToBlob(outputImage);
            await addToGallery({ type: 'image', prompt, blob });
            setIsSaved(true);
        } catch (error) {
            setError("Failed to save image to gallery.");
            console.error(error);
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-white">GEMINI 2.5 FLASH IMAGE PLAYGROUND (SINGLE FILE)</h2>
            <p className="text-gray-400 mt-2 mb-8">Describe the change you want, upload images, and preview the generated image. This is a client-only playground.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left/Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Model Configuration</h3>
                            </div>
                             <span className="text-xs font-mono bg-green-900 text-green-300 px-2 py-1 rounded">Model ready</span>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Model</label>
                            <select disabled className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed">
                                <option>gemini-2.5-flash-image-preview</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-2">This model is also known as 'nano-banana' and is specialized for image editing tasks.</p>
                        </div>
                    </div>

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <label htmlFor="prompt" className="text-lg font-semibold text-white block">PROMPT</label>
                        <p className="text-sm text-gray-400 mb-2">Tip: describe what to add, remove, or change.</p>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => { setPrompt(e.target.value); setIsSaved(false); }}
                            rows={4}
                            placeholder="Example: Replace the phone in the person hand with a banana. Keep lighting consistent."
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-2 mt-4 items-center">
                            {suggestionPrompts.map(p => (
                                <button key={p} onClick={() => setPrompt(prev => `${prev} ${p}.`)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors">{p}</button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                         <div className="flex justify-between items-center mb-4 relative">
                            <h3 className="text-lg font-semibold text-white">Image 1</h3>
                             <button onClick={handleSwap} className="text-sm text-blue-400 hover:text-blue-300 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-full px-3 py-1 z-10">Swap 1 ↔ 2</button>
                            <h3 className="text-lg font-semibold text-white">Image 2 (style or reference)</h3>
                        </div>
                        <div className="flex gap-4">
                            <ImageDropzone id="file1" image={image1} onFileChange={handleFileChange(1)} title="Image 1" description="Required for edit" />
                            <ImageDropzone id="file2" image={image2} onFileChange={handleFileChange(2)} title="Image 2" description="Optional" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                             <input id="higher-detail" type="checkbox" checked={higherDetail} onChange={(e) => setHigherDetail(e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"/>
                             <label htmlFor="higher-detail" className="ms-2 text-sm font-medium text-gray-300">Request higher detail (may cost more)</label>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleClear} className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors">Clear</button>
                            <button onClick={handleGenerate} disabled={isLoading || !image1} className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
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
                           {isLoading && <div className="text-gray-400">Generating image...</div>}
                           {error && <div className="text-red-400 p-4 text-center">{error}</div>}
                           {outputImage && (
                            <div className="w-full flex flex-col items-center gap-4">
                               <img src={outputImage} alt="Generated output" className="max-w-full max-h-full object-contain rounded-md" />
                               <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                   <button onClick={handleSaveToGallery} disabled={isSaved} className="flex-1 px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors flex items-center justify-center disabled:bg-green-800 disabled:cursor-not-allowed">
                                     <SaveIcon className="w-5 h-5 mr-2" />
                                     {isSaved ? 'Saved' : 'Save'}
                                   </button>
                                   <button onClick={handleDownload} className="flex-1 px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors flex items-center justify-center">
                                     <DownloadIcon className="w-5 h-5 mr-2" />
                                     Download
                                   </button>
                                   <button onClick={handleUseForVideo} className="flex-1 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center">
                                      <VideoIcon className="w-5 h-5 mr-2" />
                                     Use for Video
                                   </button>
                               </div>
                            </div>
                           )}
                           {!isLoading && !error && !outputImage && <div className="text-gray-500 text-center p-4">Your results will display after you generate.</div>}
                        </div>
                    </div>

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">1</span> Describe the edit. Optionally drop a source image and style reference.</li>
                            <li className="flex items-start"><span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">2</span> Press Generate. The app will call generateContent with text plus any inline images.</li>
                        </ul>
                         <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-yellow-300 text-xs">
                           Troubleshooting: enable CORS for localhost or proxy through your backend.
                        </div>
                        <a href="https://ai.google.dev/docs/gemini_api_overview#image_generation" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-4 block">Docs: Gemini image generation and editing.</a>
                    </div>
                    
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Cost Estimator</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Width (px)</span><span>1024</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Height (px)</span><span>1024</span></div>
                            <hr className="border-gray-700"/>
                            <div className="flex justify-between"><span className="text-gray-400">Megapixels billed (ceil)</span><span>2 MP</span></div>
                            <div className="flex justify-between font-bold text-lg"><span className="text-gray-200">Estimated cost:</span><span className="text-green-400">$0.0060</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateImage;
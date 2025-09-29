
import React, { useState } from 'react';
import { generateImage, editImage, calculateImageCost, PRICING } from '../services/falService';
import { DownloadIcon } from './icons/DownloadIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useAuth } from '../context/AuthContext';
import { PLANS } from '../data/plans';
import { ImageDropzone, ImageFile } from './ImageDropzone';
import SocialMediaUpload from './SocialMediaUpload';
import { getAspectRatioForPlatform } from '../data/platformSpecs';

const suggestionChips = ["Remove people", "phone -> banana", "Side angle", "Studio Ghibli style", "Colorize B&W", "Isometric"];

type FluxModel = 'schnell' | 'dev';
type ImageSize = 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';

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

// Map aspect ratios to Flux image sizes
const aspectRatioToImageSize = (aspectRatio: string): ImageSize => {
    const ratioMap: { [key: string]: ImageSize } = {
        '1:1': 'square_hd',
        '4:3': 'portrait_4_3',
        '3:4': 'landscape_4_3',
        '16:9': 'landscape_16_9',
        '9:16': 'portrait_16_9',
        '1.91:1': 'landscape_16_9', // Close to 16:9
        '3:1': 'landscape_16_9', // Use 16:9 as closest
        '4:1': 'landscape_16_9', // Use 16:9 as closest
    };
    return ratioMap[aspectRatio] || 'square_hd';
};

const GenerateImage: React.FC<GenerateImageProps> = ({ onUseForVideo }) => {
    const { user, incrementImageUsage, addToGallery } = useAuth();
    const [prompt, setPrompt] = useState<string>('');
    const [image1, setImage1] = useState<ImageFile | null>(null);
    const [model, setModel] = useState<FluxModel>('schnell');
    const [imageSize, setImageSize] = useState<ImageSize>('square_hd');
    const [strength, setStrength] = useState<number>(0.8);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [outputImageBlob, setOutputImageBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [mode, setMode] = useState<'generate' | 'edit'>('generate');
    const [showSocialUpload, setShowSocialUpload] = useState<boolean>(false);
    const [targetPlatform, setTargetPlatform] = useState<string>('');
    const [targetPostType, setTargetPostType] = useState<string>('');

    const handleClear = () => {
        setPrompt('');
        setImage1(null);
        setOutputImage(null);
        setOutputImageBlob(null);
        setError(null);
        setIsSaved(false);
        setShowSocialUpload(false);
    };

    const handlePlatformSelect = (platform: string, postType: string, aspectRatio: string) => {
        setTargetPlatform(platform);
        setTargetPostType(postType);
        const newImageSize = aspectRatioToImageSize(aspectRatio);
        setImageSize(newImageSize);
    };

    const handleFileChange1 = (file: File) => {
        setImage1({ file, preview: URL.createObjectURL(file) });
        setIsSaved(false);
    };

    const handleModeChange = (newMode: 'generate' | 'edit') => {
        setMode(newMode);
        setError(null);
        setIsSaved(false);
    };
    
    const handleSubmit = async () => {
        const userPlan = PLANS[user!.plan];
        if(user!.imagesUsed >= userPlan.imagesIncluded) {
            setError(`You have used all ${userPlan.imagesIncluded} images for your '${user!.plan}' plan. Please upgrade your plan.`);
            return;
        }

        if (!prompt) {
            setError("A text prompt is required.");
            return;
        }

        if (mode === 'edit' && !image1) {
            setError("An input image is required for editing mode.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputImage(null);
        setIsSaved(false);

        try {
            let result: string;
            if (mode === 'generate') {
                result = await generateImage(prompt, model, imageSize);
            } else {
                result = await editImage(prompt, image1!.file, strength, model);
            }
            setOutputImage(result);
            
            // Store the blob for potential upload
            const blob = await dataUrlToBlob(result);
            setOutputImageBlob(blob);
            
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
        link.download = `edited-image-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUseForVideo = async () => {
        if (!outputImage) return;
        const imageFile = await dataUrlToFile(outputImage, `edited-image-${Date.now()}.jpeg`);
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
            <h2 className="text-3xl font-bold text-white uppercase">FLUX.1 IMAGE STUDIO</h2>
            <p className="text-gray-400 mt-2 mb-8">Generate stunning images or edit existing ones using FLUX.1 AI models powered by Fal.ai</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left/Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Model Configuration</h3>
                            </div>
                             <span className="text-xs font-mono bg-green-900 text-green-300 px-2 py-1 rounded">Fal.ai Ready</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">Mode</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleModeChange('generate')}
                                        className={`px-3 py-1 rounded text-sm ${mode === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                    >
                                        Generate New
                                    </button>
                                    <button
                                        onClick={() => handleModeChange('edit')}
                                        className={`px-3 py-1 rounded text-sm ${mode === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                    >
                                        Edit Image
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">FLUX Model</label>
                                <select 
                                    value={model} 
                                    onChange={(e) => setModel(e.target.value as FluxModel)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="schnell">FLUX.1 [schnell] - Fast & Cheap ($0.003/MP)</option>
                                    <option value="dev">FLUX.1 [dev] - High Quality ($0.025/MP)</option>
                                </select>
                            </div>
                            
                            {mode === 'generate' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-2">Image Size</label>
                                    <select 
                                        value={imageSize} 
                                        onChange={(e) => setImageSize(e.target.value as ImageSize)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="square_hd">Square HD (1024x1024)</option>
                                        <option value="square">Square (512x512)</option>
                                        <option value="portrait_4_3">Portrait 4:3</option>
                                        <option value="portrait_16_9">Portrait 16:9</option>
                                        <option value="landscape_4_3">Landscape 4:3</option>
                                        <option value="landscape_16_9">Landscape 16:9</option>
                                    </select>
                                </div>
                            )}
                            
                            {mode === 'edit' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-2">Edit Strength: {strength}</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={strength}
                                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Minimal change (0.1)</span>
                                        <span>Complete change (1.0)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platform Selection for Pre-Generation */}
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Target Platform (Optional)</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Select a social media platform to automatically optimize dimensions for that platform.
                        </p>
                        <SocialMediaUpload
                            mediaType="image"
                            generationMode={true}
                            onPlatformSelect={handlePlatformSelect}
                        />
                        {targetPlatform && (
                            <div className="mt-3 p-3 bg-blue-900/30 rounded-lg">
                                <p className="text-xs text-blue-300">
                                    Image will be generated with {imageSize} dimensions optimized for {targetPlatform}.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <label htmlFor="prompt" className="text-lg font-semibold text-white block">PROMPT</label>
                        <p className="text-sm text-gray-400 mb-2">
                            {mode === 'generate' 
                                ? "Describe the image you want to create in detail."
                                : "Describe what changes you want to make to the uploaded image."
                            }
                        </p>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => { setPrompt(e.target.value); setIsSaved(false); }}
                            rows={3}
                            placeholder={mode === 'generate' 
                                ? "Example: A majestic lion sitting on a throne in a golden palace, cinematic lighting, photorealistic"
                                : "Example: Replace the phone in the person's hand with a banana. Keep lighting consistent."
                            }
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-2 mt-4 items-center">
                            {suggestionChips.map(p => (
                                <button key={p} onClick={() => setPrompt(current => current ? `${current}, ${p}`: p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors">{p}</button>
                            ))}
                        </div>
                    </div>

                    {mode === 'edit' && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Source Image</h3>
                            <ImageDropzone 
                                id="edit-image-1" 
                                image={image1} 
                                onFileChange={handleFileChange1} 
                                title="Drop or click to upload" 
                                description="Source image to edit" 
                            />
                            <p className="text-xs text-gray-400 mt-1">Upload the image you want to edit</p>
                        </div>
                    )}
                    



                    <div className="flex justify-end">
                        <div className="flex gap-2">
                             <button onClick={handleClear} className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors">Clear</button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading || !prompt || (mode === 'edit' && !image1)} 
                                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (mode === 'generate' ? 'Generating...' : 'Editing...') : (mode === 'generate' ? 'Generate Image' : 'Edit Image')}
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
                               <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                                   <button onClick={handleSaveToGallery} disabled={isSaved} className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors flex items-center justify-center disabled:bg-green-800 disabled:cursor-not-allowed">
                                     <SaveIcon className="w-5 h-5 mr-2" />
                                     {isSaved ? 'Saved' : 'Save'}
                                   </button>
                                   <button onClick={handleDownload} className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors flex items-center justify-center">
                                     <DownloadIcon className="w-5 h-5 mr-2" />
                                     Download
                                   </button>
                                   <button onClick={handleUseForVideo} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center">
                                      <VideoIcon className="w-5 h-5 mr-2" />
                                     Use for Video
                                   </button>
                                   <button 
                                     onClick={() => setShowSocialUpload(!showSocialUpload)} 
                                     className="px-4 py-2 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors flex items-center justify-center"
                                   >
                                     📱 Social Upload
                                   </button>
                               </div>
                            </div>
                           )}
                           {!isLoading && !error && !outputImage && <div className="text-gray-500 text-center p-4">Your results will display after you generate.</div>}
                        </div>
                    </div>

                    {/* Social Media Upload Section */}
                    {showSocialUpload && outputImageBlob && (
                        <SocialMediaUpload
                            mediaFile={outputImageBlob}
                            mediaUrl={outputImage || undefined}
                            mediaType="image"
                            generationMode={false}
                        />
                    )}

                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start">
                                <span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">1</span> 
                                Choose between generating new images or editing existing ones.
                            </li>
                            <li className="flex items-start">
                                <span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">2</span> 
                                Select your FLUX model: schnell for speed or dev for quality.
                            </li>
                            <li className="flex items-start">
                                <span className="bg-gray-700 text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 shrink-0">3</span> 
                                Write a detailed prompt and click Generate/Edit.
                            </li>
                        </ul>
                        <div className="bg-blue-900/40 border border-blue-800/60 p-3 rounded-md mt-4">
                            <p className="text-xs text-blue-300">Powered by Fal.ai's FLUX.1 models for state-of-the-art image generation.</p>
                        </div>
                        <a href="https://fal.ai/models/fal-ai/flux/schnell" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-4 block">Docs: FLUX.1 models on Fal.ai</a>
                    </div>
                    
                    <div className="bg-[#111832] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Cost Estimator</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Model</span><span>FLUX.1 [{model}]</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Size</span><span>{imageSize}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Rate per MP</span><span>${PRICING.image[model]}</span></div>
                            <hr className="border-gray-700 my-2"/>
                            <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-200">Est. cost:</span>
                                <span className="text-green-400">
                                    ${mode === 'generate' 
                                        ? (imageSize === 'square_hd' ? (1024*1024/1000000 * PRICING.image[model]).toFixed(4) : '~0.003')
                                        : (1024*1024/1000000 * PRICING.image[model]).toFixed(4)
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateImage;
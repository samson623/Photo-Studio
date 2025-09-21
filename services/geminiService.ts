import { GoogleGenAI, Modality, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File): Promise<Part> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * Calls the Gemini API for image editing.
 * @param prompt The text prompt for the edit.
 * @param image1 The primary image file.
 * @param image2 An optional secondary image file for style or reference.
 * @returns A promise that resolves to a data URL of the generated image.
 */
export const editImage = async (prompt: string, image1: File, image2?: File): Promise<string> => {
    const imageParts: Part[] = [];

    imageParts.push(await fileToGenerativePart(image1));
    if (image2) {
        imageParts.push(await fileToGenerativePart(image2));
    }

    const textPart: Part = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [...imageParts, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const { mimeType, data } = part.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    throw new Error("API response did not contain an image. The model may have refused to generate the image based on the prompt.");
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * Calls the Gemini API to generate a video.
 * @param prompt The text prompt for the video.
 * @param image An optional image file to base the video on.
 * @param onProgress A callback to report progress messages.
 * @returns A promise that resolves to a local object URL of the generated video.
 */
export const generateVideo = async (
    prompt: string, 
    image: File | null,
    onProgress: (message: string) => void
): Promise<string> => {
    onProgress("Initializing video generation...");

    const imagePayload = image ? {
        imageBytes: await fileToBase64(image),
        mimeType: image.type
    } : undefined;

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: imagePayload,
        config: {
            numberOfVideos: 1
        }
    });
    
    const progressMessages = [
        "Generation started. This can take several minutes.",
        "Warming up the AI engines...",
        "Gathering creative digital particles...",
        "Rendering your scene, frame by frame...",
        "Applying cinematic magic...",
        "Finalizing the video stream..."
    ];
    let messageIndex = 0;
    onProgress(progressMessages[messageIndex++]);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
        onProgress(progressMessages[messageIndex % progressMessages.length]);
        if (messageIndex < progressMessages.length) {
            messageIndex++;
        }
    }

    if(operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    onProgress("Video ready! Downloading...");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation failed: no download link found in the response. This could be due to safety filters.");
    }
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download video file. Status: ${response.status}. ${errorText}`);
    }
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return videoUrl;
};

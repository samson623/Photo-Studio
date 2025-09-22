import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await fileToBase64(file);
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

/**
 * Calls the Gemini API to edit an image based on a text prompt.
 * @param prompt The text prompt describing the edits.
 * @param image1 The primary image file to edit.
 * @param image2 An optional secondary image for style/reference.
 * @returns A promise that resolves to a data URL of the edited image.
 */
export const editImage = async (prompt: string, image1: File, image2: File | null): Promise<string> => {
    const textPart = { text: prompt };
    const image1Part = await fileToGenerativePart(image1);

    // FIX: Explicitly type `parts` as an array that can hold both image and text parts.
    // This resolves a TypeScript error where the array type was too narrowly inferred
    // from its first element (an image part), preventing a text part from being added.
    const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [image1Part];
    if (image2) {
        const image2Part = await fileToGenerativePart(image2);
        parts.push(image2Part);
    }
    parts.push(textPart);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: parts,
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imageOutputPart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData
    );

    if (!imageOutputPart?.inlineData) {
        const textOutput = response.text;
        if (textOutput) {
            throw new Error(`Model returned a text response instead of an image: "${textOutput}"`);
        }
        throw new Error("API response did not contain an image. The model may have refused the request.");
    }
    
    const base64ImageBytes: string = imageOutputPart.inlineData.data;
    const mimeType = imageOutputPart.inlineData.mimeType;

    return `data:${mimeType};base64,${base64ImageBytes}`;
}


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
        // FIX: The getVideosOperation method expects an `operation` object, not an object with a `name` property.
        operation = await ai.operations.getVideosOperation({operation: operation});
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

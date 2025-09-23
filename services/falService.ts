import * as fal from "@fal-ai/serverless-client";

// Configure Fal.ai client
fal.config({
  credentials: process.env.FAL_KEY
});

/**
 * Calls the Fal.ai API to generate an image using FLUX.1 model
 * @param prompt The text prompt describing the image to generate
 * @param model The FLUX model to use ('schnell' for fast/cheap or 'dev' for high quality)
 * @param image_size The size of the image to generate
 * @returns A promise that resolves to a data URL of the generated image
 */
export const generateImage = async (
  prompt: string, 
  model: 'schnell' | 'dev' = 'schnell',
  image_size: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9' = 'square_hd'
): Promise<string> => {
  try {
    const modelEndpoint = model === 'schnell' 
      ? "fal-ai/flux/schnell" 
      : "fal-ai/flux/dev";

    const result = await fal.subscribe(modelEndpoint, {
      input: {
        prompt: prompt,
        image_size: image_size,
        num_inference_steps: model === 'schnell' ? 4 : 28,
        num_images: 1,
        enable_safety_checker: true
      },
    });

    if (!result.data || !result.data.images || result.data.images.length === 0) {
      throw new Error("No image was generated. This could be due to safety filters or an invalid prompt.");
    }

    const imageUrl = result.data.images[0].url;
    
    // Convert to data URL for consistent handling
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.status}`);
    }
    
    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    
    return dataUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Calls the Fal.ai API to edit an image based on a text prompt (using img2img)
 * @param prompt The text prompt describing the edits
 * @param image The image file to edit
 * @param strength How much to change the image (0.1 = minimal, 1.0 = complete change)
 * @param model The FLUX model to use
 * @returns A promise that resolves to a data URL of the edited image
 */
export const editImage = async (
  prompt: string, 
  image: File, 
  strength: number = 0.8,
  model: 'schnell' | 'dev' = 'dev'
): Promise<string> => {
  try {
    const modelEndpoint = model === 'schnell' 
      ? "fal-ai/flux/schnell" 
      : "fal-ai/flux/dev";

    // Convert image to base64
    const imageDataUrl = await fileToDataUrl(image);

    const result = await fal.subscribe(modelEndpoint, {
      input: {
        prompt: prompt,
        image_url: imageDataUrl,
        strength: strength,
        num_inference_steps: model === 'schnell' ? 4 : 28,
        num_images: 1,
        enable_safety_checker: true
      },
    });

    if (!result.data || !result.data.images || result.data.images.length === 0) {
      throw new Error("No image was generated. This could be due to safety filters or an invalid prompt.");
    }

    const imageUrl = result.data.images[0].url;
    
    // Convert to data URL for consistent handling
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download edited image: ${response.status}`);
    }
    
    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    
    return dataUrl;
  } catch (error) {
    console.error("Image editing error:", error);
    throw new Error(`Image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Calls the Fal.ai API to generate a video
 * @param prompt The text prompt for the video
 * @param image An optional image file to base the video on
 * @param onProgress A callback to report progress messages
 * @param model The video model to use ('hailuo' or 'framepack')
 * @returns A promise that resolves to a local object URL of the generated video
 */
export const generateVideo = async (
  prompt: string,
  image: File | null,
  onProgress: (message: string) => void,
  model: 'hailuo' | 'framepack' = 'hailuo'
): Promise<string> => {
  try {
    onProgress("Initializing video generation...");

    const modelEndpoint = model === 'hailuo' 
      ? "fal-ai/minimax/hailuo-02/standard" 
      : "fal-ai/ltx-video";

    let input: any = {
      prompt: prompt,
      duration: model === 'hailuo' ? 6 : 5, // Hailuo supports 6s, Framepack 5s
    };

    // Add image if provided
    if (image) {
      const imageDataUrl = await fileToDataUrl(image);
      input.image_url = imageDataUrl;
    }

    onProgress("Sending request to Fal.ai...");

    const result = await fal.subscribe(modelEndpoint, {
      input: input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          onProgress("Video is being generated... This may take several minutes.");
        } else if (update.status === "IN_QUEUE") {
          onProgress(`In queue... Position: ${update.queue_position || 'unknown'}`);
        }
      },
    });

    onProgress("Video generated! Downloading...");

    if (!result.data || !result.data.video) {
      throw new Error("No video was generated. This could be due to safety filters or an invalid prompt.");
    }

    const videoUrl = result.data.video.url;
    
    // Download and create local object URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    
    const videoBlob = await response.blob();
    const localVideoUrl = URL.createObjectURL(videoBlob);
    
    onProgress("Video ready!");
    return localVideoUrl;
  } catch (error) {
    console.error("Video generation error:", error);
    throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper functions
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Export pricing information for the UI
export const PRICING = {
  image: {
    schnell: 0.003, // $0.003 per MP
    dev: 0.025     // $0.025 per MP
  },
  video: {
    hailuo: 0.08,    // $0.08 per second
    framepack: 0.0333 // ~$0.0333 per second
  }
};

// Calculate image cost based on dimensions
export const calculateImageCost = (width: number, height: number, model: 'schnell' | 'dev'): number => {
  const megapixels = (width * height) / 1000000;
  return megapixels * PRICING.image[model];
};

// Calculate video cost based on duration
export const calculateVideoCost = (duration: number, model: 'hailuo' | 'framepack'): number => {
  return duration * PRICING.video[model];
};
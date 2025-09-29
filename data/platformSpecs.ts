// Platform-specific media specifications for optimal content dimensions

export interface PlatformSpec {
  name: string;
  icon: string;
  supportedFormats: {
    image: string[];
    video: string[];
  };
  dimensions: {
    image: {
      feed?: { width: number; height: number; aspectRatio: string; label: string };
      story?: { width: number; height: number; aspectRatio: string; label: string };
      reel?: { width: number; height: number; aspectRatio: string; label: string };
      profile?: { width: number; height: number; aspectRatio: string; label: string };
      cover?: { width: number; height: number; aspectRatio: string; label: string };
    };
    video: {
      feed?: { width: number; height: number; aspectRatio: string; label: string; maxDuration: number };
      story?: { width: number; height: number; aspectRatio: string; label: string; maxDuration: number };
      reel?: { width: number; height: number; aspectRatio: string; label: string; maxDuration: number };
      shorts?: { width: number; height: number; aspectRatio: string; label: string; maxDuration: number };
    };
  };
  requirements: {
    maxFileSize: { image: number; video: number }; // in MB
    minDuration?: number; // in seconds
    maxDuration?: number; // in seconds
  };
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  instagram: {
    name: 'Instagram',
    icon: '📷',
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'webp'],
      video: ['mp4', 'mov']
    },
    dimensions: {
      image: {
        feed: { width: 1080, height: 1080, aspectRatio: '1:1', label: 'Square Post' },
        story: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Story/Reel' },
        profile: { width: 320, height: 320, aspectRatio: '1:1', label: 'Profile Picture' },
      },
      video: {
        feed: { width: 1080, height: 1080, aspectRatio: '1:1', label: 'Feed Video', maxDuration: 60 },
        story: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Story', maxDuration: 60 },
        reel: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Reel', maxDuration: 90 },
      }
    },
    requirements: {
      maxFileSize: { image: 30, video: 1024 },
      minDuration: 3,
      maxDuration: 90
    }
  },
  youtube: {
    name: 'YouTube',
    icon: '📺',
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'webp'],
      video: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm']
    },
    dimensions: {
      image: {
        cover: { width: 2560, height: 1440, aspectRatio: '16:9', label: 'Channel Banner' },
        profile: { width: 800, height: 800, aspectRatio: '1:1', label: 'Channel Icon' },
      },
      video: {
        feed: { width: 1920, height: 1080, aspectRatio: '16:9', label: 'Standard HD', maxDuration: 43200 },
        shorts: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'YouTube Shorts', maxDuration: 60 },
      }
    },
    requirements: {
      maxFileSize: { image: 6, video: 128000 },
      minDuration: 1,
      maxDuration: 43200 // 12 hours
    }
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'webp'],
      video: ['mp4', 'mov', 'webm']
    },
    dimensions: {
      image: {
        profile: { width: 200, height: 200, aspectRatio: '1:1', label: 'Profile Picture' },
      },
      video: {
        feed: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'TikTok Video', maxDuration: 600 },
        story: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'TikTok Story', maxDuration: 60 },
      }
    },
    requirements: {
      maxFileSize: { image: 10, video: 287 },
      minDuration: 3,
      maxDuration: 600 // 10 minutes
    }
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '🐦',
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      video: ['mp4', 'mov']
    },
    dimensions: {
      image: {
        feed: { width: 1200, height: 675, aspectRatio: '16:9', label: 'Tweet Image' },
        profile: { width: 400, height: 400, aspectRatio: '1:1', label: 'Profile Picture' },
        cover: { width: 1500, height: 500, aspectRatio: '3:1', label: 'Header Image' },
      },
      video: {
        feed: { width: 1280, height: 720, aspectRatio: '16:9', label: 'Tweet Video', maxDuration: 140 },
      }
    },
    requirements: {
      maxFileSize: { image: 5, video: 512 },
      minDuration: 1,
      maxDuration: 140
    }
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png'],
      video: ['mp4', 'mov']
    },
    dimensions: {
      image: {
        feed: { width: 1200, height: 627, aspectRatio: '1.91:1', label: 'Feed Post' },
        profile: { width: 400, height: 400, aspectRatio: '1:1', label: 'Profile Picture' },
        cover: { width: 1584, height: 396, aspectRatio: '4:1', label: 'Background Image' },
      },
      video: {
        feed: { width: 1920, height: 1080, aspectRatio: '16:9', label: 'Feed Video', maxDuration: 600 },
      }
    },
    requirements: {
      maxFileSize: { image: 10, video: 5120 },
      minDuration: 3,
      maxDuration: 600
    }
  },
  facebook: {
    name: 'Facebook',
    icon: '👤',
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'webp'],
      video: ['mp4', 'mov', 'avi']
    },
    dimensions: {
      image: {
        feed: { width: 1200, height: 630, aspectRatio: '1.91:1', label: 'Feed Post' },
        story: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Story' },
        profile: { width: 320, height: 320, aspectRatio: '1:1', label: 'Profile Picture' },
        cover: { width: 1200, height: 630, aspectRatio: '1.91:1', label: 'Cover Photo' },
      },
      video: {
        feed: { width: 1280, height: 720, aspectRatio: '16:9', label: 'Feed Video', maxDuration: 240 },
        story: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Story', maxDuration: 120 },
        reel: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Reel', maxDuration: 90 },
      }
    },
    requirements: {
      maxFileSize: { image: 30, video: 10240 },
      minDuration: 1,
      maxDuration: 240
    }
  }
};

// Helper function to get aspect ratio for generation
export const getAspectRatioForPlatform = (platform: string, contentType: 'image' | 'video', postType: string): string => {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) return '1:1'; // default to square
  
  const dimensions = spec.dimensions[contentType]?.[postType as keyof typeof spec.dimensions.image];
  return dimensions?.aspectRatio || '1:1';
};

// Get recommended dimensions for a platform
export const getRecommendedDimensions = (platform: string, contentType: 'image' | 'video', postType: string) => {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) return null;
  
  return spec.dimensions[contentType]?.[postType as keyof typeof spec.dimensions.image];
};

// Check if file format is supported
export const isFormatSupported = (platform: string, contentType: 'image' | 'video', format: string): boolean => {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) return false;
  
  return spec.supportedFormats[contentType].includes(format.toLowerCase());
};

// Get all post types for a platform
export const getPostTypes = (platform: string, contentType: 'image' | 'video') => {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) return [];
  
  const dimensions = spec.dimensions[contentType];
  if (!dimensions) return [];
  
  return Object.entries(dimensions).map(([key, value]) => ({
    id: key,
    ...value
  }));
};
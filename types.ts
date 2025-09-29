
export enum Page {
  Dashboard = 'Dashboard',
  Image = 'Generate - Image',
  Video = 'Generate - Video',
  Billing = 'Billing',
  Gallery = 'Gallery',
  Social = 'Social Media',
}

export type PlanTier = 'Free' | 'Starter' | 'Creator' | 'Pro';

export interface User {
  name: string;
  email: string;
  password?: string; // Only used for local storage DB
  picture?: string;
  plan: PlanTier;
  imagesUsed: number;
  videoSecondsUsed: number;
  gallery: GalleryItem[];
}

export interface Plan {
  name: PlanTier;
  price: number;
  imagesIncluded: number;
  videoSecondsIncluded: number;
}

export interface GalleryItem {
  id: number; // Unique ID (e.g., timestamp)
  type: 'image' | 'video';
  prompt: string;
  narrationScript?: string;
  blobId: string; // Key to retrieve blob from IndexedDB
  timestamp: string; // ISO date string
}
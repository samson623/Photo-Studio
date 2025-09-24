
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, PlanTier, GalleryItem } from '../types';
import { PLANS } from '../data/plans';
import { initDB, saveBlob, deleteBlob } from '../services/dbService';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (name: string, email: string, password?: string) => Promise<void>;
  quickDemoAccess: () => Promise<void>;
  signOut: () => void;
  switchPlan: (plan: PlanTier) => void;
  incrementImageUsage: () => boolean;
  incrementVideoUsage: (seconds: number) => boolean;
  addToGallery: (itemData: { type: 'image' | 'video'; prompt: string; narrationScript?: string; blob: Blob }) => Promise<void>;
  removeFromGallery: (itemId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'photo_studio_session_user';
const USER_DB_STORAGE_KEY = 'photo_studio_user_db';

// --- User Database Helpers ---
const getUserDB = (): Record<string, User> => {
  try {
    const db = localStorage.getItem(USER_DB_STORAGE_KEY);
    return db ? JSON.parse(db) : {};
  } catch (e) {
    console.error("Failed to parse user DB from localStorage", e);
    return {};
  }
};

const saveUserDB = (db: Record<string, User>) => {
  try {
    localStorage.setItem(USER_DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save user DB to localStorage", e);
  }
};
// -----------------------------

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initDB();
    // Initialize a demo user if the DB is empty
    const db = getUserDB();
    if (Object.keys(db).length === 0) {
        const demoUser: User = {
            name: 'Demo User',
            email: 'demo@example.com',
            password: 'password', // Simple password for demo
            picture: `https://ui-avatars.com/api/?name=Demo+User&background=3B82F6&color=fff&size=128`,
            plan: 'Free',
            imagesUsed: 0,
            videoSecondsUsed: 0,
            gallery: [],
        };
        db[demoUser.email] = demoUser;
        saveUserDB(db);
    }

    try {
      const storedUser = localStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user session from localStorage", error);
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
  }, []);

  const updateUser = (updatedUser: User | null) => {
    if (updatedUser) {
        // Create a user object for the session without the password
        const { password, ...sessionUser } = updatedUser;
        setUser(sessionUser);
        localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(sessionUser));
        
        // Also update the master user database in case of changes (like plan, usage)
        const db = getUserDB();
        db[updatedUser.email] = updatedUser;
        saveUserDB(db);
    } else {
        setUser(null);
        localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
  };

  const signIn = async (email: string, password?: string): Promise<void> => {
    const db = getUserDB();
    const userFromDb = db[email];

    if (!userFromDb) {
        throw new Error("User not found. Please sign up.");
    }

    if (userFromDb.password !== password) {
        throw new Error("Invalid password.");
    }
    
    updateUser(userFromDb);
  };

  const signUp = async (name: string, email: string, password?: string): Promise<void> => {
      const db = getUserDB();
      if (db[email]) {
          throw new Error("An account with this email already exists.");
      }
      
      const newUser: User = {
          name,
          email,
          password,
          picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=128`,
          plan: 'Free',
          imagesUsed: 0,
          videoSecondsUsed: 0,
          gallery: [],
      };

      db[email] = newUser;
      saveUserDB(db);
      
      // Automatically sign in after successful sign up
      await signIn(email, password);
  };

  const quickDemoAccess = async (): Promise<void> => {
    // Quick demo access that signs in the demo user
    await signIn('demo@example.com', 'password');
  }

  const signOut = () => {
    updateUser(null);
  };

  const switchPlan = (plan: PlanTier) => {
    if (user) {
        const db = getUserDB();
        const storedUser = db[user.email];
        if (storedUser) {
            const updatedUser: User = {
                ...storedUser,
                plan,
                imagesUsed: 0,
                videoSecondsUsed: 0,
            };
            updateUser(updatedUser);
        }
    }
  };

  const incrementImageUsage = (): boolean => {
    if (!user) return false;
    const userPlan = PLANS[user.plan];
    if (user.imagesUsed >= userPlan.imagesIncluded) {
      return false; // Quota exceeded
    }
    const updatedUser = { ...user, imagesUsed: user.imagesUsed + 1 };
    updateUser(updatedUser);
    return true;
  };

  const incrementVideoUsage = (seconds: number): boolean => {
    if (!user) return false;
    const userPlan = PLANS[user.plan];
    if (user.videoSecondsUsed + seconds > userPlan.videoSecondsIncluded) {
      return false;
    }
    const updatedUser = { ...user, videoSecondsUsed: user.videoSecondsUsed + seconds };
    updateUser(updatedUser);
    return true;
  };

  const addToGallery = async (itemData: { type: 'image' | 'video', prompt: string, narrationScript?: string, blob: Blob }) => {
    if (!user) return;
    const id = Date.now();
    const blobId = `${user.email}-${id}`;
    
    await saveBlob(blobId, itemData.blob);

    const newItem: GalleryItem = {
        id,
        blobId,
        type: itemData.type,
        prompt: itemData.prompt,
        narrationScript: itemData.narrationScript,
        timestamp: new Date().toISOString()
    };
    
    const db = getUserDB();
    const storedUser = db[user.email];
    const updatedUser = { ...storedUser, gallery: [...(storedUser.gallery || []), newItem] };
    updateUser(updatedUser);
  };

  const removeFromGallery = async (itemId: number) => {
      if (!user) return;
      const db = getUserDB();
      const storedUser = db[user.email];
      if (!storedUser) return;
      
      const itemToRemove = storedUser.gallery.find(item => item.id === itemId);
      if (!itemToRemove) return;

      await deleteBlob(itemToRemove.blobId);
      
      const updatedGallery = storedUser.gallery.filter(item => item.id !== itemId);
      const updatedUser = { ...storedUser, gallery: updatedGallery };
      updateUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, quickDemoAccess, signOut, switchPlan, incrementImageUsage, incrementVideoUsage, addToGallery, removeFromGallery }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
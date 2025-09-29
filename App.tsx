
import React, { useState } from 'react';
import { Page } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GenerateImage from './components/GenerateImage';
import GenerateVideo from './components/GenerateVideo';
import Usage from './components/Usage';
import { AuthProvider } from './context/AuthContext';
import Gallery from './components/Gallery';
import SocialMediaManager from './components/SocialMediaManager';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [imageForVideo, setImageForVideo] = useState<File | null>(null);

  const navigateToVideoWithImage = (imageFile: File) => {
    setImageForVideo(imageFile);
    setCurrentPage(Page.Video);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard />;
      case Page.Image:
        return <GenerateImage onUseForVideo={navigateToVideoWithImage} />;
      case Page.Video:
        return <GenerateVideo initialImage={imageForVideo} clearInitialImage={() => setImageForVideo(null)} />;
      case Page.Billing:
        return <Usage />;
      case Page.Gallery:
        return <Gallery onUseForVideo={navigateToVideoWithImage} />;
      case Page.Social:
        return <SocialMediaManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </AuthProvider>
  );
};

export default App;
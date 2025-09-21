import React, { useRef, useEffect } from 'react';

interface NarratedVideoPlayerProps {
    src: string;
    script: string;
}

const NarratedVideoPlayer: React.FC<NarratedVideoPlayerProps> = ({ src, script }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (script.trim()) {
            utteranceRef.current = new SpeechSynthesisUtterance(script);
        } else {
            utteranceRef.current = null;
        }
        // Cancel any speaking when script changes
        window.speechSynthesis.cancel();
    }, [script]);

    useEffect(() => {
        const videoElement = videoRef.current;
        const speech = window.speechSynthesis;

        if (!videoElement || !script.trim()) {
            return;
        }

        const handlePlay = () => {
            if (!utteranceRef.current) return;
            
            // If we are paused, resume. Otherwise, start from the beginning.
            if (speech.paused) {
                speech.resume();
            } else {
                speech.cancel(); // Stop any previous speech
                speech.speak(utteranceRef.current);
            }
        };

        const handlePause = () => {
            speech.pause();
        };
        
        const handleEnded = () => {
            speech.cancel();
        };

        // Seeking can de-sync audio, so we stop it.
        const handleSeeking = () => {
            speech.cancel();
        };
        
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
        videoElement.addEventListener('ended', handleEnded);
        videoElement.addEventListener('seeking', handleSeeking);

        return () => {
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('pause', handlePause);
            videoElement.removeEventListener('ended', handleEnded);
            videoElement.removeEventListener('seeking', handleSeeking);
            // Cleanup speech synthesis on component unmount
            speech.cancel();
        };
    }, [script]); // Rerun setup if script changes

    return (
        <video ref={videoRef} src={src} controls className="w-full h-full object-cover">
            Your browser does not support the video tag.
        </video>
    );
};

export default NarratedVideoPlayer;

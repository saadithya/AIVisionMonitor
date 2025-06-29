import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';

interface CameraFeedProps {
  isMonitoring: boolean;
  onFrameCapture: (imageData: string) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ isMonitoring, onFrameCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      startFrameCapture();
    } else {
      stopFrameCapture();
    }
  }, [isMonitoring]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setError(null);
      }
    } catch (err) {
      setHasPermission(false);
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    stopFrameCapture();
  };

  const startFrameCapture = () => {
    intervalRef.current = setInterval(() => {
      captureFrame();
    }, 2000); // Capture frame every 2 seconds
  };

  const stopFrameCapture = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onFrameCapture(imageData);
  };

  if (hasPermission === false) {
    return (
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center p-8">
          <CameraOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Camera Access Required</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={initializeCamera}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Grant Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Status Indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-white text-sm font-medium">
          {isMonitoring ? 'MONITORING' : 'STANDBY'}
        </span>
      </div>

      {/* Camera Icon */}
      <div className="absolute top-4 right-4">
        <Camera className="w-6 h-6 text-white opacity-75" />
      </div>
    </div>
  );
};
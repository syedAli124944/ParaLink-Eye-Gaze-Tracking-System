import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Move, Eye } from 'lucide-react';
import { useEog } from '../contexts/EogContext.jsx';
import { browserEyeTracker } from '../services/BrowserEyeTracker.js';

export function WebcamPreview() {
  const videoRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState(null);
  const { eogMode, isEogEnabled } = useEog();
  
  // Dragging state
  const [position, setPosition] = useState({ x: window.innerWidth - 280, y: window.innerHeight - 220 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isEogEnabled || eogMode !== 'webcam') {
      setIsTracking(false);
      setFaceDetected(false);
      setError(null);
      return;
    }

    // Set the video stream from the browser eye tracker
    const checkInterval = setInterval(() => {
      const stream = browserEyeTracker.getStream();
      const isRunning = browserEyeTracker.isRunning;
      
      if (isRunning) {
        setIsTracking(true);
        setError(null);
        
        if (stream && videoRef.current && videoRef.current.srcObject !== stream) {
          console.log('[WebcamPreview] Attaching video stream');
          videoRef.current.srcObject = stream;
        }
      }

      // Update face detection status
      if (isRunning) {
        setFaceDetected(browserEyeTracker.faceDetected);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isEogEnabled, eogMode]);

  // Dragging logic
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 200));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 150));
      
      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isEogEnabled || eogMode !== 'webcam') return null;

  return (
    <div 
      className={`fixed z-40 animate-fade-in ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'all 0.1s ease-out' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-teal-500 w-48 sm:w-64">
        <div 
          onMouseDown={handleMouseDown}
          className="bg-teal-600 px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Eye Tracking</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Face detection indicator */}
            <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400'} ${faceDetected ? 'animate-pulse' : ''}`} />
            <Move className="w-3 h-3 text-white/50" />
          </div>
        </div>
        
        <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
          {error ? (
            <div className="text-center p-4">
              <CameraOff className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-[10px] text-gray-300 font-medium leading-tight">{error}</p>
            </div>
          ) : isTracking ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              {/* Tracking overlay */}
              <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center">
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                  faceDetected ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                }`}>
                  {faceDetected ? '👤 Face OK' : '⚠️ No Face'}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/80 text-white font-bold">
                  <Eye className="w-2 h-2 inline" /> In-Browser
                </span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-[10px] text-gray-400">Loading MediaPipe...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

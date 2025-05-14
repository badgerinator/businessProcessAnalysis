import React, { useEffect, useRef, useState } from 'react';
import { Circle } from 'lucide-react';
import { cn } from '../utils/cn';

interface SessionTimerProps {
  totalSeconds: number;
  currentSeconds: number;
  isRunning: boolean;
  onTimeWarning?: (minutesLeft: number) => void;
  onTimeUp?: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  totalSeconds,
  currentSeconds,
  isRunning,
  onTimeWarning,
  onTimeUp,
}) => {
  const [progress, setProgress] = useState(100);
  const warningTriggeredRef = useRef<Set<number>>(new Set());
  
  useEffect(() => {
    const percentage = (currentSeconds / totalSeconds) * 100;
    setProgress(percentage);
    
    // Handle time warnings
    const minutesLeft = Math.ceil(currentSeconds / 60);
    if (isRunning && onTimeWarning && (minutesLeft === 5 || minutesLeft === 1)) {
      if (!warningTriggeredRef.current.has(minutesLeft)) {
        warningTriggeredRef.current.add(minutesLeft);
        onTimeWarning(minutesLeft);
        
        // Play subtle audio warning
        const audio = new Audio();
        audio.src = minutesLeft === 5 
          ? 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+Pwt'
          : 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+Pwt';
        audio.volume = 0.2;
        audio.play().catch(() => {}); // Ignore autoplay restrictions
      }
    }
    
    // Handle time up
    if (currentSeconds === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [currentSeconds, totalSeconds, isRunning, onTimeWarning, onTimeUp]);
  
  const getColorClass = () => {
    if (progress > 50) return 'text-green-500';
    if (progress > 25) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const strokeDasharray = 2 * Math.PI * 48; // Circle circumference
  const strokeDashoffset = strokeDasharray * ((100 - progress) / 100);
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200 dark:text-gray-800"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className={cn(
            "transition-all duration-200",
            getColorClass()
          )}
          style={{
            strokeDasharray: strokeDasharray,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-2xl font-mono font-bold",
          getColorClass()
        )}>
          {formatTime(currentSeconds)}
        </span>
      </div>
    </div>
  );
};

export default SessionTimer;
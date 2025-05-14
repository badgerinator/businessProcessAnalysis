import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import useStore from '../store';

interface QuizTimerProps {
  sessionId: string;
  questionId: string;
  duration: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

const QuizTimer: React.FC<QuizTimerProps> = ({
  sessionId,
  questionId,
  duration,
  onTimeUp,
  isRunning,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(duration);
  const updateQuestionTime = useStore((state) => state.updateQuestionTime);
  const updateSessionTime = useStore((state) => state.updateSessionTime);
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);

  useEffect(() => {
    setTimeLeft(duration);
    startTimeRef.current = null;
    elapsedTimeRef.current = 0;
  }, [duration, questionId]);

  useEffect(() => {
    if (!isRunning) {
      if (startTimeRef.current !== null) {
        const now = Date.now();
        elapsedTimeRef.current += now - startTimeRef.current;
        startTimeRef.current = null;
        
        // Update time tracking in store
        updateQuestionTime(sessionId, questionId, elapsedTimeRef.current);
        updateSessionTime(sessionId, elapsedTimeRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();
    
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = elapsedTimeRef.current + (now - (startTimeRef.current || now));
      
      setTimeLeft((prev) => {
        const newTime = Math.max(0, duration - Math.floor(elapsed / 1000));
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return newTime;
      });
      
      // Update time tracking every second
      updateQuestionTime(sessionId, questionId, elapsed);
      updateSessionTime(sessionId, elapsed);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (startTimeRef.current !== null) {
        const now = Date.now();
        elapsedTimeRef.current += now - startTimeRef.current;
        startTimeRef.current = null;
      }
    };
  }, [isRunning, sessionId, questionId, duration, onTimeUp, updateQuestionTime, updateSessionTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex items-center gap-2 text-2xl font-mono">
      <Clock className={getTimerColor()} />
      <span className={getTimerColor()}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default QuizTimer;
import React from 'react';
import { cn } from '../utils/cn';

interface SessionProgressProps {
  currentSection: number;
  totalSections: number;
  currentQuestion: number;
  totalQuestions: number;
  completedQuestions: number;
  totalTimeRemaining: number;
  totalTime: number;
}

const SessionProgress: React.FC<SessionProgressProps> = ({
  currentSection,
  totalSections,
  currentQuestion,
  totalQuestions,
  completedQuestions,
  totalTimeRemaining,
  totalTime,
}) => {
  const timeProgress = (totalTimeRemaining / totalTime) * 100;
  const questionProgress = (completedQuestions / totalQuestions) * 100;
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Bölüm</div>
              <div className="font-medium">{currentSection} / {totalSections}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Soru</div>
              <div className="font-medium">{currentQuestion} / {totalQuestions}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tamamlanan</div>
              <div className="font-medium">{completedQuestions} / {totalQuestions}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Kalan Süre</div>
            <div className="font-medium font-mono">
              {formatTime(totalTimeRemaining)}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Süre İlerlemesi</span>
              <span className={cn(
                "font-medium",
                timeProgress > 50 ? "text-green-500" :
                timeProgress > 25 ? "text-yellow-500" :
                "text-red-500"
              )}>
                %{Math.round(timeProgress)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  timeProgress > 50 ? "bg-green-500" :
                  timeProgress > 25 ? "bg-yellow-500" :
                  "bg-red-500"
                )}
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Tamamlanan Sorular</span>
              <span className="font-medium text-indigo-500">
                %{Math.round(questionProgress)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${questionProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionProgress;
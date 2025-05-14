import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, Play, Pause } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Interview, Questionnaire } from '../types';
import { calculateProgress, formatTime, validateTimeData } from '../utils/validators';

interface InterviewCardProps {
  interview: Interview;
  questionnaire: Questionnaire | null;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, questionnaire }) => {
  const navigate = useNavigate();
  
  const progress = calculateProgress(interview);
  const startDate = new Date(interview.startedAt);
  const isCompleted = !!interview.finishedAt;
  const isPaused = interview.isPaused;
  
  let totalTimeSpent = 0;
  Object.values(interview.sessions || {}).forEach((session) => {
    totalTimeSpent += validateTimeData(session.actualMs);
  });
  
  let totalPlannedTime = 0;
  if (questionnaire?.json?.sessions) {
    questionnaire.json.sessions.forEach((session: any) => {
      if (typeof session?.planned_duration_min === 'number') {
        totalPlannedTime += session.planned_duration_min;
      }
    });
  }
  
  const totalPlannedMs = totalPlannedTime * 60 * 1000;
  
  const getTimeStatusColor = () => {
    if (totalPlannedMs === 0) return 'bg-gray-100 text-gray-800';
    const timeRatio = totalTimeSpent / totalPlannedMs;
    if (timeRatio > 1.1) return 'bg-red-100 text-red-800';
    if (timeRatio > 0.9) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const handleContinue = () => {
    navigate(`/run/${interview.id}`);
  };
  
  const handleReview = () => {
    navigate(`/review/${interview.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col transition-transform hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>{interview.candidate.name}</span>
          {isCompleted ? (
            <CheckCircle size={20} className="text-green-500" title="Tamamlandı" />
          ) : isPaused ? (
            <Pause size={20} className="text-yellow-500" title="Duraklatıldı" />
          ) : (
            <Play size={20} className="text-blue-500" title="Devam Ediyor" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <div className="font-medium">{questionnaire?.name || 'Bilinmeyen Soru Seti'}</div>
            {interview.candidate.title && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {interview.candidate.title}
                {interview.candidate.dept ? ` • ${interview.candidate.dept}` : ''}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={16} className="mr-2" />
              <span>Başlangıç: {startDate.toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  <Clock size={16} className="inline mr-2" />
                  Kullanılan Süre
                </span>
                <span className={`${getTimeStatusColor()} px-2 py-0.5 rounded-full text-xs`}>
                  {formatTime(totalTimeSpent)} / {totalPlannedTime} dk
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((totalTimeSpent / totalPlannedMs) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">İlerleme</span>
                <span className="font-medium">%{progress}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isCompleted ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleReview}
          >
            Sonuçları Görüntüle
          </Button>
        ) : (
          <Button 
            variant="primary" 
            className="w-full flex items-center gap-2" 
            onClick={handleContinue}
          >
            <Play size={16} />
            {isPaused ? 'Mülakata Devam Et' : 'Mülakata Devam Et'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
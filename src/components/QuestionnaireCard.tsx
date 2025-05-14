import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Questionnaire } from '../types';
import { calculateTotalDuration } from '../utils/validators';

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
  onStartInterview: (questionnaire: Questionnaire) => void;
}

const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({ 
  questionnaire, 
  onStartInterview 
}) => {
  const totalDuration = calculateTotalDuration(questionnaire.json);
  const createdDate = new Date(questionnaire.createdAt);
  
  return (
    <Card className="h-full flex flex-col transition-transform hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="text-xl">{questionnaire.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={16} className="mr-2" />
            <span>Versiyon {questionnaire.version} • Eklenme {createdDate.toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock size={16} className="mr-2" />
            <span>Tahmini süre: {totalDuration} dakika</span>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {questionnaire.json.sessions.length} oturum
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="primary" 
          className="w-full" 
          onClick={() => onStartInterview(questionnaire)}
        >
          Mülakatı Başlat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionnaireCard;
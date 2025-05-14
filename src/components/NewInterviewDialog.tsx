import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import useStore from '../store';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Questionnaire } from '../types';

interface NewInterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
}

const NewInterviewDialog: React.FC<NewInterviewDialogProps> = ({ 
  isOpen, 
  onClose,
  questionnaire
}) => {
  const navigate = useNavigate();
  const createInterview = useStore((state) => state.createInterview);
  
  const [candidateName, setCandidateName] = useState('');
  const [candidateTitle, setCandidateTitle] = useState('');
  const [candidateDept, setCandidateDept] = useState('');
  
  if (!isOpen || !questionnaire) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateName.trim()) return;
    
    const interviewId = createInterview(
      questionnaire.hash,
      {
        name: candidateName.trim(),
        title: candidateTitle.trim() || undefined,
        dept: candidateDept.trim() || undefined,
      }
    );
    
    onClose();
    navigate(`/run/${interviewId}`);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0" 
            onClick={onClose}
          >
            <X size={20} />
          </Button>
          <CardTitle>Yeni Mülakat</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Soru Seti</h3>
                <div className="bg-gray-100 dark:bg-zinc-900 rounded-lg p-3">
                  <div className="font-medium">{questionnaire.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Versiyon: {questionnaire.version}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="candidateName" className="block text-sm font-medium">
                  Aday Adı *
                </label>
                <input
                  id="candidateName"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="candidateTitle" className="block text-sm font-medium">
                  Ünvan (opsiyonel)
                </label>
                <input
                  id="candidateTitle"
                  type="text"
                  value={candidateTitle}
                  onChange={(e) => setCandidateTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="candidateDept" className="block text-sm font-medium">
                  Departman (opsiyonel)
                </label>
                <input
                  id="candidateDept"
                  type="text"
                  value={candidateDept}
                  onChange={(e) => setCandidateDept(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              İptal
            </Button>
            <Button variant="primary" type="submit" disabled={!candidateName.trim()}>
              Mülakatı Başlat
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewInterviewDialog;
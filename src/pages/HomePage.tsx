import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useStore from '../store';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import FileUpload from '../components/FileUpload';
import QuestionnaireCard from '../components/QuestionnaireCard';
import QuestionnaireBuilder from '../components/QuestionnaireBuilder';
import NewInterviewDialog from '../components/NewInterviewDialog';
import { Questionnaire } from '../types';

const HomePage: React.FC = () => {
  const questionnaires = useStore((state) => state.questionnaires);
  const [showUpload, setShowUpload] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  
  const handleUploadSuccess = () => {
    setShowUpload(false);
  };
  
  const handleStartInterview = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
  };
  
  const handleCloseDialog = () => {
    setSelectedQuestionnaire(null);
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mülakat Koçu</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowUpload(true);
              setShowBuilder(false);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Soru Seti Yükle</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowBuilder(true);
              setShowUpload(false);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Soru Seti Oluştur</span>
          </Button>
        </div>
      </div>
      
      {showUpload ? (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Soru Seti Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      ) : showBuilder ? (
        <QuestionnaireBuilder />
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Soru Seti Galerisi</h2>
          
          {Object.keys(questionnaires).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Henüz soru seti bulunmuyor. Başlamak için bir soru seti yükleyin veya oluşturun.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowUpload(true)}>
                  Soru Seti Yükle
                </Button>
                <Button variant="primary" onClick={() => setShowBuilder(true)}>
                  Soru Seti Oluştur
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(questionnaires).map((questionnaire) => (
                <QuestionnaireCard
                  key={questionnaire.hash}
                  questionnaire={questionnaire}
                  onStartInterview={handleStartInterview}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      <NewInterviewDialog
        isOpen={!!selectedQuestionnaire}
        onClose={handleCloseDialog}
        questionnaire={selectedQuestionnaire}
      />
    </div>
  );
};

export default HomePage;
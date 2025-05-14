import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, AlertTriangle, ThumbsUp, ThumbsDown, Send, Download } from 'lucide-react';
import useStore from '../store';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Rating, ReviewData } from '../types';

const InterviewReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const interview = useStore((state) => (id ? state.interviews[id] : null));
  const questionnaire = useStore((state) => (
    interview ? state.questionnaires[interview.questionnaireHash] : null
  ));
  
  const [reviewData, setReviewData] = useState<ReviewData>({
    strengths: [''],
    weaknesses: [''],
    redFlags: [],
    nextSteps: '',
    notes: '',
    rating: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      culturalFit: 0,
      overall: 0,
    },
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!interview || !questionnaire) {
      navigate('/404');
      return;
    }
    
    if (interview.review) {
      setReviewData(interview.review);
    }
  }, [interview, questionnaire, navigate]);
  
  const handleRatingChange = (category: keyof Rating, value: number) => {
    setReviewData((prev) => ({
      ...prev,
      rating: {
        ...prev.rating,
        [category]: value,
      },
    }));
    setIsDirty(true);
  };
  
  const handleListChange = (
    type: 'strengths' | 'weaknesses' | 'redFlags',
    index: number,
    value: string
  ) => {
    setReviewData((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
    setIsDirty(true);
  };
  
  const handleAddListItem = (type: 'strengths' | 'weaknesses' | 'redFlags') => {
    setReviewData((prev) => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
  };
  
  const handleRemoveListItem = (
    type: 'strengths' | 'weaknesses' | 'redFlags',
    index: number
  ) => {
    setReviewData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };
  
  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    
    try {
      useStore.getState().updateInterview(id, {
        review: reviewData,
      });
      
      setIsDirty(false);
    } catch (error) {
      console.error('Değerlendirme kaydedilirken hata oluştu:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportResponses = () => {
    if (!interview || !questionnaire) return;

    try {
      const exportData = JSON.parse(JSON.stringify(questionnaire.json));

      exportData.metadata = {
        candidateName: interview.candidate.name,
        candidateTitle: interview.candidate.title,
        candidateDept: interview.candidate.dept,
        startedAt: interview.startedAt,
        finishedAt: interview.finishedAt,
        exportedAt: new Date().toISOString(),
      };

      exportData.review = reviewData;

      exportData.sessions = exportData.sessions.map((session: any) => ({
        ...session,
        questions: session.questions.map((question: any) => {
          const questionData = interview.sessions[session.session_id]?.questions[question.qid];
          return {
            ...question,
            response: {
              answer: questionData?.answer || null,
              notes: questionData?.notes || null,
              timeSpent: questionData?.elapsedMs || 0,
              lastUpdated: questionData?.lastUpdated || null,
            },
          };
        }),
        timeSpent: interview.sessions[session.session_id]?.actualMs || 0,
      }));

      const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
      const time = new Date().toLocaleTimeString('tr-TR').replace(/:/g, '-');
      const filename = `mulakat_yanitlari_${date}_${time}.json`;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Yanıtlar dışa aktarılırken hata oluştu:', error);
    }
  };
  
  const renderStarRating = (category: keyof Rating, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRatingChange(category, value)}
            className={`p-1 rounded-full transition-colors ${
              value <= reviewData.rating[category]
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
  
  if (!interview || !questionnaire) return null;
  
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{interview.candidate.name}</h1>
          <div className="text-gray-500 dark:text-gray-400">
            {interview.candidate.title && (
              <span className="mr-2">{interview.candidate.title}</span>
            )}
            {interview.candidate.dept && (
              <span className="mr-2">• {interview.candidate.dept}</span>
            )}
            <span>• {new Date(interview.startedAt).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportResponses}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Yanıtları Dışa Aktar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Yetkinlik Değerlendirmesi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderStarRating('technical', 'Teknik Yetkinlik')}
          {renderStarRating('communication', 'İletişim')}
          {renderStarRating('problemSolving', 'Problem Çözme')}
          {renderStarRating('culturalFit', 'Kültürel Uyum')}
          {renderStarRating('overall', 'Genel Değerlendirme')}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              Güçlü Yönler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewData.strengths.map((strength, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) =>
                      handleListChange('strengths', index, e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                    placeholder="Güçlü yön ekle"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveListItem('strengths', index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => handleAddListItem('strengths')}
                className="w-full"
              >
                Güçlü Yön Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="w-5 h-5 text-red-500" />
              Gelişim Alanları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={weakness}
                    onChange={(e) =>
                      handleListChange('weaknesses', index, e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                    placeholder="Gelişim alanı ekle"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveListItem('weaknesses', index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => handleAddListItem('weaknesses')}
                className="w-full"
              >
                Gelişim Alanı Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Kırmızı Bayraklar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reviewData.redFlags.map((flag, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={flag}
                  onChange={(e) =>
                    handleListChange('redFlags', index, e.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                  placeholder="Kırmızı bayrak ekle"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveListItem('redFlags', index)}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => handleAddListItem('redFlags')}
              className="w-full"
            >
              Kırmızı Bayrak Ekle
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sonraki Adımlar & Ek Notlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sonraki Adımlar
            </label>
            <textarea
              value={reviewData.nextSteps}
              onChange={(e) =>
                setReviewData((prev) => ({
                  ...prev,
                  nextSteps: e.target.value,
                }))
              }
              className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
              placeholder="İşe alım sürecindeki sonraki adımları belirtin..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Ek Notlar
            </label>
            <textarea
              value={reviewData.notes}
              onChange={(e) =>
                setReviewData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
              placeholder="Ek gözlem ve notlarınızı ekleyin..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InterviewReviewPage;
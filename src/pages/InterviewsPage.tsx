import React, { useState } from 'react';
import { Search } from 'lucide-react';
import useStore from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import InterviewCard from '../components/InterviewCard';

const InterviewsPage: React.FC = () => {
  const interviews = useStore((state) => state.interviews);
  const questionnaires = useStore((state) => state.questionnaires);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);
  
  // Filter interviews based on search term and completion status
  const filteredInterviews = Object.values(interviews).filter((interview) => {
    const matchesSearch = 
      interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.candidate.title && interview.candidate.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (interview.candidate.dept && interview.candidate.dept.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (questionnaires[interview.questionnaireHash]?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCompletion = 
      filterCompleted === null || 
      (filterCompleted === true && interview.finishedAt) || 
      (filterCompleted === false && !interview.finishedAt);
    
    return matchesSearch && matchesCompletion;
  });
  
  // Sort interviews by start date (newest first)
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
  });
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mülakatlar</h1>
      
      {Object.keys(interviews).length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Henüz Mülakat Yok</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Ana sayfadaki soru setlerinden yeni bir mülakat başlatın.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 space-y-4">
            {/* Search and filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Mülakatlarda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Status filter */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterCompleted(null)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filterCompleted === null
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilterCompleted(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filterCompleted === false
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Devam Eden
              </button>
              <button
                onClick={() => setFilterCompleted(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filterCompleted === true
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Tamamlanan
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                questionnaire={questionnaires[interview.questionnaireHash] || null}
              />
            ))}
          </div>
          
          {sortedInterviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Arama kriterlerinize uygun mülakat bulunamadı.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewsPage;
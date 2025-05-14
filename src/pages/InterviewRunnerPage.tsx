import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ChevronLeft, ChevronRight, Save, CheckCircle } from 'lucide-react';
import useStore from '../store';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import QuizNavigation from '../components/QuizNavigation';
import SessionTimer from '../components/SessionTimer';
import SessionProgress from '../components/SessionProgress';

const InterviewRunnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const interview = useStore((state) => (id ? state.interviews[id] : null));
  const questionnaire = useStore((state) => (
    interview ? state.questionnaires[interview.questionnaireHash] : null
  ));
  const updateAnswer = useStore((state) => state.updateAnswer);
  const updateNotes = useStore((state) => state.updateNotes);
  const updateQuestionTime = useStore((state) => state.updateQuestionTime);
  const updateSessionTime = useStore((state) => state.updateSessionTime);
  const completeInterview = useStore((state) => state.completeInterview);
  
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState(new Set<string>());
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // If no interview or questionnaire found, redirect to 404
  if (!interview || !questionnaire || !questionnaire.json || !questionnaire.json.sessions) {
    navigate('/404');
    return null;
  }
  
  const sessions = questionnaire.json.sessions;
  const currentSession = sessions[currentSessionIndex];
  const currentQuestion = currentSession.questions[currentQuestionIndex];
  
  // Calculate total questions and completed questions
  const totalQuestions = sessions.reduce((total, session) => total + session.questions.length, 0);
  const totalCompletedQuestions = completedQuestions.size;
  
  // Get current answer and notes from store
  const sessionData = interview.sessions[currentSession.session_id] || {
    questions: {},
    actualMs: 0,
  };
  const questionData = sessionData.questions[currentQuestion.qid] || {
    answer: '',
    notes: '',
    elapsedMs: 0,
  };

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            setIsPaused(true);
            handleTimeUp();
          }
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isPaused]);
  
  useEffect(() => {
    // Reset timer when changing sections
    setTimeRemaining(currentSession.planned_duration_min * 60);
    setIsPaused(true);
  }, [currentSessionIndex, currentSession.planned_duration_min]);

  const handleNavigate = (sectionId: string, questionId: string) => {
    const sectionIndex = sessions.findIndex(s => s.session_id === sectionId);
    const questionIndex = sessions[sectionIndex].questions.findIndex(q => q.qid === questionId);
    
    setCurrentSessionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);
    setIsPaused(true);
  };

  const handleTimeWarning = (minutesLeft: number) => {
    // Handle time warnings (could show a notification)
    console.log(`Warning: ${minutesLeft} minutes remaining`);
  };

  const handleTimeUp = () => {
    setIsPaused(true);
    // Could show a dialog or auto-advance to next section
  };

  const handleAnswerChange = (value: string) => {
    updateAnswer(currentSession.session_id, currentQuestion.qid, value);
    if (value.trim()) {
      setCompletedQuestions(prev => new Set(prev).add(currentQuestion.qid));
    }
  };

  const handleNotesChange = (value: string) => {
    updateNotes(currentSession.session_id, currentQuestion.qid, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSessionIndex < sessions.length - 1) {
      setCurrentSessionIndex(currentSessionIndex + 1);
      setCurrentQuestionIndex(0);
      // Timer will auto-start for new section due to useEffect
      setIsPaused(false);
    } else {
      completeInterview(id);
      navigate(`/review/${id}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSessionIndex > 0) {
      setCurrentSessionIndex(currentSessionIndex - 1);
      setCurrentQuestionIndex(sessions[currentSessionIndex - 1].questions.length - 1);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <QuizNavigation
        sections={sessions}
        currentSectionId={currentSession.session_id}
        currentQuestionId={currentQuestion.qid}
        completedQuestions={completedQuestions}
        onNavigate={handleNavigate}
      />
      
      <div className="flex-1 overflow-y-auto">
        <SessionProgress
          currentSection={currentSessionIndex + 1}
          totalSections={sessions.length}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={currentSession.questions.length}
          completedQuestions={totalCompletedQuestions}
          totalTimeRemaining={timeRemaining}
          totalTime={currentSession.planned_duration_min * 60}
        />
        
        <div className="max-w-3xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{interview.candidate.name}</h1>
            {interview.candidate.title && (
              <p className="text-gray-500 dark:text-gray-400">
                {interview.candidate.title}
                {interview.candidate.dept && ` • ${interview.candidate.dept}`}
              </p>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {currentSession.title}
                  </p>
                  <CardTitle>{currentQuestion.text}</CardTitle>
                </div>
                <SessionTimer
                  totalSeconds={currentSession.planned_duration_min * 60}
                  currentSeconds={timeRemaining}
                  isRunning={!isPaused}
                  onTimeWarning={handleTimeWarning}
                  onTimeUp={handleTimeUp}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentQuestion.desc && (
                <p className="text-gray-600 dark:text-gray-300">
                  {currentQuestion.desc}
                </p>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Answer</label>
                  <textarea
                    value={questionData.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                    placeholder="Enter your answer here..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={questionData.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSessionIndex === 0 && currentQuestionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              
              <Button
                variant={isPaused ? 'primary' : 'outline'}
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2"
              >
                {isPaused ? (
                  <>
                    <Play size={16} />
                    Start Timer
                  </>
                ) : (
                  <>
                    <Pause size={16} />
                    Pause Timer
                  </>
                )}
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {currentSessionIndex === sessions.length - 1 &&
                currentQuestionIndex === currentSession.questions.length - 1 ? (
                  <>
                    <CheckCircle size={16} />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewRunnerPage;
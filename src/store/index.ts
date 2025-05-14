import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import { saveAs } from 'file-saver';
import { StoreState, Interview, Candidate, Questionnaire } from '../types';
import { loadQuestionnaires } from '../utils/questionnaire';

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      questionnaires: {},
      interviews: {},
      currentInterviewId: null,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      
      setDarkMode: (isDark) => set({ darkMode: isDark }),
      
      addQuestionnaire: (questionnaire) => {
        const serializableQuestionnaire = JSON.parse(JSON.stringify(questionnaire));
        set((state) => ({
          questionnaires: {
            ...state.questionnaires,
            [serializableQuestionnaire.hash]: serializableQuestionnaire,
          },
        }));
      },
      
      createInterview: (questionnaireHash, candidate) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        
        const interview: Interview = {
          id,
          questionnaireHash,
          candidate,
          startedAt: now,
          isPaused: false,
          sessions: {},
        };
        
        set((state) => ({
          interviews: {
            ...state.interviews,
            [id]: interview,
          },
          currentInterviewId: id,
        }));
        
        return id;
      },
      
      updateInterview: (id, data) => {
        const serializableData = JSON.parse(JSON.stringify(data));
        set((state) => ({
          interviews: {
            ...state.interviews,
            [id]: {
              ...state.interviews[id],
              ...serializableData,
              lastSaved: new Date().toISOString(),
            },
          },
        }));
      },
      
      setCurrentInterview: (id) => set({ currentInterviewId: id }),
      
      updateAnswer: (sessionId, questionId, answer) => {
        const serializableAnswer = JSON.parse(JSON.stringify(answer));
        set((state) => {
          const { currentInterviewId, interviews } = state;
          if (!currentInterviewId) return state;
          
          const interview = interviews[currentInterviewId];
          const session = interview.sessions[sessionId] || { 
            plannedMin: 0, 
            actualMs: 0, 
            questions: {} 
          };
          
          const question = session.questions[questionId] || { 
            answer: null, 
            notes: '', 
            plannedMin: 0, 
            elapsedMs: 0 
          };
          
          return {
            interviews: {
              ...interviews,
              [currentInterviewId]: {
                ...interview,
                lastSaved: new Date().toISOString(),
                currentSession: sessionId,
                currentQuestion: questionId,
                sessions: {
                  ...interview.sessions,
                  [sessionId]: {
                    ...session,
                    questions: {
                      ...session.questions,
                      [questionId]: {
                        ...question,
                        answer: serializableAnswer,
                        lastUpdated: new Date().toISOString(),
                      },
                    },
                  },
                },
              },
            },
          };
        });
      },
      
      updateNotes: (sessionId, questionId, notes) => set((state) => {
        const { currentInterviewId, interviews } = state;
        if (!currentInterviewId) return state;
        
        const interview = interviews[currentInterviewId];
        const session = interview.sessions[sessionId] || { 
          plannedMin: 0, 
          actualMs: 0, 
          questions: {} 
        };
        
        const question = session.questions[questionId] || { 
          answer: null, 
          notes: '', 
          plannedMin: 0, 
          elapsedMs: 0 
        };
        
        return {
          interviews: {
            ...interviews,
            [currentInterviewId]: {
              ...interview,
              lastSaved: new Date().toISOString(),
              sessions: {
                ...interview.sessions,
                [sessionId]: {
                  ...session,
                  questions: {
                    ...session.questions,
                    [questionId]: {
                      ...question,
                      notes,
                      lastUpdated: new Date().toISOString(),
                    },
                  },
                },
              },
            },
          },
        };
      }),
      
      updateQuestionTime: (sessionId, questionId, elapsedMs) => set((state) => {
        const { currentInterviewId, interviews } = state;
        if (!currentInterviewId) return state;
        
        const interview = interviews[currentInterviewId];
        const session = interview.sessions[sessionId] || { 
          plannedMin: 0, 
          actualMs: 0, 
          questions: {} 
        };
        
        const question = session.questions[questionId] || { 
          answer: null, 
          notes: '', 
          plannedMin: 0, 
          elapsedMs: 0 
        };
        
        return {
          interviews: {
            ...interviews,
            [currentInterviewId]: {
              ...interview,
              lastSaved: new Date().toISOString(),
              sessions: {
                ...interview.sessions,
                [sessionId]: {
                  ...session,
                  questions: {
                    ...session.questions,
                    [questionId]: {
                      ...question,
                      elapsedMs,
                      lastUpdated: new Date().toISOString(),
                    },
                  },
                },
              },
            },
          },
        };
      }),
      
      updateSessionTime: (sessionId, actualMs) => set((state) => {
        const { currentInterviewId, interviews } = state;
        if (!currentInterviewId) return state;
        
        const interview = interviews[currentInterviewId];
        const session = interview.sessions[sessionId] || { 
          plannedMin: 0, 
          actualMs: 0, 
          questions: {} 
        };
        
        return {
          interviews: {
            ...interviews,
            [currentInterviewId]: {
              ...interview,
              lastSaved: new Date().toISOString(),
              sessions: {
                ...interview.sessions,
                [sessionId]: {
                  ...session,
                  actualMs,
                },
              },
            },
          },
        };
      }),
      
      pauseInterview: (id) => set((state) => ({
        interviews: {
          ...state.interviews,
          [id]: {
            ...state.interviews[id],
            isPaused: true,
            lastSaved: new Date().toISOString(),
          },
        },
      })),
      
      resumeInterview: (id) => set((state) => ({
        interviews: {
          ...state.interviews,
          [id]: {
            ...state.interviews[id],
            isPaused: false,
            lastSaved: new Date().toISOString(),
          },
        },
      })),
      
      completeInterview: (id) => set((state) => ({
        interviews: {
          ...state.interviews,
          [id]: {
            ...state.interviews[id],
            finishedAt: new Date().toISOString(),
            isPaused: true,
            lastSaved: new Date().toISOString(),
          },
        },
      })),
      
      exportInterview: async (id) => {
        const state = get();
        const interview = state.interviews[id];
        const questionnaire = state.questionnaires[interview.questionnaireHash];
        
        const exportData = {
          candidate: interview.candidate,
          questionnaire: {
            name: questionnaire.name,
            version: questionnaire.version,
          },
          startedAt: interview.startedAt,
          finishedAt: interview.finishedAt,
          sessions: Object.entries(interview.sessions).map(([sessionId, sessionData]) => {
            const session = questionnaire.json.sessions.find((s: any) => s.session_id === sessionId);
            return {
              title: session?.title,
              questions: Object.entries(sessionData.questions).map(([qid, qData]) => {
                const question = session?.questions.find((q: any) => q.qid === qid);
                return {
                  question: question?.text,
                  answer: qData.answer,
                  notes: qData.notes,
                  timeSpent: formatTime(qData.elapsedMs),
                  lastUpdated: qData.lastUpdated,
                };
              }),
              timeSpent: formatTime(sessionData.actualMs),
            };
          }),
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        
        return blob;
      },
    }),
    {
      name: 'interview-platform-storage',
      storage: {
        getItem: async (name) => {
          const value = await localforage.getItem(name);
          return value as string;
        },
        setItem: async (name, value) => {
          const serializableValue = JSON.parse(JSON.stringify(value));
          await localforage.setItem(name, serializableValue);
        },
        removeItem: async (name) => {
          await localforage.removeItem(name);
        },
      },
      partialize: (state) => {
        const { questionnaires, interviews, currentInterviewId, darkMode } = state;
        return {
          questionnaires: JSON.parse(JSON.stringify(questionnaires)),
          interviews: JSON.parse(JSON.stringify(interviews)),
          currentInterviewId,
          darkMode,
        };
      },
    }
  )
);

loadQuestionnaires().then((questionnaires) => {
  questionnaires.forEach((questionnaire) => {
    useStore.getState().addQuestionnaire(questionnaire);
  });
});

export default useStore;
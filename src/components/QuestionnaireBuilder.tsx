import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save, Eye, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import useStore from '../store';
import { calculateHash } from '../utils/validators';

interface Question {
  qid: string;
  text: string;
  desc?: string;
  expected_duration_min: number;
  sample_answer?: string;
}

interface Session {
  session_id: string;
  title: string;
  planned_duration_min: number;
  questions: Question[];
}

interface QuestionnaireData {
  analysis_name: string;
  version: string;
  sessions: Session[];
}

const QuestionnaireBuilder: React.FC = () => {
  const questionnaires = useStore((state) => state.questionnaires);
  const addQuestionnaire = useStore((state) => state.addQuestionnaire);
  
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const handleAddSession = () => {
    setSessions([
      ...sessions,
      {
        session_id: uuidv4(),
        title: `Oturum ${sessions.length + 1}`,
        planned_duration_min: 30,
        questions: [],
      },
    ]);
  };
  
  const handleRemoveSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.session_id !== sessionId));
  };
  
  const handleUpdateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions(
      sessions.map((session) =>
        session.session_id === sessionId
          ? { ...session, ...updates }
          : session
      )
    );
  };
  
  const handleAddQuestion = (sessionId: string) => {
    setSessions(
      sessions.map((session) =>
        session.session_id === sessionId
          ? {
              ...session,
              questions: [
                ...session.questions,
                {
                  qid: uuidv4(),
                  text: '',
                  expected_duration_min: 2,
                },
              ],
            }
          : session
      )
    );
  };
  
  const handleRemoveQuestion = (sessionId: string, questionId: string) => {
    setSessions(
      sessions.map((session) =>
        session.session_id === sessionId
          ? {
              ...session,
              questions: session.questions.filter((q) => q.qid !== questionId),
            }
          : session
      )
    );
  };
  
  const handleUpdateQuestion = (
    sessionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    setSessions(
      sessions.map((session) =>
        session.session_id === sessionId
          ? {
              ...session,
              questions: session.questions.map((question) =>
                question.qid === questionId
                  ? { ...question, ...updates }
                  : question
              ),
            }
          : session
      )
    );
  };
  
  const handleImportQuestion = (
    sessionId: string,
    sourceQuestion: Question
  ) => {
    setSessions(
      sessions.map((session) =>
        session.session_id === sessionId
          ? {
              ...session,
              questions: [
                ...session.questions,
                {
                  ...sourceQuestion,
                  qid: uuidv4(),
                },
              ],
            }
          : session
      )
    );
  };
  
  const handleSave = () => {
    if (!name || sessions.length === 0) return;
    
    const questionnaire: QuestionnaireData = {
      analysis_name: name,
      version,
      sessions,
    };
    
    const hash = calculateHash(questionnaire);
    
    addQuestionnaire({
      json: questionnaire,
      name,
      version,
      createdAt: new Date().toISOString(),
      hash,
    });
    
    setName('');
    setVersion('1.0');
    setSessions([]);
  };

  const getQuestionsFromQuestionnaire = (questionnaire: any) => {
    if (!questionnaire?.json?.sessions) return [];
    return questionnaire.json.sessions.reduce((acc: Question[], session: any) => {
      if (Array.isArray(session.questions)) {
        return [...acc, ...session.questions];
      }
      return acc;
    }, []);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Yeni Soru Seti Oluştur</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Soruları birleştirerek ve düzenleyerek özel bir soru seti oluşturun
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            {showPreview ? 'Düzenle' : 'Önizle'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name || sessions.length === 0}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            Soru Setini Kaydet
          </Button>
        </div>
      </div>
      
      {!showPreview ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Soru Seti Adı
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                    placeholder="Soru seti adını girin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Versiyon</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                    placeholder="1.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.session_id}>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => handleRemoveSession(session.session_id)}
                  >
                    <X size={16} />
                  </Button>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={session.title}
                      onChange={(e) =>
                        handleUpdateSession(session.session_id, {
                          title: e.target.value,
                        })
                      }
                      className="text-xl font-semibold bg-transparent border-none p-0 w-full focus:outline-none"
                      placeholder="Oturum Başlığı"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Süre (dakika):
                      </span>
                      <input
                        type="number"
                        value={session.planned_duration_min}
                        onChange={(e) =>
                          handleUpdateSession(session.session_id, {
                            planned_duration_min: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-20 rounded border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.questions.map((question) => (
                      <div
                        key={question.qid}
                        className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() =>
                            handleRemoveQuestion(session.session_id, question.qid)
                          }
                        >
                          <X size={16} />
                        </Button>
                        <div className="space-y-4">
                          <div>
                            <input
                              type="text"
                              value={question.text}
                              onChange={(e) =>
                                handleUpdateQuestion(
                                  session.session_id,
                                  question.qid,
                                  { text: e.target.value }
                                )
                              }
                              className="w-full bg-transparent border-none p-0 font-medium focus:outline-none"
                              placeholder="Soru metni"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                value={question.desc || ''}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    session.session_id,
                                    question.qid,
                                    { desc: e.target.value }
                                  )
                                }
                                className="w-full bg-transparent border-none p-0 text-sm text-gray-500 dark:text-gray-400 focus:outline-none"
                                placeholder="Açıklama (opsiyonel)"
                              />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Süre (dk):
                              </span>
                              <input
                                type="number"
                                value={question.expected_duration_min}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    session.session_id,
                                    question.qid,
                                    {
                                      expected_duration_min: parseInt(
                                        e.target.value,
                                        10
                                      ),
                                    }
                                  )
                                }
                                className="w-20 rounded border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-zinc-900"
                              />
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={question.sample_answer || ''}
                              onChange={(e) =>
                                handleUpdateQuestion(
                                  session.session_id,
                                  question.qid,
                                  { sample_answer: e.target.value }
                                )
                              }
                              className="w-full bg-transparent border-none p-0 text-sm italic text-gray-500 dark:text-gray-400 focus:outline-none"
                              placeholder="Örnek cevap (opsiyonel)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleAddQuestion(session.session_id)}
                        className="flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Soru Ekle
                      </Button>
                      <select
                        onChange={(e) => {
                          const [questionnaireHash, questionId] = e.target.value.split('|');
                          const questionnaire = questionnaires[questionnaireHash];
                          const questions = getQuestionsFromQuestionnaire(questionnaire);
                          const sourceQuestion = questions.find((q) => q.qid === questionId);
                          
                          if (sourceQuestion) {
                            handleImportQuestion(session.session_id, sourceQuestion);
                          }
                          
                          e.target.value = '';
                        }}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-zinc-900"
                      >
                        <option value="">Mevcut sorudan içe aktar...</option>
                        {Object.entries(questionnaires).map(([hash, q]) => {
                          const questions = getQuestionsFromQuestionnaire(q);
                          if (questions.length === 0) return null;
                          
                          return (
                            <optgroup key={hash} label={q.name}>
                              {questions.map((question) => (
                                <option
                                  key={question.qid}
                                  value={`${hash}|${question.qid}`}
                                >
                                  {question.text}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={handleAddSession}
              className="w-full flex items-center gap-2 justify-center"
            >
              <Plus size={16} />
              Oturum Ekle
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{name || 'İsimsiz Soru Seti'}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Versiyon {version}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {sessions.map((session) => (
                <div key={session.session_id}>
                  <h3 className="text-lg font-semibold mb-2">
                    {session.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Süre: {session.planned_duration_min} dakika
                  </p>
                  <div className="space-y-4">
                    {session.questions.map((question, index) => (
                      <div
                        key={question.qid}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {index + 1}. {question.text}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {question.expected_duration_min} dk
                          </span>
                        </div>
                        {question.desc && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {question.desc}
                          </p>
                        )}
                        {question.sample_answer && (
                          <p className="text-sm italic text-gray-500 dark:text-gray-400">
                            Örnek: {question.sample_answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionnaireBuilder;
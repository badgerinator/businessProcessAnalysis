import Ajv from 'ajv';
import SHA256 from 'crypto-js/sha256';

// Define the JSON schema for questionnaires
const questionnaireSchema = {
  type: 'object',
  required: ['analysis_name', 'version', 'sessions'],
  properties: {
    analysis_name: { type: 'string' },
    version: { type: 'string' },
    sessions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['session_id', 'title', 'planned_duration_min'],
        properties: {
          session_id: { type: 'string' },
          title: { type: 'string' },
          planned_duration_min: { type: 'number' },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['qid', 'text', 'expected_duration_min'],
              properties: {
                qid: { type: 'string' },
                text: { type: 'string' },
                desc: { type: 'string' },
                expected_duration_min: { type: 'number' },
                sample_answer: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

const ajv = new Ajv();

export const validateQuestionnaire = (json: any): { valid: boolean; errors: any } => {
  const validate = ajv.compile(questionnaireSchema);
  const valid = validate(json);
  return {
    valid: !!valid,
    errors: validate.errors,
  };
};

export const calculateHash = (json: any): string => {
  return SHA256(JSON.stringify(json)).toString();
};

export const calculateTotalDuration = (json: any): number => {
  if (!json?.sessions) return 0;
  
  return json.sessions.reduce((total: number, session: any) => {
    return total + (session.planned_duration_min || 0);
  }, 0);
};

export const formatTime = (ms: number): string => {
  if (!ms || ms < 0) return '00:00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
};

export const calculateProgress = (interview: any): number => {
  if (!interview?.sessions) return 0;
  
  let completedQuestions = 0;
  let totalQuestions = 0;
  
  Object.values(interview.sessions).forEach((session: any) => {
    if (!session?.questions) return;
    
    Object.values(session.questions).forEach((question: any) => {
      totalQuestions++;
      if (question && typeof question === 'object' && 'answer' in question) {
        const answer = question.answer;
        if (answer !== null && answer !== undefined && answer.trim?.() !== '') {
          completedQuestions++;
        }
      }
    });
  });
  
  return totalQuestions === 0 ? 0 : Math.round((completedQuestions / totalQuestions) * 100);
};

export const getTimeColor = (elapsed: number, planned: number): string => {
  if (!planned || planned <= 0) return 'text-gray-500';
  
  const percentage = (elapsed / (planned * 60 * 1000)) * 100;
  
  if (percentage <= 90) return 'text-green-500';
  if (percentage <= 110) return 'text-yellow-500';
  return 'text-red-500';
};

export const validateTimeData = (time: number): number => {
  return typeof time === 'number' && time >= 0 ? time : 0;
};
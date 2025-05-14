import { v4 as uuidv4 } from 'uuid';
import { calculateHash } from './validators';
import { Questionnaire } from '../types';

// Load all questionnaires from the questionnaires directory
export async function loadQuestionnaires(): Promise<Questionnaire[]> {
  const questionnaires: Questionnaire[] = [];
  
  try {
    // Import the HR interview questionnaire
    const hrInterview = await import('../questionnaires/hr-interview.json');
    
    // Create questionnaire objects
    const questionnaires: Questionnaire[] = [
      {
        json: hrInterview,
        name: hrInterview.analysis_name,
        version: hrInterview.version,
        createdAt: new Date().toISOString(),
        hash: calculateHash(hrInterview),
      }
    ];
    
    return questionnaires;
  } catch (error) {
    console.error('Error loading questionnaires:', error);
    return [];
  }
}

// Save a new questionnaire
export function saveQuestionnaire(questionnaire: any): Questionnaire {
  const hash = calculateHash(questionnaire);
  
  return {
    json: questionnaire,
    name: questionnaire.analysis_name,
    version: questionnaire.version,
    createdAt: new Date().toISOString(),
    hash,
  };
}

// Export a questionnaire to JSON file
export function exportQuestionnaire(questionnaire: Questionnaire): string {
  return JSON.stringify(questionnaire.json, null, 2);
}
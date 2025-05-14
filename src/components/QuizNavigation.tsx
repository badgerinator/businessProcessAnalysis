import React from 'react';
import { ChevronRight, ChevronDown, Circle, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface Question {
  qid: string;
  text: string;
}

interface Section {
  session_id: string;
  title: string;
  questions: Question[];
}

interface QuizNavigationProps {
  sections: Section[];
  currentSectionId: string;
  currentQuestionId: string;
  completedQuestions: Set<string>;
  onNavigate: (sectionId: string, questionId: string) => void;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  sections,
  currentSectionId,
  currentQuestionId,
  completedQuestions,
  onNavigate,
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set([currentSectionId])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="w-64 h-full overflow-y-auto bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Mülakat Navigasyonu</h2>
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.session_id} className="space-y-1">
              <button
                onClick={() => toggleSection(section.session_id)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm font-medium transition-colors",
                  currentSectionId === section.session_id
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {expandedSections.has(section.session_id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                {section.title}
              </button>
              
              {expandedSections.has(section.session_id) && (
                <div className="ml-6 space-y-1">
                  {section.questions.map((question, index) => (
                    <button
                      key={question.qid}
                      onClick={() => onNavigate(section.session_id, question.qid)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                        currentQuestionId === question.qid
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {completedQuestions.has(question.qid) ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Circle size={16} className="text-gray-400" />
                      )}
                      Soru {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizNavigation;
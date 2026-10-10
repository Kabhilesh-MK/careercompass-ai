import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  Flag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import {
  DEMO_ASSESSMENT_TOPICS,
  DEMO_SQL_QUESTIONS,
} from '@/data/assessmentQuestions';
import {
  ProgressBar,
  StatusBadge,
  SkillRing,
} from '@/components/design-system';
import { useAssessment } from '@/hooks/useAssessment';

export default function SkillAssessmentPage() {
  const navigate = useNavigate();
  const { assessments, saveAssessmentResult } = useAssessment();

  const [selectedTopicId, setSelectedTopicId] = useState('sql');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

  const questions = DEMO_SQL_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestionIndex)) {
        next.delete(currentQuestionIndex);
      } else {
        next.add(currentQuestionIndex);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  // Calculate results
  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionId) {
        correct += 1;
      }
    });
    const percentage = Math.round((correct / totalQuestions) * 100);
    return {
      correct,
      total: totalQuestions,
      percentage,
      skillLevel:
        percentage >= 80 ? 'Advanced' : percentage >= 60 ? 'Proficient' : 'Developing',
    };
  };

  const results = isFinished ? calculateResults() : null;

  const handleFinish = () => {
    const res = calculateResults();
    const topicName = DEMO_ASSESSMENT_TOPICS.find((t) => t.id === selectedTopicId)?.title || 'SQL';
    saveAssessmentResult({
      id: `asm-${selectedTopicId}-${Date.now()}`,
      skillId: selectedTopicId === 'sql' ? 'sk-sql' : selectedTopicId === 'python' ? 'sk-py' : 'sk-ml',
      skillName: topicName,
      answers: Object.fromEntries(Object.entries(selectedAnswers).map(([k, v]) => [String(k), v])),
      score: res.percentage,
      totalQuestions: res.total,
      correctCount: res.correct,
      skillLevel: (res.percentage >= 80 ? 'Advanced' : res.percentage >= 60 ? 'Intermediate' : 'Beginner') as any,
      completedAt: new Date().toISOString(),
      derivedProficiency: res.percentage,
      strongAreas: ['Core Syntax & Constraints', 'Relational Filtering', 'Aggregations'],
      weakAreas: res.percentage < 80 ? ['Advanced Window Functions', 'Execution Planning'] : [],
      recommendedAction: 'Continue with Advanced Query Optimization in Learning Hub'
    });
    setIsFinished(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Skill Assessment
            </h1>
            <StatusBadge label="Diagnostic Engine" size="xs" variant="primary" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Test and verify specific technical competencies through standardized diagnostic questions.
          </p>
        </div>

        {/* Topic Selector */}
        {!isFinished && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-gray-400">Skill:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setFlaggedQuestions(new Set());
              }}
              className="text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 font-bold"
            >
              {DEMO_ASSESSMENT_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title} ({topic.questionCount} Qs)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-5">
          {/* Progress bar & Question Counter */}
          <div className="card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                <ClipboardCheck size={15} className="text-primary" />
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-gray-500 dark:text-slate-400">
                {answeredCount} answered • {flaggedQuestions.size} flagged
              </span>
            </div>
            <ProgressBar
              value={currentQuestionIndex + 1}
              max={totalQuestions}
              size="sm"
              variant="primary"
            />
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="card p-6 sm:p-8 space-y-6"
          >
            {/* Meta tags */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge label={currentQuestion.topic} size="xs" variant="primary" />
                <StatusBadge label={currentQuestion.difficulty} size="xs" variant="neutral" />
              </div>

              <button
                type="button"
                onClick={handleToggleFlag}
                className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition ${
                  flaggedQuestions.has(currentQuestionIndex)
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <Flag size={13} fill={flaggedQuestions.has(currentQuestionIndex) ? 'currentColor' : 'none'} />
                <span>{flaggedQuestions.has(currentQuestionIndex) ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Stem */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 leading-snug">
                {currentQuestion.stem}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 text-xs sm:text-sm ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-200 font-semibold shadow-sm'
                        : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 mt-0.5 uppercase font-bold ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-slate-700 text-gray-500'
                      }`}
                    >
                      {option.id}
                    </span>
                    <span className="leading-relaxed">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={handlePrev}
                className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 disabled:opacity-40"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="btn-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 font-bold shadow-glow"
                  >
                    <CheckCircle2 size={14} />
                    <span>Finish Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Results View */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="card p-8 text-center space-y-5 bg-gradient-to-b from-[#111827] to-[#151D33] border-primary/30">
            <div className="flex justify-center">
              <SkillRing
                value={results?.percentage || 0}
                size={120}
                sublabel={results?.skillLevel}
                color={
                  (results?.percentage || 0) >= 80
                    ? '#10B981'
                    : (results?.percentage || 0) >= 60
                    ? '#6366F1'
                    : '#F59E0B'
                }
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                Assessment Completed!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                You answered {results?.correct} out of {results?.total} questions correctly ({results?.percentage}%).
              </p>
            </div>

            <div className="p-3 max-w-lg mx-auto rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-gray-400">
              Verified level: <strong className="text-slate-200">{results?.skillLevel}</strong>. Your profile proficiency and skill gap scores have been updated locally in demo state.
            </div>

            {/* Breakdown areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto pt-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  Strong Areas Identified
                </span>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  Window functions, aggregations, and subquery logic.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  Recommended Review Areas
                </span>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  Query execution plans and multi-column index design.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsFinished(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                  setFlaggedQuestions(new Set());
                }}
                className="btn-outline text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Retake Assessment</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/skills/gap')}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-semibold"
              >
                <span>Check Updated Skill Gap</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

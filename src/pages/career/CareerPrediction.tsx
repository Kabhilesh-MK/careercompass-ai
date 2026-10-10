import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  Sparkles,
  GitCompare,
  GitBranch,
  Map,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  RotateCcw,
  Check,
  Plus,
  X,
  Server,
  Cpu,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from 'lucide-react';
import {
  StatusBadge,
  ProgressBar,
} from '@/components/design-system';
import { useAppState } from '@/hooks/useAppState';
import {
  getCareerSkillVocabulary,
  predictCareer,
  explainCareerPrediction,
  CareerPredictionResponse,
  CareerExplanationResponse,
  FeatureContribution,
  MlInferenceError,
  getApiBaseUrl,
} from '@/services/api/mlInference';
import { evaluateCareerIntelligence } from '@/services/api/careerIntelligence';

export default function CareerPredictionPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  // Canonical Vocabulary State
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [vocabModelVersion, setVocabModelVersion] = useState<string>('phase3.4');
  const [isVocabLoading, setIsVocabLoading] = useState(true);
  const [vocabError, setVocabError] = useState<string | null>(null);

  // Selected Skills State (string array sent directly to API)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');

  // ML Inference State
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [predictionResponse, setPredictionResponse] = useState<CareerPredictionResponse | null>(null);

  // ML Explanation State (Phase 4 Decoupled Flow)
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [explanationResponse, setExplanationResponse] = useState<CareerExplanationResponse | null>(null);

  // Load canonical 29-skill vocabulary from FastAPI backend on mount
  const fetchVocabulary = async () => {
    setIsVocabLoading(true);
    setVocabError(null);
    try {
      const res = await getCareerSkillVocabulary();
      setVocabulary(res.skills);
      if (res.model_version) setVocabModelVersion(res.model_version);
    } catch (err: any) {
      const msg =
        err instanceof MlInferenceError
          ? err.userMessage
          : 'Unable to load skill vocabulary from ML backend service. Please verify the service is running.';
      setVocabError(msg);
    } finally {
      setIsVocabLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, []);

  // Filtered vocabulary skills based on search
  const filteredVocabulary = useMemo(() => {
    if (!skillSearchQuery.trim()) return vocabulary;
    const query = skillSearchQuery.toLowerCase().trim();
    return vocabulary.filter((skill) =>
      skill.toLowerCase().includes(query) || skill.replace(/_/g, ' ').includes(query)
    );
  }, [vocabulary, skillSearchQuery]);

  // Skill toggling
  const handleToggleSkill = (skillToken: string) => {
    const normalized = skillToken.trim().toLowerCase();
    if (selectedSkills.includes(normalized)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== normalized));
    } else {
      setSelectedSkills((prev) => [...prev, normalized]);
    }
    // Clear previous prediction error when modifying skills
    if (predictionError) setPredictionError(null);
  };

  // Add custom skill (for testing unknown skills or freeform inputs)
  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = customSkillInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!token) return;
    if (!selectedSkills.includes(token)) {
      setSelectedSkills((prev) => [...prev, token]);
    }
    setCustomSkillInput('');
    if (predictionError) setPredictionError(null);
  };

  // Quick preset loader (useful for testing and deterministic evaluation)
  const applyPreset = (skills: string[]) => {
    setSelectedSkills(skills);
    if (predictionError) setPredictionError(null);
  };

  // Sync with profile skills
  const syncWithProfileSkills = () => {
    const profileTokens: string[] = [];
    state.skills.forEach((sk) => {
      const token = sk.name.toLowerCase().replace(/\s+/g, '_');
      if (token && !profileTokens.includes(token)) {
        profileTokens.push(token);
      }
    });
    if (profileTokens.length > 0) {
      setSelectedSkills(profileTokens);
    }
    if (predictionError) setPredictionError(null);
  };

  // Fetch local prediction explanation (Phase 4 decoupled operation)
  const fetchExplanation = async (skillsToExplain: string[]) => {
    setIsExplaining(true);
    setExplanationError(null);
    try {
      const exp = await explainCareerPrediction(skillsToExplain);
      setExplanationResponse(exp);
    } catch (err: unknown) {
      const msg =
        err instanceof MlInferenceError
          ? err.userMessage
          : 'Prediction available. Model explanation could not be loaded.';
      setExplanationError(msg || 'Prediction available. Model explanation could not be loaded.');
      // Keep prediction intact!
    } finally {
      setIsExplaining(false);
    }
  };

  // Perform dynamic ML prediction via FastAPI
  const handleRunPrediction = async () => {
    if (selectedSkills.length === 0) {
      setPredictionError('Please select or enter at least one skill before requesting a prediction.');
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);
    setExplanationResponse(null);
    setExplanationError(null);

    let predSuccessful = false;
    let submittedSkillsCopy: string[] = [];

    try {
      const response = await predictCareer(selectedSkills);
      setPredictionResponse(response);
      predSuccessful = true;
      submittedSkillsCopy = [...selectedSkills];

      // Record prediction in persistent state history
      const topProbRounded = Math.round(response.prediction.probability * 100);
      dispatch({
        type: 'RECORD_PREDICTION',
        payload: {
          id: `pred-ml-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          predictedCareer: response.prediction.career_track,
          confidenceEstimate: topProbRounded,
          assessmentVersion: response.model.version || 'phase3.4',
          skillProfileVersion: 'live-api',
          whatChanged: [
            `Live inference from ${response.input.recognized_skills.length} recognized skills`,
            ...(response.input.unknown_skills.length > 0
              ? [`${response.input.unknown_skills.length} unknown skill(s) excluded from model input`]
              : []),
          ],
          alternativeTracks: response.alternatives.map((alt) => ({
            name: alt.career_track,
            probability: Math.round(alt.probability * 100),
          })),
          probabilities: response.probabilities.map((p) => ({
            career_track: p.career_track,
            probability: p.probability,
          })),
          isRealMl: true,
          submittedSkills: selectedSkills,
          recognizedSkills: response.input.recognized_skills,
          unknownSkills: response.input.unknown_skills,
          modelType: response.model.model_type,
          featureConfiguration: response.model.feature_configuration,
        },
      });

      // Synchronize career intelligence in background for seamless navigation to gap & roadmap
      evaluateCareerIntelligence({
        skills: selectedSkills,
        target_career_track: response.prediction.career_track,
      })
        .then((intelRes) => {
          dispatch({
            type: 'SET_CAREER_INTELLIGENCE',
            payload: { intelligence: intelRes, selectedSkills },
          });
        })
        .catch(() => {});
    } catch (err: unknown) {
      const msg =
        err instanceof MlInferenceError
          ? err.userMessage
          : 'Career prediction is temporarily unavailable. Please make sure the ML service is running and try again.';
      setPredictionError(msg);
      // STRICT POLICY: NEVER fall back to mock prediction data
      setPredictionResponse(null);
    } finally {
      setIsPredicting(false);
    }

    // Phase 4 Decoupled Flow: Request explanation after prediction renders
    if (predSuccessful && submittedSkillsCopy.length > 0) {
      fetchExplanation(submittedSkillsCopy);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header System */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Career Prediction
            </h1>
            <StatusBadge label="FastAPI ML Candidate H" variant="primary" size="xs" dot />
            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
              Random Forest · 29 Skills
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Dynamic career track inference powered by the serialized Phase 3.4.1 Random Forest model through FastAPI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/predictions/history')}
            className="btn-outline text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
            id="prediction-audit-trail-btn"
          >
            <Clock size={13} />
            <span>Prediction Audit Trail</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SKILL SELECTION & VOCABULARY INTEGRATION */}
      <div className="card p-6 space-y-5 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-300 flex items-center gap-1.5">
                <Layers size={15} />
                Step 1: Skill Input Selection
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-medium">
                {selectedSkills.length} selected
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Select student skills. Skills are passed to the ML inference service as binary presence indicators.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset(['python', 'ai', 'programming'])}
              className="text-[11px] px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
              title="Test A: Python, AI, Programming"
            >
              Test A (AI/ML)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(['python', 'web_development', 'database_systems'])}
              className="text-[11px] px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
              title="Test B: Python, Web Development, Database Systems"
            >
              Test B (SWE)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(['excel', 'communication', 'critical_thinking'])}
              className="text-[11px] px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
              title="Test C: Excel, Communication, Critical Thinking"
            >
              Test C (Data/BI)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(['python', 'unknown_skill_xyz'])}
              className="text-[11px] px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-medium transition-colors"
              title="Test D: Python + Unknown Skill"
            >
              Test D (Unknown)
            </button>
            {state.skills.length > 0 && (
              <button
                type="button"
                onClick={syncWithProfileSkills}
                className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium transition-colors"
              >
                Sync Profile
              </button>
            )}
            {selectedSkills.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSkills([])}
                className="text-[11px] px-2 py-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Vocabulary Loading / Error / Content */}
        {isVocabLoading ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Retrieving canonical 29-skill vocabulary from FastAPI backend...
            </p>
          </div>
        ) : vocabError ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">FastAPI Service Unavailable</h4>
                <p className="text-xs text-rose-600 dark:text-rose-400">{vocabError}</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Target Endpoint: {getApiBaseUrl()}/api/v1/predictions/career/skills
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchVocabulary}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-500 text-white font-semibold flex items-center gap-1.5 hover:bg-rose-600 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Retry Fetching Vocabulary</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search & Custom Input Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  placeholder="Filter model vocabulary (e.g. python, machine_learning, sql)..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  id="skill-search-input"
                />
              </div>

              <form onSubmit={handleAddCustomSkill} className="md:col-span-5 flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Enter custom skill token..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  id="custom-skill-input"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSkill()}
                  className="btn-outline text-xs px-3 py-2 rounded-xl flex items-center gap-1 font-semibold shrink-0"
                  id="add-custom-skill-btn"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Canonical Skills Selector Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
                <span>
                  Canonical Vocabulary ({vocabulary.length} recognized skills · {vocabModelVersion}):
                </span>
                <span>Click to toggle</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                {filteredVocabulary.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono transition-all ${
                        isSelected
                          ? 'bg-primary text-white font-semibold shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-primary/50'
                      }`}
                      id={`skill-chip-${skill}`}
                    >
                      {isSelected ? <Check size={12} /> : null}
                      <span>{skill}</span>
                    </button>
                  );
                })}
                {filteredVocabulary.length === 0 && (
                  <p className="text-xs text-gray-400 p-2">No matching canonical skills found.</p>
                )}
              </div>
            </div>

            {/* Currently Selected Skills Display */}
            {selectedSkills.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider block">
                  Active Skill Vector ({selectedSkills.length} tokens ready for submission):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((skill) => {
                    const isCanonical = vocabulary.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`text-xs pl-2.5 pr-1.5 py-0.5 rounded-lg flex items-center gap-1 font-mono ${
                          isCanonical
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        <span>{skill}</span>
                        {!isCanonical && (
                          <span
                            className="text-[9px] px-1 rounded bg-amber-500/20 uppercase font-sans font-bold"
                            title="Not in 29-feature vocabulary"
                          >
                            unknown
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className="hover:opacity-75 p-0.5 rounded"
                          title="Remove skill"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trigger Button & Validation Error */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Binary presence encoding will evaluate selected skills against candidate models.
              </div>

              <button
                type="button"
                onClick={handleRunPrediction}
                disabled={isPredicting || isVocabLoading || selectedSkills.length === 0}
                className="btn-primary text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-glow disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                id="run-career-prediction-btn"
              >
                {isPredicting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Selected Skills...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Run ML Career Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PREDICTION ERROR STATE */}
      {predictionError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 space-y-2"
          id="prediction-error-card"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold">Prediction Request Failed</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                {predictionError}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Endpoint: POST {getApiBaseUrl()}/api/v1/predictions/career
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 3: PREDICTION LOADING STATE */}
      {isPredicting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center space-y-4 border-primary/30 bg-gradient-to-b from-[#111827] to-[#151D33]"
        >
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Evaluating Skill Vectors with Random Forest Classifier...
            </h3>
            <p className="text-xs text-gray-400">
              Generating dynamic class probabilities across 4 canonical career tracks using Candidate H model.
            </p>
          </div>
        </motion.div>
      )}

      {/* SECTION 4: REAL PREDICTION RESULT */}
      {predictionResponse && !isPredicting && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
            id="ml-prediction-results"
          >
            {/* Unknown Skills Alert Banner (Non-blocking) */}
            {predictionResponse.input.unknown_skills.length > 0 && (
              <div
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 space-y-2"
                id="unknown-skills-banner"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Unknown Skills Detected ({predictionResponse.input.unknown_skills.length})
                    </h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                      These skills are not currently part of the ML model vocabulary and did not influence the prediction:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {predictionResponse.input.unknown_skills.map((unk) => (
                        <span
                          key={unk}
                          className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-medium"
                        >
                          {unk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Prediction Summary Card */}
            <div className="card p-6 lg:p-8 bg-gradient-to-br from-[#111827] via-[#151D33] to-[#111827] border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-300 flex items-center gap-1.5">
                    <Compass size={16} />
                    Primary Predicted Track
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 dark:text-slate-400">
                      Engine: {predictionResponse.model.version} ({predictionResponse.model.model_type})
                    </span>
                    <StatusBadge label="REAL ML INFERENCE" variant="primary" size="xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight"
                    id="primary-prediction-title"
                  >
                    {predictionResponse.prediction.career_track}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                    Evaluated against {predictionResponse.input.recognized_skills.length} recognized skills:{' '}
                    <span className="font-mono text-primary-300">
                      {predictionResponse.input.recognized_skills.join(', ')}
                    </span>
                    .
                  </p>
                </div>

                {/* Metric cards bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">
                      Model-predicted probability
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span
                        className="text-2xl font-black text-primary"
                        id="primary-prediction-probability"
                      >
                        {(predictionResponse.prediction.probability * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-gray-400">Random Forest Class Probability</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">
                      Recognized Skills Count
                    </span>
                    <span className="text-lg font-bold text-emerald-500 mt-0.5 block">
                      {predictionResponse.input.recognized_skills.length} / 29 Features Active
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">
                      Inference Framework
                    </span>
                    <span className="text-lg font-bold text-cyan-400 mt-0.5 block">
                      FastAPI + scikit-learn
                    </span>
                  </div>
                </div>

                {/* Explanatory calibration note */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-gray-400 flex items-start gap-2">
                  <Info size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    These values are model-predicted probabilities from the current CareerCompass ML model and are not
                    calibrated confidence scores.
                  </span>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/career/explorer')}
                    className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 font-semibold shadow-glow"
                  >
                    <Search size={14} />
                    <span>Explore Career Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/career/compare')}
                    className="btn-outline text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 font-semibold"
                  >
                    <GitCompare size={14} />
                    <span>Compare Alternative Tracks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/skills/gap')}
                    className="btn-outline text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 font-semibold"
                  >
                    <GitBranch size={14} />
                    <span>View Target Skill Gap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/roadmap')}
                    className="btn-secondary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 font-semibold ml-auto"
                  >
                    <Map size={14} />
                    <span>Build Roadmap</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4.5: MODEL EXPLAINABILITY / WHY DID THE MODEL PREDICT THIS? */}
            <div
              className="card p-6 lg:p-8 space-y-6 border-primary/30 bg-gradient-to-br from-[#111827] via-[#151D33] to-[#111827] relative overflow-hidden"
              id="model-explanation-section"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-primary" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight" id="explanation-title">
                      Why did the model predict this?
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Feature-level attribution decomposing the Random Forest decision for{' '}
                    <span className="font-semibold text-primary-300">
                      {predictionResponse.prediction.career_track}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={explanationResponse ? `Method: ${explanationResponse.explanation_method}` : 'TreeExplainer'}
                    variant="primary"
                    size="xs"
                  />
                  <span className="text-[11px] font-mono text-gray-400 dark:text-slate-400">
                    Model Attribution
                  </span>
                </div>
              </div>

              {/* Scientific & Non-Causal Standard Warning */}
              <div
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                id="explanation-scientific-disclaimer"
              >
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Model-attributed skills:</strong> These feature contributions describe how the trained model responded to your selected skills. They do not establish causation.
                </span>
              </div>

              {/* Loading State */}
              {isExplaining && (
                <div
                  className="p-6 text-center space-y-3 rounded-2xl bg-slate-900/40 border border-slate-800"
                  id="explanation-loading-state"
                >
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-400">
                    Computing model feature contributions with TreeExplainer...
                  </p>
                </div>
              )}

              {/* Error State */}
              {explanationError && !isExplaining && (
                <div
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-2"
                  id="explanation-error-state"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-semibold">
                        Prediction available. Model explanation could not be loaded.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchExplanation(selectedSkills)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      <span>Retry</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-500/80 pl-6">
                    {explanationError}
                  </p>
                </div>
              )}

              {/* Success State: Live Real Model Attribution */}
              {explanationResponse && !isExplaining && (
                <div className="space-y-6" id="explanation-results">
                  {/* Selected Input Skills Contribution Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 flex items-center justify-between">
                      <span>Model Response to Selected Skills ({predictionResponse.input.recognized_skills.length} Active)</span>
                      <span className="text-[11px] font-normal normal-case text-gray-500">
                        Direction and probability delta toward predicted track
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="selected-skills-attribution-grid">
                      {explanationResponse.features
                        .filter((f) => f.present)
                        .map((feat) => {
                          const isPositive = feat.contribution > 0;
                          const isNegative = feat.contribution < 0;
                          return (
                            <div
                              key={feat.skill}
                              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                              id={`feature-present-${feat.skill}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-white capitalize">
                                  {feat.skill.replace(/_/g, ' ')}
                                </span>
                                <span
                                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                    isPositive
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : isNegative
                                      ? 'bg-rose-500/20 text-rose-400'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {feat.contribution > 0
                                    ? `+${(feat.contribution * 100).toFixed(2)}%`
                                    : `${(feat.contribution * 100).toFixed(2)}%`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {isPositive ? (
                                  <TrendingUp size={13} className="text-emerald-400" />
                                ) : isNegative ? (
                                  <TrendingDown size={13} className="text-rose-400" />
                                ) : (
                                  <Minus size={13} className="text-slate-400" />
                                )}
                                <span
                                  className={
                                    isPositive
                                      ? 'text-emerald-400/90'
                                      : isNegative
                                      ? 'text-rose-400/90'
                                      : 'text-slate-400'
                                  }
                                >
                                  {isPositive
                                    ? 'Positively supports this track'
                                    : isNegative
                                    ? 'Reduces probability for this track'
                                    : 'Neutral model effect'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Top Influential Features Across the Entire 29-Skill Vocabulary */}
                  <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                        Top Influential Model Features
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Ranked by absolute contribution magnitude (|SHAP|)
                      </span>
                    </div>

                    <div className="space-y-2" id="top-influential-features-list">
                      {explanationResponse.features.slice(0, 8).map((feat, idx) => {
                        const isPositive = feat.contribution > 0;
                        const isNegative = feat.contribution < 0;
                        const absMagnitude = Math.abs(feat.contribution);
                        const barWidth = Math.min(100, Math.round((absMagnitude / 0.12) * 100));

                        return (
                          <div
                            key={`${feat.skill}-${idx}`}
                            className="p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 transition-colors space-y-1.5"
                            id={`top-feature-${feat.skill}`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-4 font-mono text-[10px] text-gray-500">
                                  {idx + 1}.
                                </span>
                                <span className="font-mono text-slate-200">
                                  {feat.skill}
                                </span>
                                {feat.present ? (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary-300 font-semibold">
                                    Selected Skill
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-500">
                                    Model Baseline
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 capitalize">
                                  {feat.direction === 'supports'
                                    ? 'Supports'
                                    : feat.direction === 'opposes'
                                    ? 'Opposes'
                                    : 'Neutral'}
                                </span>
                                <span
                                  className={`font-mono font-bold ${
                                    isPositive
                                      ? 'text-emerald-400'
                                      : isNegative
                                      ? 'text-rose-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {feat.contribution > 0
                                    ? `+${feat.contribution.toFixed(4)}`
                                    : feat.contribution.toFixed(4)}
                                </span>
                              </div>
                            </div>

                            {/* Magnitude visual bar */}
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isPositive
                                    ? 'bg-emerald-500'
                                    : isNegative
                                    ? 'bg-rose-500'
                                    : 'bg-slate-600'
                                }`}
                                style={{ width: `${Math.max(5, barWidth)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Distribution & Technical Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* All Four Career Tracks Ranked */}
              <div className="lg:col-span-7 card p-6 space-y-4" id="all-four-tracks-distribution">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                      All 4 Career Tracks Distribution
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Ranked in backend probability order from FastAPI ML inference
                    </p>
                  </div>
                  <StatusBadge label="Backend Ranked" size="xs" variant="primary" />
                </div>

                <div className="space-y-3 pt-2">
                  {predictionResponse.probabilities.map((track, idx) => {
                    const probPercent = Number((track.probability * 100).toFixed(1));
                    return (
                      <div key={track.career_track} className="space-y-1" id={`track-item-${idx}`}>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 text-gray-400 font-mono text-[11px]">{idx + 1}.</span>
                            <span className="font-semibold text-gray-700 dark:text-slate-200">
                              {track.career_track}
                            </span>
                            {idx === 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                                Top Pick
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-gray-900 dark:text-slate-100">
                            {probPercent.toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar
                          value={probPercent}
                          size="sm"
                          variant={idx === 0 ? 'primary' : probPercent >= 30 ? 'accent' : 'secondary'}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-400 flex items-start gap-2">
                  <Info size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Uncalibrated Random Forest model-predicted probabilities. Probabilities represent relative leaf vote
                    distributions across 300 estimators.
                  </span>
                </div>
              </div>

              {/* Technical Model Governance & Input Audit */}
              <div className="lg:col-span-5 card p-6 space-y-4 flex flex-col justify-between" id="model-governance-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                        <Cpu size={15} className="text-primary" />
                        Model Governance
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Active Phase 3.4.1 runtime metadata
                      </p>
                    </div>
                    <Server size={16} className="text-gray-400" />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-slate-800/60">
                      <span className="text-gray-500 dark:text-slate-400">Algorithm Family</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">
                        {predictionResponse.model.model_type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-slate-800/60">
                      <span className="text-gray-500 dark:text-slate-400">Model Release</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200 font-mono">
                        {predictionResponse.model.version}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-slate-800/60">
                      <span className="text-gray-500 dark:text-slate-400">Feature Mode</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">
                        {predictionResponse.model.feature_configuration} (29 binary skills)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-slate-800/60">
                      <span className="text-gray-500 dark:text-slate-400">Decision Threshold</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">
                        Argmax (top probability)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500 dark:text-slate-400">Calibration Status</span>
                      <span className="font-semibold text-amber-500">
                        Uncalibrated (raw tree votes)
                      </span>
                    </div>
                  </div>

                  {/* Recognized Skills Summary */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Recognized Input Features ({predictionResponse.input.recognized_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {predictionResponse.input.recognized_skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-gray-400">
                  <span>FastAPI HTTP Inferences Verified</span>
                  <button
                    type="button"
                    onClick={() => navigate('/predictions/history')}
                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Audit Trail</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

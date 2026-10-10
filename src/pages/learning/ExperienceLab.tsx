import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  StatusBadge,
  SkillTag,
  ProgressBar,
  SimulationCard,
} from '@/components/design-system';
import { Simulation, SimulationTask } from '@/types/careerCompass';
import { useLearning } from '@/hooks/useLearning';

export default function ExperienceLabPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedId = searchParams.get('id');
  const { simulations, startSimulation, completeSimulationTask, completeSimulation } = useLearning();

  const [activeSimulation, setActiveSimulation] = useState<Simulation | null>(
    requestedId
      ? simulations.find((s) => s.id === requestedId) || simulations[0]
      : null
  );

  const [activeStep, setActiveStep] = useState<number>(0); // 0 = Intro, 1..N = Tasks, N+1 = Submission, N+2 = Completion
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    new Set(['c-task-1', 'c-task-2'])
  );
  const [submissionFile, setSubmissionFile] = useState<string | null>(null);

  const handleStartSimulation = (sim: Simulation) => {
    startSimulation(sim.id);
    setActiveSimulation(sim);
    setActiveStep(1); // Jump to Task 1
  };

  const handleCompleteCurrentTask = (taskId: string) => {
    setCompletedTaskIds((prev) => new Set([...prev, taskId]));
    if (activeSimulation) {
      completeSimulationTask(activeSimulation.id, taskId);
    }
    if (activeSimulation && activeStep < activeSimulation.tasks.length) {
      setActiveStep((s) => s + 1);
    } else {
      if (activeSimulation) completeSimulation(activeSimulation.id);
      setActiveStep((s) => s + 1); // Move to submission step
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Experience Lab
            </h1>
            <StatusBadge label="Job Simulations V2" size="xs" variant="accent" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Work on authentic enterprise job simulations provided by industry practice partners.
          </p>
        </div>

        {activeSimulation && (
          <button
            type="button"
            onClick={() => setActiveSimulation(null)}
            className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
          >
            <ArrowLeft size={14} />
            <span>All Simulations</span>
          </button>
        )}
      </div>

      {!activeSimulation ? (
        /* Catalog of Simulations */
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-[#111827] border-accent/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                Enterprise Experience Simulation
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                Cognizant AI & Machine Learning Consultant Simulation
              </h2>
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                Step into the shoes of a data science consultant. Conduct exploratory analysis, engineer time-series features, evaluate asymmetric cost matrices, and present to executive supply chain leadership.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStartSimulation(simulations[0])}
              className="btn-primary text-xs py-2 px-4 rounded-xl shrink-0 font-semibold"
            >
              Enter Simulation
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider text-xs">
              Available Industry Job Simulations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {simulations.map((sim) => (
                <SimulationCard
                  key={sim.id}
                  simulation={sim}
                  onOpen={handleStartSimulation}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Simulation Interactive Flow */
        <div className="space-y-6">
          {/* Simulation Header Banner */}
          <div className="card p-6 bg-gradient-to-br from-[#111827] via-[#161F36] to-[#111827] border-primary/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-accent" />
                <span className="text-xs font-bold text-gray-300">
                  {activeSimulation.companyContext}
                </span>
              </div>
              <StatusBadge
                label={activeSimulation.careerTrack}
                size="xs"
                variant="primary"
              />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {activeSimulation.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Duration: {activeSimulation.estimatedDuration}
                </span>
                <span>•</span>
                <span>{activeSimulation.tasks.length} Modular Work Packages</span>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(0)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                    activeStep === 0
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  Overview & Brief
                </button>

                {activeSimulation.tasks.map((task, idx) => {
                  const isTaskDone = completedTaskIds.has(task.id);
                  const isCurrent = activeStep === idx + 1;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setActiveStep(idx + 1)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition ${
                        isCurrent
                          ? 'bg-primary text-white shadow-glow'
                          : isTaskDone
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white bg-slate-800/60'
                      }`}
                    >
                      {isTaskDone && <CheckCircle2 size={12} />}
                      <span>Task {idx + 1}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setActiveStep(activeSimulation.tasks.length + 1)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                    activeStep >= activeSimulation.tasks.length + 1
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  Final Submission
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Body */}
          <div className="card p-6 sm:p-8 space-y-6">
            {/* Step 0: Overview */}
            {activeStep === 0 && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Simulation Context & Client Brief
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  You are paired with the Cognizant Data & AI team delivering an inventory optimization engine for a multi-national retail chain. Your objective is to translate customer transaction logs and regional inventory status into predictive replenishment signals.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                    Core Skills Evaluated
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSimulation.skills.map((s, i) => (
                      <SkillTag key={i} name={s} size="sm" variant="accent" />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="btn-primary text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <span>Begin Task 1</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Steps 1 to N: Tasks */}
            {activeStep >= 1 && activeStep <= activeSimulation.tasks.length && (() => {
              const taskIndex = activeStep - 1;
              const currentTask = activeSimulation.tasks[taskIndex];
              const isTaskDone = completedTaskIds.has(currentTask.id);

              return (
                <div className="space-y-5 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      Task {taskIndex + 1} of {activeSimulation.tasks.length}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      Estimated: {currentTask.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                      {currentTask.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {currentTask.brief}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                      Work Package Instructions
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                      {currentTask.instructions}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Deliverable: <strong className="text-slate-200">{currentTask.deliverableType}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => alert('Demo template downloaded.')}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <FileText size={13} />
                      <span>Download Starter Data (.csv)</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep((s) => s - 1)}
                      className="btn-outline text-xs py-2 px-3.5 rounded-xl disabled:opacity-40"
                    >
                      Previous Task
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompleteCurrentTask(currentTask.id)}
                      className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
                    >
                      <CheckCircle2 size={14} />
                      <span>{isTaskDone ? 'Next Task' : 'Submit & Mark Complete'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Step N+1: Final Submission & Certificate */}
            {activeStep > activeSimulation.tasks.length && (
              <div className="space-y-6 max-w-2xl mx-auto text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <ShieldCheck size={32} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                    Simulation Successfully Completed!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                    You have verified 4 consulting modules in the {activeSimulation.companyContext}.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Experience Lab Credential</span>
                    <span className="text-emerald-400">Verified & Added to Portfolio</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    This experience simulation is indexed on your profile, providing verifiable proof of applied time-series modeling for executive hiring partners.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/portfolio/certificates')}
                    className="btn-primary text-xs py-2 px-4 rounded-xl font-bold"
                  >
                    View in Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSimulation(null)}
                    className="btn-outline text-xs py-2 px-4 rounded-xl"
                  >
                    Return to Experience Lab
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

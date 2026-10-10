import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Code2, Users, Award, Target, FileUp, Sparkles, ArrowRight, ArrowLeft, Check
} from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, updateSkills } from '@/services/profileService';
import { getMLPrediction, uploadResume } from '@/services/resourceService';

// The exact 22 technical skills expected by the ML model
const TECHNICAL_SKILLS = [
  'Python', 'Java', 'C++', 'SQL', 'HTML', 'CSS', 'JavaScript', 'React', 'NodeJS', 'MongoDB',
  'MySQL', 'Git', 'GitHub', 'AWS', 'Azure', 'Docker', 'Linux', 'Machine Learning', 'Deep Learning',
  'Power BI', 'Excel', 'Statistics'
];

// The 5 soft skills expected by the ML model
const SOFT_SKILLS = [
  'Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Aptitude'
];

// Reference categorical domains for prediction
const PREFERRED_DOMAINS = [
  'Full Stack', 'Frontend', 'Backend', 'Data Science', 'Machine Learning',
  'Cloud & DevOps', 'Cybersecurity', 'Database Administration', 'QA & Testing'
];

// Reference career interests
const CAREER_INTERESTS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'ML Engineer', 'Cloud Engineer', 'DevOps Engineer',
  'Cybersecurity Analyst', 'QA Engineer', 'Business Analyst', 'Mobile App Developer', 'AI Engineer'
];

export default function OnboardingPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Step 1: Academic details
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(3);
  const [cgpa, setCgpa] = useState('');
  const [location, setLocation] = useState('');

  // Step 2: Technical skill levels (default 30)
  const [techSkills, setTechSkills] = useState<Record<string, number>>(
    TECHNICAL_SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 30 }), {})
  );

  // Step 3: Soft skill levels (default 50)
  const [softSkills, setSoftSkills] = useState<Record<string, number>>(
    SOFT_SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 50 }), {})
  );

  // Step 4: Experience
  const [projectsCount, setProjectsCount] = useState(0);
  const [internshipsCount, setInternshipsCount] = useState(0);
  const [certsCount, setCertsCount] = useState(0);

  // Step 5: Preferences
  const [interest, setInterest] = useState(CAREER_INTERESTS[0]);
  const [preferredDomain, setPreferredDomain] = useState(PREFERRED_DOMAINS[0]);

  // Step 6: Resume (Optional)
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleTechSkillChange = (skill: string, value: number) => {
    setTechSkills((prev) => ({ ...prev, [skill]: value }));
  };

  const handleSoftSkillChange = (skill: string, value: number) => {
    setSoftSkills((prev) => ({ ...prev, [skill]: value }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!fullName.trim() || !college.trim() || !degree.trim() || !department.trim() || !cgpa || !location.trim()) {
        addToast('Please fill in all academic and personal fields.', 'warning');
        return false;
      }
      const parsedCgpa = parseFloat(cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        addToast('CGPA must be a valid number between 0.0 and 10.0.', 'warning');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMessage('Saving your academic profile...');

    try {
      // 1. Save profile details
      await updateProfile({
        full_name: fullName,
        college,
        degree,
        department,
        year: Number(year),
        cgpa: parseFloat(cgpa),
        location,
        interests: [interest],
        preferred_domain: preferredDomain,
        internships: Number(internshipsCount),
        projects_completed: Number(projectsCount),
        certifications_count: Number(certsCount),
      });

      setLoadingMessage('Saving your skill assessment details...');

      // 2. Format and Save skills array (matching SkillCategory schema)
      const skillsPayload = [
        {
          id: 'programming',
          name: 'Programming',
          skills: [
            { name: 'Python', level: techSkills['Python'] },
            { name: 'Java', level: techSkills['Java'] },
            { name: 'C++', level: techSkills['C++'] },
          ],
        },
        {
          id: 'web',
          name: 'Web Development',
          skills: [
            { name: 'JavaScript', level: techSkills['JavaScript'] },
            { name: 'React', level: techSkills['React'] },
            { name: 'Node.js', level: techSkills['NodeJS'] },
          ],
        },
        {
          id: 'database',
          name: 'Database',
          skills: [
            { name: 'SQL', level: techSkills['SQL'] },
            { name: 'MongoDB', level: techSkills['MongoDB'] },
            { name: 'MySQL', level: techSkills['MySQL'] },
          ],
        },
        {
          id: 'aiml',
          name: 'AI / ML',
          skills: [
            { name: 'Machine Learning', level: techSkills['Machine Learning'] },
            { name: 'Deep Learning', level: techSkills['Deep Learning'] },
            { name: 'Statistics', level: techSkills['Statistics'] },
          ],
        },
        {
          id: 'cloud',
          name: 'Cloud & DevOps',
          skills: [
            { name: 'AWS', level: techSkills['AWS'] },
            { name: 'Azure', level: techSkills['Azure'] },
            { name: 'Docker', level: techSkills['Docker'] },
            { name: 'Linux', level: techSkills['Linux'] },
            { name: 'Git', level: techSkills['Git'] },
            { name: 'GitHub', level: techSkills['GitHub'] },
          ],
        },
        {
          id: 'tools',
          name: 'Tools & Utilities',
          skills: [
            { name: 'Power BI', level: techSkills['Power BI'] },
            { name: 'Excel', level: techSkills['Excel'] },
            { name: 'HTML', level: techSkills['HTML'] },
            { name: 'CSS', level: techSkills['CSS'] },
          ],
        },
        {
          id: 'soft',
          name: 'Soft Skills',
          skills: SOFT_SKILLS.map((s) => ({
            name: s,
            level: softSkills[s],
          })),
        },
      ];

      await updateSkills(skillsPayload);

      // 3. Upload resume optionally
      if (resumeFile) {
        setLoadingMessage('Uploading and analyzing resume...');
        try {
          await uploadResume(resumeFile);
        } catch (e) {
          console.error('Resume upload error, skipping:', e);
        }
      }

      setLoadingMessage('Analyzing your career profile with AI model...');

      // 4. Build exact input expected by backend StudentProfile schema
      const mlInput = {
        Python: Number(techSkills['Python']),
        Java: Number(techSkills['Java']),
        'C++': Number(techSkills['C++']),
        SQL: Number(techSkills['SQL']),
        HTML: Number(techSkills['HTML']),
        CSS: Number(techSkills['CSS']),
        JavaScript: Number(techSkills['JavaScript']),
        React: Number(techSkills['React']),
        NodeJS: Number(techSkills['NodeJS']),
        MongoDB: Number(techSkills['MongoDB']),
        MySQL: Number(techSkills['MySQL']),
        Git: Number(techSkills['Git']),
        GitHub: Number(techSkills['GitHub']),
        AWS: Number(techSkills['AWS']),
        Azure: Number(techSkills['Azure']),
        Docker: Number(techSkills['Docker']),
        Linux: Number(techSkills['Linux']),
        'Machine Learning': Number(techSkills['Machine Learning']),
        'Deep Learning': Number(techSkills['Deep Learning']),
        'Power BI': Number(techSkills['Power BI']),
        Excel: Number(techSkills['Excel']),
        Statistics: Number(techSkills['Statistics']),

        Communication: Number(softSkills['Communication']),
        'Problem Solving': Number(softSkills['Problem Solving']),
        Leadership: Number(softSkills['Leadership']),
        Teamwork: Number(softSkills['Teamwork']),
        Aptitude: Number(softSkills['Aptitude']),

        CGPA: parseFloat(cgpa),
        'Projects Completed': Number(projectsCount),
        Internship: Number(internshipsCount),
        Certifications: Number(certsCount),

        Interest: interest,
        'Preferred Domain': preferredDomain,
      };

      await getMLPrediction(mlInput);

      setLoadingMessage('Your personalized career roadmap is ready!');
      addToast('Profile analysis complete!', 'success');

      // 5. Reload context user state to dynamically resolve redirects
      await checkAuth();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to generate prediction. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <GraduationCap className="text-primary" /> Step 1: Academic Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">College / University</label>
                <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} required className="input" placeholder="e.g. Bangalore Institute of Technology" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Degree</label>
                  <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} required className="input" placeholder="e.g. B.Tech" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Department / Branch</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required className="input" placeholder="e.g. CSE" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Current Year</label>
                  <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">CGPA (out of 10.0)</label>
                  <input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required className="input" placeholder="e.g. 8.5" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="input" placeholder="e.g. Bengaluru, India" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <Code2 className="text-primary" /> Step 2: Technical Skills (0 - 100)
            </h3>
            <p className="text-xs text-gray-500">Rate your proficiency in the skills below. Be honest — this directly drives your ML recommendations.</p>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {TECHNICAL_SKILLS.map((skill) => (
                <div key={skill} className="flex items-center justify-between gap-4 py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-sm text-gray-700 dark:text-slate-300 w-36 shrink-0">{skill}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={techSkills[skill]}
                    onChange={(e) => handleTechSkillChange(skill, Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-bold text-primary w-8 text-right">{techSkills[skill]}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <Users className="text-primary" /> Step 3: Soft Skills (0 - 100)
            </h3>
            <div className="space-y-4">
              {SOFT_SKILLS.map((skill) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-slate-300">{skill}</span>
                    <span className="font-bold text-primary">{softSkills[skill]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={softSkills[skill]}
                    onChange={(e) => handleSoftSkillChange(skill, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <Award className="text-primary" /> Step 4: Achievements & Projects
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Projects Completed</label>
                <input type="number" min="0" value={projectsCount} onChange={(e) => setProjectsCount(Math.max(0, Number(e.target.value)))} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Internships Done</label>
                <input type="number" min="0" value={internshipsCount} onChange={(e) => setInternshipsCount(Math.max(0, Number(e.target.value)))} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Certifications Earned</label>
                <input type="number" min="0" value={certsCount} onChange={(e) => setCertsCount(Math.max(0, Number(e.target.value)))} className="input" />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <Target className="text-primary" /> Step 5: Career Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Target Career Interest</label>
                <select value={interest} onChange={(e) => setInterest(e.target.value)} className="input">
                  {CAREER_INTERESTS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Preferred Domain</label>
                <select value={preferredDomain} onChange={(e) => setPreferredDomain(e.target.value)} className="input">
                  {PREFERRED_DOMAINS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <FileUp className="text-primary" /> Step 6: Upload Resume (Optional)
            </h3>
            <p className="text-xs text-gray-500">Provide an optional PDF resume. The system will extract keywords and assess your ATS score.</p>
            <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-gray-400">
                <FileUp size={24} />
              </div>
              <div className="text-center">
                <label className="cursor-pointer text-sm font-semibold text-primary hover:underline">
                  Choose a file
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-400 text-xs ml-1">or drag it here</span>
              </div>
              {resumeFile && (
                <div className="mt-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Check size={14} /> {resumeFile.name}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title="Complete Your Career Profile"
      subtitle="Input your academic stats and actual skill levels to generate your custom ML roadmap."
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{loadingMessage}</p>
              <p className="text-xs text-gray-400">This might take up to a minute while we run our Random Forest predictions...</p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
                {step > 1 ? (
                  <button type="button" onClick={handleBack} className="btn-outline flex items-center gap-2 text-xs">
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 6 ? (
                  <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2 text-xs">
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} className="btn-primary bg-gradient-to-r from-primary to-primary-700 flex items-center gap-2 text-xs">
                    <Sparkles size={14} /> Analyze My Career
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}

CAREERCOMPASS — PHASE 3.6
FRONTEND ↔ FASTAPI ML INFERENCE INTEGRATION

Phase 3.5 is COMPLETE and APPROVED.

The backend is a working FastAPI ML inference service using the
LOCKED Phase 3.4.1 Candidate H model:

- RandomForestClassifier
- 300 estimators
- class_weight=None
- random_state=42
- skills-only
- 29 binary skill features
- 4 active career tracks

Backend endpoints:

GET  /api/v1/health
GET  /api/v1/ready
GET  /api/v1/model/info
GET  /api/v1/predictions/career/skills
POST /api/v1/predictions/career

Backend URL during local development:

http://127.0.0.1:8000

IMPORTANT:
This phase integrates the existing React frontend with the REAL
FastAPI ML inference service.

DO NOT retrain the model.
DO NOT modify the ML training pipeline.
DO NOT modify model artifacts.
DO NOT add another ML model.
DO NOT add an LLM classifier.
DO NOT invent frontend prediction logic.
DO NOT hard-code model probabilities.
DO NOT make mock prediction data appear to be real ML output.
DO NOT redesign the entire application.

============================================================
1. OBJECTIVE
============================================================

Replace the existing mock career prediction flow with the real
FastAPI inference API.

The frontend must become a thin ML client.

The prediction lifecycle must be:

User skills
    ↓
Frontend validation
    ↓
GET canonical 29-skill vocabulary
    ↓
User selects/enters skills
    ↓
POST selected skills to FastAPI
    ↓
FastAPI performs ML inference
    ↓
Frontend receives prediction response
    ↓
Frontend renders API result

The frontend must never perform career classification itself.

============================================================
2. FIRST INSPECT THE EXISTING FRONTEND
============================================================

Before modifying anything, inspect:

src/
routes
components
contexts
services
career prediction page
career assessment page
mock data
existing API abstractions
existing state management
localStorage persistence

Identify exactly where the current mock career prediction data
is generated and consumed.

Do not delete unrelated existing functionality.

Do not modify unrelated modules.

============================================================
3. CREATE TYPED API CLIENT
============================================================

Create:

src/services/api/mlInference.ts

Define TypeScript interfaces matching the FastAPI response.

Example:

export interface CareerPredictionRequest {
  skills: string[];
}

export interface CareerProbability {
  career_track: string;
  probability: number;
}

export interface CareerPredictionResponse {
  prediction: {
    career_track: string;
    probability: number;
  };

  alternatives: CareerProbability[];

  probabilities: CareerProbability[];

  input: {
    recognized_skills: string[];
    unknown_skills: string[];
  };

  model: {
    version: string;
    model_type: string;
    feature_configuration: string;
  };

  explanation?: unknown;
}

Also define:

export interface SkillVocabularyResponse {
  skills: string[];
  count: number;
  model_version?: string;
}

============================================================
4. API BASE URL
============================================================

Do NOT hard-code the backend URL throughout the application.

Use Vite environment configuration.

Example:

VITE_API_BASE_URL=http://127.0.0.1:8000

The API client should construct:

${VITE_API_BASE_URL}/api/v1/...

Provide a safe development fallback only if appropriate.

Do not introduce arbitrary production URLs.

============================================================
5. API FUNCTIONS
============================================================

Implement:

getCareerSkillVocabulary()

Calls:

GET /api/v1/predictions/career/skills

Implement:

predictCareer(skills: string[])

Calls:

POST /api/v1/predictions/career

with:

{
  "skills": [...]
}

Both functions must:

- use fetch or the project's existing HTTP abstraction
- check response.ok
- parse JSON
- surface useful errors
- never silently return fake prediction data

============================================================
6. REMOVE MOCK PREDICTION DEPENDENCY
============================================================

Find the existing career prediction UI.

Identify all mock values such as:

- fake career probabilities
- fake suitability percentages
- fake confidence
- hardcoded recommended career
- static prediction history entries generated as if real
- fake skill-to-career classification logic

The ACTIVE prediction screen must stop using those values.

Do not necessarily delete mock data used by unrelated demo modules.

Clearly distinguish:

REAL ML DATA
from
DEMO/STATIC PRODUCT DATA.

============================================================
7. CANONICAL SKILL VOCABULARY
============================================================

The frontend must obtain the model vocabulary from:

GET /api/v1/predictions/career/skills

Do NOT duplicate the 29-skill vocabulary manually in the frontend.

The API is authoritative.

Use the response to populate:

- skill selector
- autocomplete
- tag/chip selection
- validation

If the API is unavailable:

show an explicit error state.

Do NOT silently fall back to a manually duplicated skill list.

============================================================
8. SKILL SELECTION
============================================================

The user must be able to select multiple skills.

The selected skills must be sent exactly as a string array.

Example:

[
  "python",
  "ai",
  "programming"
]

Do not convert skills into proficiency percentages.

Remember:

THE MODEL USES BINARY SKILL PRESENCE.

The frontend must not imply that:

Python = 80%
AI = 60%

unless this is purely a separate UI concept and is NOT sent to
the model.

============================================================
9. UNKNOWN SKILLS
============================================================

The backend returns:

input.unknown_skills

Display these clearly but non-blockingly.

Example:

"These skills are not currently part of the ML model vocabulary."

Show them as warning chips or an informational message.

Do not pretend unknown skills influenced the prediction.

Do not map them to known skills in the frontend.

============================================================
10. PREDICTION LOADING STATE
============================================================

When the user clicks the prediction action:

Set loading state.

Disable duplicate submission.

Show a clear loading indicator.

Example:

"Analyzing your selected skills..."

When the API responds:

render the real response.

If the request fails:

show a clear error state.

Do NOT display stale mock prediction data as if it were the new
prediction.

============================================================
11. ERROR STATES
============================================================

Handle at least:

- backend unavailable
- HTTP 422
- HTTP 503
- malformed response
- network failure
- empty skills

Example user-safe message:

"Career prediction is temporarily unavailable. Please make sure
the ML service is running and try again."

Do not expose stack traces.

Do not expose Python filesystem paths.

============================================================
12. PROBABILITY TERMINOLOGY
============================================================

IMPORTANT:

Never display:

"Confidence"
"Confidence score"
"Career suitability"
"Guaranteed match"
"Chance of becoming this career"

Use:

"Model-predicted probability"

Example:

AI & Machine Learning Engineering
Model-predicted probability: 67.0%

Add a small explanatory note:

"These values are model-predicted probabilities from the current
CareerCompass ML model and are not calibrated confidence scores."

Do not imply that 67% means a 67% chance that the student will
actually become an AI/ML engineer.

============================================================
13. DISPLAY ALL FOUR TRACKS
============================================================

Use:

response.probabilities

to render all four career tracks.

Do not recreate or reorder them independently.

The backend already sorts them by probability.

The frontend should preserve backend ordering.

Example:

1. AI & Machine Learning Engineering — 67.0%
2. Software Development & Engineering — 31.1%
3. Data Analytics & Business Intelligence — 1.0%
4. Cloud, DevOps & Systems Engineering — 0.9%

These numbers are examples only.

Never hard-code them.

============================================================
14. PRIMARY PREDICTION
============================================================

Use:

response.prediction

for the primary recommendation.

Do not independently calculate the top career in React.

The backend is authoritative.

============================================================
15. MODEL INFORMATION
============================================================

Display model metadata in an appropriate technical information area,
not as a distracting primary UI element.

Possible information:

Model:
Random Forest

Features:
29 binary skill indicators

Model version:
phase3.4

Feature configuration:
skills-only

Use the actual API response.

Do not hard-code the metadata.

============================================================
16. ASSESSMENT STATE
============================================================

If the existing assessment page stores selected skills in React
state/context/localStorage:

preserve that behavior where appropriate.

However:

The prediction request must use the current selected skills.

Do not persist stale predictions as the current prediction.

A new skill submission should produce a new API request.

============================================================
17. PREDICTION HISTORY
============================================================

Inspect the existing prediction history feature.

DO NOT automatically pretend that existing mock history records were
generated by the real ML backend.

For NEW predictions only:

If the existing architecture supports prediction history, store:

- timestamp
- submitted skills
- returned prediction
- returned probabilities
- model version

Clearly distinguish historical real API predictions from legacy
demo/mock entries if both exist.

Do not modify database architecture in this phase.

LocalStorage is acceptable for the current prototype.

============================================================
18. DASHBOARD
============================================================

If the dashboard currently shows a career prediction from mock data:

do not silently label that mock value as real ML output.

Either:

A. connect it to the latest real prediction, OR

B. clearly mark it as unavailable until a real prediction exists.

Prefer option A if it fits the current architecture without major
redesign.

============================================================
19. API SERVICE SEPARATION
============================================================

Keep API communication outside React components.

Recommended:

src/services/api/mlInference.ts

React components should call service functions rather than directly
calling fetch everywhere.

This makes the frontend testable and maintainable.

============================================================
20. TYPE SAFETY
============================================================

Use strict TypeScript types.

Do not use:

any

for the prediction response.

Avoid unsafe casts.

Validate important response fields before rendering if practical.

============================================================
21. CORS
============================================================

The backend already uses restricted CORS.

Use:

http://localhost:5173

or the actual Vite development origin.

Do not modify backend CORS to:

*

just to make integration work.

If there is a port/origin mismatch, fix configuration rather than
opening wildcard CORS.

============================================================
22. FRONTEND TESTING
============================================================

Add tests appropriate to the existing frontend testing setup.

At minimum verify:

1. API client constructs correct GET URL.
2. API client constructs correct POST request.
3. Valid response is parsed correctly.
4. HTTP error is surfaced.
5. Unknown skills are rendered.
6. Loading state is shown.
7. Prediction result comes from API.
8. No hardcoded prediction probabilities are used.
9. Four returned career tracks are displayed.
10. Empty skill submission is rejected.

If the project has no frontend test framework, do not introduce a
large testing framework unnecessarily. Use the existing setup or
create focused tests with the smallest reasonable dependency.

============================================================
23. BUILD VERIFICATION
============================================================

Run:

npm run build

and the existing frontend test/lint/typecheck commands if available.

Also verify the backend:

46/46 core ML tests must remain passing.

28/28 backend Phase 3.5 tests must remain passing.

Do not accept frontend integration if it breaks backend tests.

============================================================
24. MANUAL END-TO-END VERIFICATION
============================================================

Start backend:

uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

Start frontend:

npm run dev

Then verify through the actual browser UI:

TEST A

Select:

python
ai
programming

Click prediction.

Verify the displayed prediction exactly matches the API response.

TEST B

Select:

python
web_development
database_systems

Verify the API result is rendered dynamically.

TEST C

Select:

excel
communication
critical_thinking

Verify Data Analytics & Business Intelligence is returned by the
backend and displayed.

TEST D

Enter:

unknown_skill_xyz
python

Verify:

python influences the prediction.

unknown_skill_xyz is displayed as an unknown skill.

The frontend does not pretend that unknown_skill_xyz influenced
the model.

TEST E

Submit no skills.

Verify the frontend blocks the request or displays the backend
validation error.

============================================================
25. NETWORK VERIFICATION
============================================================

Use browser developer tools/network inspection where possible.

Confirm:

GET /api/v1/predictions/career/skills

and:

POST /api/v1/predictions/career

are actually called.

Confirm the response contains the backend-generated probabilities.

This is important.

Do not claim integration is complete based only on a successful
frontend build.

============================================================
26. NO FAKE FALLBACK
============================================================

If the backend is unavailable:

DO NOT do this:

catch(error) {
    return mockPrediction;
}

Absolutely no fake ML fallback.

Instead:

show an explicit service-unavailable state.

============================================================
27. VISUAL QUALITY
============================================================

Preserve the existing polished CareerCompass design.

Only make targeted changes needed for real ML integration.

Ensure:

- loading state looks intentional
- error state looks intentional
- unknown skill warning is clear
- probability cards remain readable
- model terminology is accurate
- no UI implies calibrated confidence
- no visual regression

Do not redesign the entire application.

============================================================
28. REQUIRED DOCUMENTATION
============================================================

Create:

ml/reports/phase_3_6_report.md

Include:

1. Objective
2. Frontend architecture changes
3. API client
4. Skill vocabulary integration
5. Prediction integration
6. State management
7. Error handling
8. Probability terminology
9. Unknown skill handling
10. Prediction history behavior
11. Testing
12. Build verification
13. End-to-end browser verification
14. Network verification
15. Screenshots/evidence if available
16. Limitations
17. Phase 3.7 recommendation

Explicitly state:

"Career prediction results displayed in the integrated prediction
flow are generated by the Phase 3.4.1 serialized Random Forest
model through the FastAPI inference service."

Also explicitly state:

"The frontend performs no career classification and contains no
hardcoded ML probabilities."

============================================================
29. REQUIRED AUDIT
============================================================

Before declaring completion, search the frontend source for:

- hardcoded career probabilities
- "confidence"
- "suitability"
- fake prediction functions
- mock career prediction values
- hardcoded 29-skill vocabulary
- frontend career classification rules

Report what was found.

If any active prediction path still uses mock data, fix it.

Do not remove unrelated mock data that belongs to modules not yet
connected to backend functionality, but document it clearly.

============================================================
30. IMPORTANT CALIBRATION WORDING
============================================================

Do NOT claim that Candidate H has been successfully calibrated.

Use:

"uncalibrated Random Forest model-predicted probabilities"

unless a future dedicated Candidate H calibration experiment has
been completed.

============================================================
31. STOP CONDITION
============================================================

Phase 3.6 is complete only when:

- real API client exists
- canonical vocabulary comes from backend
- prediction request reaches backend
- backend result appears in React
- no frontend ML classification exists
- no hardcoded ML probabilities remain in active prediction flow
- unknown skills are handled transparently
- loading/error states work
- frontend build passes
- backend 28/28 tests remain passing
- ML 46/46 tests remain passing
- manual browser verification is completed
- network request verification is completed
- phase_3_6_report.md is created

After completion:

STOP.

Do NOT begin Phase 3.7 automatically.

Return:

1. Files created/modified
2. API integration details
3. Frontend prediction flow
4. Mock-data audit results
5. Test results
6. Build result
7. Browser verification results
8. Network verification
9. Screenshots/evidence
10. Known limitations
11. Exact Phase 3.7 recommendation

STOP.
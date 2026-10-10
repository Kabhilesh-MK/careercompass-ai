"""
CareerOntologyService — Authoritative Competency Framework for CareerCompass.

=============================================================================
ARCHITECTURAL DISTINCTION & METHODOLOGICAL NOTE:
=============================================================================
This ontology represents CURATED PRODUCT KNOWLEDGE and an explicit competency
framework designed by subject matter experts. It is NOT claimed to be learned
statistically from the Random Forest classifier or inferred from data weights.

The Random Forest model predicts career tracks based on binary skill co-occurrence
in the benchmark training set. In contrast, this ontology defines normative
curricular standards, prerequisites, priority tiers, and progressive stages
for each of the 4 ML-supported career tracks.

All skills in this ontology strictly adhere to the locked 29-feature canonical
vocabulary established in Phase 3.4.1.
=============================================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set


@dataclass(frozen=True)
class SkillMetadata:
    """Metadata describing a canonical skill within a career track context."""
    skill: str
    tier: str  # "core", "supporting", "advanced"
    stage: int  # 1 to 5
    title: str
    description: str
    reason: str


@dataclass(frozen=True)
class TrackOntology:
    """Complete ontology definition for an ML-supported career track."""
    track_name: str
    slug: str
    description: str
    core_skills: List[str]
    supporting_skills: List[str]
    advanced_skills: List[str]
    recommended_learning_order: List[str]
    prerequisites: Dict[str, List[str]]
    skills_metadata: Dict[str, SkillMetadata]

    @property
    def all_required_skills(self) -> List[str]:
        """Returns all required skills in recommended learning order."""
        return list(self.recommended_learning_order)


# ---------------------------------------------------------------------------
# ONTOLOGY DEFINITIONS FOR THE 4 ML-SUPPORTED CAREER TRACKS
# Strictly utilizing the 29-feature canonical vocabulary:
# ai, autocad, cad, cloud, communication, critical_thinking, data_analysis,
# database_design, database_systems, design, design_optimization, excel,
# experimentation, lab_work, machine_learning, matlab, negotiation,
# observation, plc, power_analysis, programming, pscad, python, recording,
# research, sales, simulation, team_management, web_development
# ---------------------------------------------------------------------------

ONTOLOGY_DATA: Dict[str, TrackOntology] = {
    "Software Development & Engineering": TrackOntology(
        track_name="Software Development & Engineering",
        slug="software-development-engineering",
        description=(
            "Focuses on principled software construction, algorithmic problem solving, "
            "modern web architectures, relational database systems, and robust system design."
        ),
        core_skills=[
            "programming",
            "python",
            "database_systems",
            "database_design",
            "web_development",
        ],
        supporting_skills=[
            "critical_thinking",
            "cloud",
            "design",
            "team_management",
        ],
        advanced_skills=[
            "design_optimization",
            "simulation",
        ],
        recommended_learning_order=[
            "programming",
            "python",
            "database_systems",
            "database_design",
            "web_development",
            "critical_thinking",
            "cloud",
            "design",
            "team_management",
            "design_optimization",
            "simulation",
        ],
        prerequisites={
            "python": ["programming"],
            "database_systems": ["programming"],
            "database_design": ["database_systems"],
            "web_development": ["programming"],
            "cloud": ["programming"],
            "design_optimization": ["design"],
            "simulation": ["programming"],
        },
        skills_metadata={
            "programming": SkillMetadata(
                skill="programming",
                tier="core",
                stage=1,
                title="Foundational Programming & Algorithms",
                description="Core algorithmic syntax, control flow, functions, and structured problem-solving.",
                reason="Primary engineering prerequisite for all software development workflows.",
            ),
            "python": SkillMetadata(
                skill="python",
                tier="core",
                stage=1,
                title="Object-Oriented & Scripting Architecture with Python",
                description="Modular scripting, OOP principles, data structures, and package ecosystems.",
                reason="Versatile scripting and backend language across modern enterprise stacks.",
            ),
            "database_systems": SkillMetadata(
                skill="database_systems",
                tier="core",
                stage=2,
                title="Relational Database Systems & SQL",
                description="Relational querying, schema normalization, ACID transactions, and indexing.",
                reason="Essential for persistent data storage and high-throughput data operations.",
            ),
            "database_design": SkillMetadata(
                skill="database_design",
                tier="core",
                stage=2,
                title="Database Modeling & Relational Design",
                description="Entity-relationship modeling, schema constraints, and data integrity design.",
                reason="Required for maintainable database schemas and efficient query execution.",
            ),
            "web_development": SkillMetadata(
                skill="web_development",
                tier="core",
                stage=2,
                title="Full-Stack Web Development & APIs",
                description="Client-server architectures, RESTful API design, and asynchronous request handling.",
                reason="Core competency for delivering interactive web applications and web services.",
            ),
            "critical_thinking": SkillMetadata(
                skill="critical_thinking",
                tier="supporting",
                stage=3,
                title="Systematic Debugging & Analytical Reasoning",
                description="Root-cause defect analysis, algorithmic trade-off evaluation, and edge-case handling.",
                reason="Essential for identifying bottlenecks and evaluating architectural trade-offs.",
            ),
            "cloud": SkillMetadata(
                skill="cloud",
                tier="supporting",
                stage=3,
                title="Cloud Infrastructure & Microservices",
                description="Deploying applications to scalable cloud platforms and managed environments.",
                reason="Crucial for contemporary distributed system deployment and infrastructure elasticity.",
            ),
            "design": SkillMetadata(
                skill="design",
                tier="supporting",
                stage=4,
                title="Software Architecture & Modular Design",
                description="Design patterns, interface separation, and component modularity.",
                reason="Ensures extensible codebases that scale across engineering teams.",
            ),
            "team_management": SkillMetadata(
                skill="team_management",
                tier="supporting",
                stage=5,
                title="Agile Collaboration & Engineering Leadership",
                description="Code review culture, sprint delivery, technical documentation, and cross-functional coordination.",
                reason="Critical for delivering collaborative industry engineering initiatives.",
            ),
            "design_optimization": SkillMetadata(
                skill="design_optimization",
                tier="advanced",
                stage=4,
                title="Performance Optimization & Algorithmic Profiling",
                description="Runtime profiling, latency reduction, memory management, and caching strategies.",
                reason="Required for scaling production services under heavy computational load.",
            ),
            "simulation": SkillMetadata(
                skill="simulation",
                tier="advanced",
                stage=4,
                title="System Simulation & Load Modeling",
                description="Concurrency simulation, throughput modeling, and stress testing.",
                reason="Validates system reliability and resilience prior to production rollouts.",
            ),
        },
    ),

    "AI & Machine Learning Engineering": TrackOntology(
        track_name="AI & Machine Learning Engineering",
        slug="ai-machine-learning-engineering",
        description=(
            "Encompasses the end-to-end machine learning lifecycle: mathematical data preprocessing, "
            "supervised and unsupervised model development, statistical experimentation, and AI deployment."
        ),
        core_skills=[
            "programming",
            "python",
            "data_analysis",
            "machine_learning",
            "ai",
        ],
        supporting_skills=[
            "database_systems",
            "cloud",
            "critical_thinking",
            "research",
        ],
        advanced_skills=[
            "experimentation",
            "simulation",
            "design_optimization",
        ],
        recommended_learning_order=[
            "programming",
            "python",
            "data_analysis",
            "database_systems",
            "machine_learning",
            "ai",
            "critical_thinking",
            "cloud",
            "research",
            "experimentation",
            "simulation",
            "design_optimization",
        ],
        prerequisites={
            "python": ["programming"],
            "data_analysis": ["python"],
            "database_systems": ["programming"],
            "machine_learning": ["python", "data_analysis"],
            "ai": ["machine_learning"],
            "experimentation": ["data_analysis"],
            "simulation": ["machine_learning"],
            "design_optimization": ["machine_learning"],
        },
        skills_metadata={
            "programming": SkillMetadata(
                skill="programming",
                tier="core",
                stage=1,
                title="Algorithmic Programming Foundations",
                description="Foundational algorithmic logic, data structures, and computational complexity.",
                reason="Essential coding bedrock for implementing ML algorithms and data transformations.",
            ),
            "python": SkillMetadata(
                skill="python",
                tier="core",
                stage=1,
                title="Scientific Computing with Python",
                description="Vectorized computing, scientific libraries (NumPy, SciPy), and numerical arrays.",
                reason="The lingua franca of modern artificial intelligence and machine learning pipelines.",
            ),
            "data_analysis": SkillMetadata(
                skill="data_analysis",
                tier="core",
                stage=2,
                title="Exploratory Data Analysis & Feature Extraction",
                description="Data wrangling, imputation, feature engineering, and statistical distribution inspection.",
                reason="High-quality ML models depend directly on rigorous exploratory feature analysis.",
            ),
            "database_systems": SkillMetadata(
                skill="database_systems",
                tier="supporting",
                stage=2,
                title="Relational Data Extraction & SQL",
                description="Extracting analytical datasets from structured transactional databases.",
                reason="Underpins feature stores and batch training data pipelines.",
            ),
            "machine_learning": SkillMetadata(
                skill="machine_learning",
                tier="core",
                stage=2,
                title="Applied Supervised & Unsupervised Machine Learning",
                description="Regression, decision trees, random forests, clustering, validation splits, and metric evaluation.",
                reason="Core discipline of building predictive algorithmic models from empirical training data.",
            ),
            "ai": SkillMetadata(
                skill="ai",
                tier="core",
                stage=3,
                title="Artificial Intelligence & Neural Architectures",
                description="Advanced representation learning, deep neural networks, and generative paradigms.",
                reason="Drives cutting-edge intelligent automation and automated inference systems.",
            ),
            "critical_thinking": SkillMetadata(
                skill="critical_thinking",
                tier="supporting",
                stage=3,
                title="Scientific Verification & Diagnostic Reasoning",
                description="Diagnosing model bias, variance, distribution drift, and spurious correlations.",
                reason="Prevents costly data leakage and ensures mathematically sound model conclusions.",
            ),
            "cloud": SkillMetadata(
                skill="cloud",
                tier="supporting",
                stage=3,
                title="Cloud ML Serving & Elastic Compute",
                description="Deploying model artifacts to cloud microservices and scalable inference servers.",
                reason="Required for production ML inference and scalable batch predictions.",
            ),
            "research": SkillMetadata(
                skill="research",
                tier="supporting",
                stage=4,
                title="Applied ML Research & Literature Synthesis",
                description="Benchmarking novel architectures, reading empirical papers, and experimental synthesis.",
                reason="Keeps engineering practitioners aligned with rapid algorithmic breakthroughs.",
            ),
            "experimentation": SkillMetadata(
                skill="experimentation",
                tier="advanced",
                stage=4,
                title="Controlled Experimentation & A/B Validation",
                description="Hypothesis testing, multi-arm bandit evaluation, and statistical significance testing.",
                reason="Essential for validating live model performance against production baselines.",
            ),
            "simulation": SkillMetadata(
                skill="simulation",
                tier="advanced",
                stage=4,
                title="Synthetic Data Simulation & Environment Modeling",
                description="Generating synthetic benchmarks, Monte Carlo sampling, and scenario stress testing.",
                reason="Critical when real-world training instances are sparse or safety-critical.",
            ),
            "design_optimization": SkillMetadata(
                skill="design_optimization",
                tier="advanced",
                stage=5,
                title="Hyperparameter Tuning & Inference Optimization",
                description="Bayesian optimization, pruning, quantization, and model latency reduction.",
                reason="Maximizes accuracy while maintaining low-latency inference constraints.",
            ),
        },
    ),

    "Data Analytics & Business Intelligence": TrackOntology(
        track_name="Data Analytics & Business Intelligence",
        slug="data-analytics-business-intelligence",
        description=(
            "Focuses on quantitative metric evaluation, relational querying, executive dashboarding, "
            "business analysis, statistical storytelling, and data-informed decision strategy."
        ),
        core_skills=[
            "excel",
            "database_systems",
            "data_analysis",
            "python",
            "communication",
        ],
        supporting_skills=[
            "database_design",
            "critical_thinking",
            "research",
            "team_management",
        ],
        advanced_skills=[
            "machine_learning",
            "negotiation",
        ],
        recommended_learning_order=[
            "excel",
            "database_systems",
            "database_design",
            "data_analysis",
            "python",
            "communication",
            "critical_thinking",
            "research",
            "team_management",
            "machine_learning",
            "negotiation",
        ],
        prerequisites={
            "database_design": ["database_systems"],
            "data_analysis": ["excel"],
            "python": ["data_analysis"],
            "machine_learning": ["python", "data_analysis"],
            "negotiation": ["communication"],
            "team_management": ["communication"],
        },
        skills_metadata={
            "excel": SkillMetadata(
                skill="excel",
                tier="core",
                stage=1,
                title="Advanced Spreadsheet Modeling & Pivot Analytics",
                description="Formulas, financial modeling, dynamic lookups, pivot tables, and dashboard prototyping.",
                reason="Universal corporate standard for immediate business modeling and ad-hoc analysis.",
            ),
            "database_systems": SkillMetadata(
                skill="database_systems",
                tier="core",
                stage=1,
                title="Relational Data Extraction & SQL Aggregations",
                description="Complex multi-table joins, subqueries, group aggregations, and window functions.",
                reason="Primary mechanism for querying enterprise operational databases and data warehouses.",
            ),
            "database_design": SkillMetadata(
                skill="database_design",
                tier="supporting",
                stage=2,
                title="Dimensional Modeling & Star Schemas",
                description="Fact and dimension tables, star/snowflake schemas, and reporting data marts.",
                reason="Essential for designing BI data structures that query efficiently at scale.",
            ),
            "data_analysis": SkillMetadata(
                skill="data_analysis",
                tier="core",
                stage=2,
                title="Exploratory Analytics & Metric Decomposition",
                description="Cohort analysis, retention curves, funnel diagnostics, and trend decomposition.",
                reason="Core capability to uncover operational drivers and quantify strategic performance.",
            ),
            "python": SkillMetadata(
                skill="python",
                tier="core",
                stage=2,
                title="Automated Analytics with Python & Pandas",
                description="Automating repetitive ETL transforms, statistical calculations, and data visualization.",
                reason="Enables scalable data pipelines and sophisticated statistical exploration beyond spreadsheets.",
            ),
            "communication": SkillMetadata(
                skill="communication",
                tier="core",
                stage=3,
                title="Data Storytelling & Executive Presentations",
                description="Translating quantitative insights into clear business recommendations for non-technical stakeholders.",
                reason="Analytics creates no value unless stakeholders understand and adopt recommendations.",
            ),
            "critical_thinking": SkillMetadata(
                skill="critical_thinking",
                tier="supporting",
                stage=3,
                title="Root-Cause Analysis & Decision Hygiene",
                description="Deconstructing ambiguous business problems and distinguishing correlation from causation.",
                reason="Guards against flawed business decisions driven by spurious statistical trends.",
            ),
            "research": SkillMetadata(
                skill="research",
                tier="supporting",
                stage=4,
                title="Market Intelligence & Competitive Benchmarking",
                description="Gathering industry benchmarks, macro indicators, and qualitative market context.",
                reason="Grounds internal quantitative data in broader industry competitive dynamics.",
            ),
            "team_management": SkillMetadata(
                skill="team_management",
                tier="supporting",
                stage=5,
                title="Stakeholder Coordination & Project Ownership",
                description="Managing cross-functional delivery, aligning priorities, and sprint roadmapping.",
                reason="Ensures analytical initiatives deliver on business priorities in timely cadence.",
            ),
            "machine_learning": SkillMetadata(
                skill="machine_learning",
                tier="advanced",
                stage=4,
                title="Predictive Analytics & Forecasting Models",
                description="Time-series forecasting, customer churn prediction, and regression scoring.",
                reason="Advances analytics from descriptive hindsight to proactive predictive foresight.",
            ),
            "negotiation": SkillMetadata(
                skill="negotiation",
                tier="advanced",
                stage=5,
                title="Resource Negotiation & Strategic Influence",
                description="Securing budget approval, aligning stakeholder compromises, and navigating tradeoffs.",
                reason="Key executive skill for converting analytics proposals into funded corporate action.",
            ),
        },
    ),

    "Cloud, DevOps & Systems Engineering": TrackOntology(
        track_name="Cloud, DevOps & Systems Engineering",
        slug="cloud-devops-systems-engineering",
        description=(
            "Centers on scalable cloud platforms, automated CI/CD pipelines, container orchestration, "
            "infrastructure reliability, database operations, and continuous systems resilience."
        ),
        core_skills=[
            "programming",
            "python",
            "cloud",
            "database_systems",
        ],
        supporting_skills=[
            "web_development",
            "database_design",
            "critical_thinking",
            "team_management",
        ],
        advanced_skills=[
            "simulation",
            "design_optimization",
        ],
        recommended_learning_order=[
            "programming",
            "python",
            "database_systems",
            "database_design",
            "cloud",
            "web_development",
            "critical_thinking",
            "team_management",
            "simulation",
            "design_optimization",
        ],
        prerequisites={
            "python": ["programming"],
            "database_systems": ["programming"],
            "database_design": ["database_systems"],
            "cloud": ["programming"],
            "web_development": ["programming"],
            "simulation": ["cloud"],
            "design_optimization": ["cloud"],
        },
        skills_metadata={
            "programming": SkillMetadata(
                skill="programming",
                tier="core",
                stage=1,
                title="Systems Programming & Automation Scripts",
                description="CLI tooling, file I/O, process management, and deterministic error handling.",
                reason="Essential for writing infrastructure tooling, automation scripts, and deployment hooks.",
            ),
            "python": SkillMetadata(
                skill="python",
                tier="core",
                stage=1,
                title="Infrastructure Automation with Python",
                description="Writing cloud SDK scripts, interacting with REST APIs, and automating operational tasks.",
                reason="Primary scripting language for modern DevOps tooling and cloud SDKs.",
            ),
            "database_systems": SkillMetadata(
                skill="database_systems",
                tier="core",
                stage=2,
                title="Database Operations & High Availability",
                description="Database clustering, connection pooling, backups, replication, and failover.",
                reason="Critical systems tier that must remain operational and resilient under load.",
            ),
            "database_design": SkillMetadata(
                skill="database_design",
                tier="supporting",
                stage=2,
                title="Storage Schema Planning & Partitioning",
                description="Sharding architectures, partition keys, read/write replicas, and cache layers.",
                reason="Prevents storage I/O bottlenecks in scaled distributed systems.",
            ),
            "cloud": SkillMetadata(
                skill="cloud",
                tier="core",
                stage=2,
                title="Cloud Architecture & Managed Services",
                description="Compute instances, object storage, virtual private clouds, IAM security, and auto-scaling.",
                reason="Core platform competency for hosting and scaling modern cloud-native systems.",
            ),
            "web_development": SkillMetadata(
                skill="web_development",
                tier="supporting",
                stage=3,
                title="API Gateways & Ingress Engineering",
                description="Reverse proxies, TLS termination, load balancers, HTTP/2, and webhook routing.",
                reason="Essential for routing external user traffic into internal microservice clusters.",
            ),
            "critical_thinking": SkillMetadata(
                skill="critical_thinking",
                tier="supporting",
                stage=3,
                title="Site Reliability & Incident Root-Cause Analysis",
                description="Post-mortem investigations, observability telemetry, and failure domain isolation.",
                reason="Ensures rapid MTTR (mean time to resolution) during production outages.",
            ),
            "team_management": SkillMetadata(
                skill="team_management",
                tier="supporting",
                stage=5,
                title="On-Call Operations & DevOps Culture",
                description="Incident management, runbook documentation, SLO/SLA management, and team hygiene.",
                reason="DevOps is a cultural discipline requiring strong coordination across operations.",
            ),
            "simulation": SkillMetadata(
                skill="simulation",
                tier="advanced",
                stage=4,
                title="Chaos Engineering & Fault Injection Simulation",
                description="Simulating network latency, region failover, resource exhaustion, and packet loss.",
                reason="Validates whether high-availability systems recover automatically from failure.",
            ),
            "design_optimization": SkillMetadata(
                skill="design_optimization",
                tier="advanced",
                stage=4,
                title="Infrastructure Cost & Performance Tuning",
                description="Cloud right-sizing, auto-scaling thresholds, ingress optimization, and latency tuning.",
                reason="Minimizes cloud infrastructure spend while guaranteeing latency and throughput SLAs.",
            ),
        },
    ),
}

STAGE_TITLES: Dict[int, str] = {
    1: "Stage 1 — Foundations",
    2: "Stage 2 — Core Competencies",
    3: "Stage 3 — Applied Systems & Engineering",
    4: "Stage 4 — Advanced Methods & Optimization",
    5: "Stage 5 — Career Projects & Capstone Preparation",
}


class CareerOntologyService:
    """Singleton service providing authoritative access to the career skill ontology."""

    _instance: Optional[CareerOntologyService] = None

    @classmethod
    def get_instance(cls) -> CareerOntologyService:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_supported_tracks(self) -> List[str]:
        """Returns the four canonical ML-supported career track names."""
        return list(ONTOLOGY_DATA.keys())

    def get_track_ontology(self, track_name: str) -> TrackOntology:
        """Returns the TrackOntology object for a supported track."""
        if track_name not in ONTOLOGY_DATA:
            raise KeyError(
                f"Track '{track_name}' not found in ontology. "
                f"Supported tracks: {list(ONTOLOGY_DATA.keys())}"
            )
        return ONTOLOGY_DATA[track_name]

    def get_required_skills(self, track_name: str) -> List[str]:
        """Returns all required canonical skills for the given track."""
        return self.get_track_ontology(track_name).all_required_skills

    def get_core_skills(self, track_name: str) -> List[str]:
        """Returns core canonical skills for the given track."""
        return list(self.get_track_ontology(track_name).core_skills)

    def get_supporting_skills(self, track_name: str) -> List[str]:
        """Returns supporting canonical skills for the given track."""
        return list(self.get_track_ontology(track_name).supporting_skills)

    def get_advanced_skills(self, track_name: str) -> List[str]:
        """Returns advanced canonical skills for the given track."""
        return list(self.get_track_ontology(track_name).advanced_skills)

    def get_prerequisites(self, track_name: str, skill: str) -> List[str]:
        """Returns prerequisites for a specific skill in a track."""
        track = self.get_track_ontology(track_name)
        return list(track.prerequisites.get(skill, []))

    def get_skill_metadata(self, track_name: str, skill: str) -> Optional[SkillMetadata]:
        """Returns rich metadata for a skill in a track, if defined."""
        track = self.get_track_ontology(track_name)
        return track.skills_metadata.get(skill)

    def get_stage_title(self, stage: int) -> str:
        """Returns the formatted title for a roadmap stage."""
        return STAGE_TITLES.get(stage, f"Stage {stage}")

    def validate_against_canonical_vocabulary(self, canonical_vocab: Set[str]) -> bool:
        """
        Validates that EVERY skill in every track ontology belongs to the
        provided canonical vocabulary. Raises ValueError if violations are detected.
        """
        violations: List[str] = []
        for track_name, track in ONTOLOGY_DATA.items():
            for skill in track.all_required_skills:
                if skill not in canonical_vocab:
                    violations.append(f"Track '{track_name}' contains non-canonical skill: '{skill}'")
            for skill, prereqs in track.prerequisites.items():
                if skill not in canonical_vocab:
                    violations.append(f"Prerequisite target '{skill}' is not canonical")
                for p in prereqs:
                    if p not in canonical_vocab:
                        violations.append(f"Prerequisite source '{p}' for '{skill}' is not canonical")

        if violations:
            raise ValueError(f"Ontology validation failed:\n" + "\n".join(violations))
        return True

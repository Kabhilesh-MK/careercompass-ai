"""
LearningRecommendationService — Curated Learning Catalog Mapping Engine.

Matches prioritized missing competencies directly to verified educational
courseware, specializations, and industry simulations from the CareerCompass catalog.
"""

from __future__ import annotations

from typing import Dict, List, Optional
from app.schemas.career_intelligence import LearningRecommendation, PrioritizedGap
from app.services.career_ontology import CareerOntologyService


# Curated catalog of educational resources mapped to canonical skills
CURATED_RESOURCE_CATALOG: Dict[str, List[dict]] = {
    "programming": [
        {
            "resource_id": "res-prog-foundations",
            "title": "Algorithmic Thinking & Software Construction",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Beginner",
            "estimated_effort": "20 hours",
            "roadmap_stage": 1,
            "url": None,
        }
    ],
    "python": [
        {
            "resource_id": "res-py-foundations",
            "title": "Python for Applied Data Science & AI",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Beginner",
            "estimated_effort": "18 hours",
            "roadmap_stage": 1,
            "url": None,
        }
    ],
    "database_systems": [
        {
            "resource_id": "res-sql-analytics",
            "title": "Advanced SQL for Data Engineers & Analysts",
            "provider": "DataCamp",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "14 hours",
            "roadmap_stage": 2,
            "url": None,
        }
    ],
    "database_design": [
        {
            "resource_id": "res-db-design",
            "title": "Relational Data Modeling & Schema Normalization",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "12 hours",
            "roadmap_stage": 2,
            "url": None,
        }
    ],
    "web_development": [
        {
            "resource_id": "res-web-dev-fullstack",
            "title": "Full-Stack Web Development & High-Performance REST APIs",
            "provider": "Coursera",
            "resource_type": "Specialization",
            "difficulty": "Intermediate",
            "estimated_effort": "24 hours",
            "roadmap_stage": 2,
            "url": None,
        }
    ],
    "data_analysis": [
        {
            "resource_id": "res-eda-pandas",
            "title": "Exploratory Data Analysis with Pandas & NumPy",
            "provider": "DataCamp",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "16 hours",
            "roadmap_stage": 2,
            "url": None,
        }
    ],
    "machine_learning": [
        {
            "resource_id": "res-ml-specialization",
            "title": "Machine Learning Specialization: Supervised to Unsupervised",
            "provider": "Coursera",
            "resource_type": "Specialization",
            "difficulty": "Intermediate",
            "estimated_effort": "32 hours",
            "roadmap_stage": 2,
            "url": None,
        }
    ],
    "ai": [
        {
            "resource_id": "res-deep-learning-ai",
            "title": "Deep Learning & Neural Network Architectures",
            "provider": "Coursera",
            "resource_type": "Specialization",
            "difficulty": "Advanced",
            "estimated_effort": "28 hours",
            "roadmap_stage": 3,
            "url": None,
        }
    ],
    "cloud": [
        {
            "resource_id": "res-docker-cloud",
            "title": "Containerizing Microservices with Docker & Cloud Compute",
            "provider": "Pluralsight",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "15 hours",
            "roadmap_stage": 3,
            "url": None,
        }
    ],
    "critical_thinking": [
        {
            "resource_id": "res-critical-thinking-dev",
            "title": "Analytical Problem Solving & Technical Root-Cause Analysis",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "10 hours",
            "roadmap_stage": 3,
            "url": None,
        }
    ],
    "excel": [
        {
            "resource_id": "res-excel-bi",
            "title": "Advanced Excel for Business Analytics & Financial Modeling",
            "provider": "DataCamp",
            "resource_type": "Course",
            "difficulty": "Beginner",
            "estimated_effort": "12 hours",
            "roadmap_stage": 1,
            "url": None,
        }
    ],
    "communication": [
        {
            "resource_id": "res-data-storytelling",
            "title": "Data Storytelling & Executive Technical Communication",
            "provider": "Forage",
            "resource_type": "Simulation",
            "difficulty": "Intermediate",
            "estimated_effort": "8 hours",
            "roadmap_stage": 3,
            "url": None,
        }
    ],
    "research": [
        {
            "resource_id": "res-applied-research",
            "title": "Empirical Research Methods & Quantitative Benchmarking",
            "provider": "edX",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "14 hours",
            "roadmap_stage": 4,
            "url": None,
        }
    ],
    "experimentation": [
        {
            "resource_id": "res-ab-testing",
            "title": "Controlled Experimentation & Statistical A/B Testing",
            "provider": "DataCamp",
            "resource_type": "Course",
            "difficulty": "Advanced",
            "estimated_effort": "12 hours",
            "roadmap_stage": 4,
            "url": None,
        }
    ],
    "simulation": [
        {
            "resource_id": "res-system-simulation",
            "title": "System Performance Simulation & Load Modeling",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Advanced",
            "estimated_effort": "15 hours",
            "roadmap_stage": 4,
            "url": None,
        }
    ],
    "design": [
        {
            "resource_id": "res-system-design-patterns",
            "title": "Software Architecture Principles & Scalable Design Patterns",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "18 hours",
            "roadmap_stage": 4,
            "url": None,
        }
    ],
    "design_optimization": [
        {
            "resource_id": "res-profiling-optimization",
            "title": "High-Throughput Systems & Algorithmic Profiling",
            "provider": "Pluralsight",
            "resource_type": "Course",
            "difficulty": "Advanced",
            "estimated_effort": "20 hours",
            "roadmap_stage": 4,
            "url": None,
        }
    ],
    "team_management": [
        {
            "resource_id": "res-engineering-management",
            "title": "Agile Engineering Leadership & Cross-Functional Delivery",
            "provider": "Coursera",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "12 hours",
            "roadmap_stage": 5,
            "url": None,
        }
    ],
    "negotiation": [
        {
            "resource_id": "res-stakeholder-negotiation",
            "title": "Strategic Stakeholder Negotiation & Technical Influence",
            "provider": "edX",
            "resource_type": "Course",
            "difficulty": "Intermediate",
            "estimated_effort": "10 hours",
            "roadmap_stage": 5,
            "url": None,
        }
    ],
}


class LearningRecommendationService:
    """Service recommending catalog learning resources for missing competencies."""

    def __init__(self, ontology_service: CareerOntologyService | None = None) -> None:
        self.ontology_service = ontology_service or CareerOntologyService.get_instance()

    def get_recommendations_for_gaps(
        self,
        target_track: str,
        prioritized_gaps: List[PrioritizedGap],
    ) -> List[LearningRecommendation]:
        """
        Maps prioritized missing skills to curated catalog learning resources.
        Preserves roadmap and priority ordering.
        """
        recommendations: List[LearningRecommendation] = []
        ontology = self.ontology_service.get_track_ontology(target_track)

        for gap in prioritized_gaps:
            skill = gap.skill
            catalog_entries = CURATED_RESOURCE_CATALOG.get(skill, [])
            meta = ontology.skills_metadata.get(skill)
            stage = meta.stage if meta else 2

            for entry in catalog_entries:
                recommendations.append(
                    LearningRecommendation(
                        resource_id=entry["resource_id"],
                        title=entry["title"],
                        provider=entry["provider"],
                        skill=skill,
                        resource_type=entry["resource_type"],
                        difficulty=entry["difficulty"],
                        estimated_effort=entry["estimated_effort"],
                        roadmap_stage=entry.get("roadmap_stage", stage),
                        url=entry.get("url"),
                        prerequisites=gap.prerequisites,
                        prerequisites_met=gap.prerequisites_met,
                    )
                )

        return recommendations

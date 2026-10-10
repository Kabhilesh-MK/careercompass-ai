"""
SkillGapService — Deterministic Skill Gap and Coverage Analysis Engine.

Calculates present/missing competencies, required skill coverage, and
prioritized gaps directly from the CareerCompass Ontology.
"""

from __future__ import annotations

from typing import Dict, List, Set, Tuple
from app.schemas.career_intelligence import PrioritizedGap, RequiredSkillCoverage
from app.services.career_ontology import CareerOntologyService, TrackOntology


class SkillGapService:
    """Service evaluating candidate skills against track ontology requirements."""

    def __init__(self, ontology_service: CareerOntologyService | None = None) -> None:
        self.ontology_service = ontology_service or CareerOntologyService.get_instance()

    def analyze_gaps(
        self,
        recognized_skills: List[str],
        target_track: str,
    ) -> Tuple[List[str], List[str], List[str], RequiredSkillCoverage, List[PrioritizedGap]]:
        """
        Performs deterministic gap analysis for a validated target track:
        1. Retrieves required skills from track ontology.
        2. Partitions into present and missing skills.
        3. Computes transparent required-skill coverage.
        4. Prioritizes missing skills based on ontology tier and prerequisite readiness.

        Returns:
            (required_skills, present_required, missing_required, coverage, prioritized_gaps)
        """
        ontology: TrackOntology = self.ontology_service.get_track_ontology(target_track)
        required_skills = ontology.all_required_skills
        rec_set = set(recognized_skills)

        present_required = [s for s in required_skills if s in rec_set]
        missing_required = [s for s in required_skills if s not in rec_set]

        # Calculate mathematically transparent coverage ratio
        total_required_count = len(required_skills)
        present_count = len(present_required)
        coverage_decimal = round(present_count / total_required_count, 4) if total_required_count > 0 else 0.0
        coverage_percentage = round(coverage_decimal * 100.0, 1)

        coverage = RequiredSkillCoverage(
            decimal=coverage_decimal,
            percentage=coverage_percentage,
            present_count=present_count,
            required_count=total_required_count,
        )

        # Build prioritized gaps
        # Prioritization algorithm:
        # Tier weights: core=1, supporting=2, advanced=3
        # Sub-sort: prerequisites_met (True before False), then recommended_learning_order index
        tier_weight = {"core": 1, "supporting": 2, "advanced": 3}
        order_index_map = {skill: i for i, skill in enumerate(ontology.recommended_learning_order)}

        raw_gaps: List[dict] = []
        for skill in missing_required:
            meta = ontology.skills_metadata.get(skill)
            tier = meta.tier if meta else "supporting"
            reason = meta.reason if meta else f"Required competency for {target_track}."
            prereqs = ontology.prerequisites.get(skill, [])
            prereqs_met = all(p in rec_set for p in prereqs)

            raw_gaps.append({
                "skill": skill,
                "tier": tier,
                "reason": reason,
                "prerequisites": prereqs,
                "prerequisites_met": prereqs_met,
                "sort_key": (
                    tier_weight.get(tier, 2),
                    0 if prereqs_met else 1,
                    order_index_map.get(skill, 99),
                ),
            })

        # Deterministic sort
        raw_gaps.sort(key=lambda g: g["sort_key"])

        prioritized_gaps: List[PrioritizedGap] = [
            PrioritizedGap(
                skill=g["skill"],
                priority=g["tier"],
                category=g["tier"],
                reason=g["reason"],
                prerequisites=g["prerequisites"],
                prerequisites_met=g["prerequisites_met"],
                recommended_order=idx + 1,
            )
            for idx, g in enumerate(raw_gaps)
        ]

        return (
            required_skills,
            present_required,
            missing_required,
            coverage,
            prioritized_gaps,
        )

"""
RoadmapService — Deterministic Career Roadmap Generation Engine & Legacy Storage.

Constructs progressive 5-stage career progression roadmaps based on
curated ontology competency milestones and student skill state.
Also maintains backwards-compatible MongoDB persistence functions.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, List, Optional, Set
from bson import ObjectId

from app.database.connection import get_db
from app.schemas.career_intelligence import RoadmapItem
from app.services.career_ontology import CareerOntologyService, TrackOntology
from app.utils.helpers import oid_to_str


class RoadmapService:
    """Service generating staged roadmap milestones for target career tracks."""

    def __init__(self, ontology_service: CareerOntologyService | None = None) -> None:
        self.ontology_service = ontology_service or CareerOntologyService.get_instance()

    def generate_roadmap(
        self,
        target_track: str,
        recognized_skills: List[str],
    ) -> List[RoadmapItem]:
        """
        Generates deterministic 5-stage roadmap items for target career track.
        Sets initial status to 'completed' if the skill is recognized in input,
        otherwise 'not_started'.
        """
        ontology: TrackOntology = self.ontology_service.get_track_ontology(target_track)
        rec_set = set(recognized_skills)

        roadmap_items: List[RoadmapItem] = []

        # Iterate through the ontology's skills in recommended learning order
        for skill in ontology.recommended_learning_order:
            meta = ontology.skills_metadata.get(skill)
            if not meta:
                continue

            stage = meta.stage
            stage_title = self.ontology_service.get_stage_title(stage)
            prereqs = ontology.prerequisites.get(skill, [])
            prereqs_met = all(p in rec_set for p in prereqs)
            is_present = skill in rec_set

            item_id = f"rm-{ontology.slug}-s{stage}-{skill}"

            roadmap_items.append(
                RoadmapItem(
                    id=item_id,
                    stage=stage,
                    stage_title=stage_title,
                    title=meta.title,
                    skill=skill,
                    status="completed" if is_present else "not_started",
                    prerequisites=prereqs,
                    prerequisites_met=prereqs_met,
                    priority=meta.tier,
                    description=meta.description,
                )
            )

        # Sort primarily by stage (1-5), maintaining pedagogical sequence within stage
        roadmap_items.sort(key=lambda item: item.stage)

        return roadmap_items


# ---------------------------------------------------------------------------
# Backwards-compatible async persistence functions for legacy MongoDB routes
# ---------------------------------------------------------------------------

async def upsert_roadmap(user_id: str, target_role: str, milestones: list[Any]) -> dict:
    """Persists roadmap milestones to MongoDB for the specified user."""
    db = get_db()
    now = datetime.now(timezone.utc)
    milestones_data = []
    for m in milestones:
        if hasattr(m, "model_dump"):
            milestones_data.append(m.model_dump())
        elif hasattr(m, "dict"):
            milestones_data.append(m.dict())
        else:
            milestones_data.append(m)

    doc = {
        "user_id": user_id,
        "target_role": target_role,
        "milestones": milestones_data,
        "updated_at": now,
    }
    res = await db.roadmaps.find_one_and_update(
        {"user_id": user_id},
        {"$set": doc, "$setOnInsert": {"created_at": now}},
        upsert=True,
        return_document=True,
    )
    return oid_to_str(res) or doc


async def get_or_generate_roadmap(
    user_id: str,
    career_identifier: Optional[str] = None,
    force_regenerate: bool = False,
) -> dict:
    """Retrieves existing roadmap or generates default milestones."""
    db = get_db()
    if not force_regenerate:
        existing = await db.roadmaps.find_one({"user_id": user_id})
        if existing:
            return oid_to_str(existing)

    target_role = career_identifier or "Software Engineer"
    milestones = [
        {
            "id": f"ms-{i+1}",
            "week": f"Phase {i+1}",
            "title": t,
            "description": f"Master core competency in {t}.",
            "tasks": [f"Learn {t} theory", f"Complete {t} project"],
            "target_skills": [t.lower()],
            "priority": "Important",
            "status": "not_started",
            "progress": 0,
            "projects": [],
            "certifications": [],
            "resources": [],
        }
        for i, t in enumerate(["Programming Foundations", "Relational Databases", "Web Architectures", "Cloud & Deployment"])
    ]
    return await upsert_roadmap(user_id, target_role, milestones)


async def update_milestone(
    roadmap_id: str,
    milestone_index: int,
    status: str,
    progress: int,
    user_id: str,
) -> dict:
    """Updates a specific milestone's progress in MongoDB."""
    db = get_db()
    now = datetime.now(timezone.utc)
    update_fields = {
        f"milestones.{milestone_index}.status": status,
        f"milestones.{milestone_index}.progress": progress,
        "updated_at": now,
    }
    res = await db.roadmaps.find_one_and_update(
        {"_id": ObjectId(roadmap_id), "user_id": user_id},
        {"$set": update_fields},
        return_document=True,
    )
    if not res:
        res = await db.roadmaps.find_one_and_update(
            {"_id": ObjectId(roadmap_id)},
            {"$set": update_fields},
            return_document=True,
        )
    return oid_to_str(res) if res else {"status": "ok"}

"""Visualization data helpers.

Returns chart-ready data structures that the frontend can consume directly:
  • career_probability_chart  — bar/pie chart data
  • skill_gap_chart           — radar / grouped bar data
  • placement_score_chart     — radar / gauge data
  • roadmap_progress          — progress timeline data
"""

from __future__ import annotations

from typing import Any


def build_visualization_data(
    top_careers: list[dict[str, Any]],
    skill_gap: dict[str, Any],
    placement: dict[str, Any],
    roadmap: list[dict[str, Any]],
) -> dict[str, Any]:
    """Assemble all chart payloads."""
    return {
        "career_probability_chart": _career_probability_chart(top_careers),
        "skill_gap_chart": _skill_gap_chart(skill_gap),
        "placement_score_chart": _placement_score_chart(placement),
        "roadmap_progress": _roadmap_progress(roadmap),
    }


def _career_probability_chart(top_careers: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "type": "bar",
        "title": "Top Career Matches",
        "labels": [c["career"] for c in top_careers],
        "datasets": [
            {
                "label": "Match Probability (%)",
                "data": [round(c["probability"], 1) for c in top_careers],
            }
        ],
    }


def _skill_gap_chart(skill_gap: dict[str, Any]) -> dict[str, Any]:
    current_skills = skill_gap.get("current_skills", [])
    missing_skills = skill_gap.get("missing_skills", [])

    # Combine for a grouped bar: current vs required
    labels = [s["name"] for s in current_skills[:10]]
    current_vals = [s["level"] for s in current_skills[:10]]

    # Map required levels
    required_map = {s["name"]: s["required"] for s in missing_skills}
    required_vals = [required_map.get(name, 60) for name in labels]

    return {
        "type": "radar",
        "title": f"Skill Gap — {skill_gap.get('target_career', '')}",
        "labels": labels,
        "datasets": [
            {"label": "Your Level", "data": current_vals},
            {"label": "Required Level", "data": required_vals},
        ],
        "match_percentage": skill_gap.get("match_percentage", 0),
    }


def _placement_score_chart(placement: dict[str, Any]) -> dict[str, Any]:
    components = placement.get("components", {})
    labels = [k.replace("_", " ").title() for k in components]
    values = list(components.values())
    return {
        "type": "radar",
        "title": "Placement Readiness",
        "labels": labels,
        "datasets": [{"label": "Your Score", "data": values}],
        "overall_score": placement.get("overall_score", 0),
        "readiness_level": placement.get("readiness_level", ""),
    }


def _roadmap_progress(roadmap: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "type": "timeline",
        "title": "6-Week Learning Roadmap",
        "milestones": [
            {
                "week": m.get("week"),
                "title": m.get("title"),
                "status": m.get("status"),
                "progress": m.get("progress", 0),
            }
            for m in roadmap
        ],
    }

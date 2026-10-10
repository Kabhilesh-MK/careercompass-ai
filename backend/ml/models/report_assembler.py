"""Full ML report assembler.

Orchestrates prediction → skill gap → placement → recommendations → roadmap
and returns a single JSON-serialisable dict consumed by the FastAPI route.
"""

from __future__ import annotations

from typing import Any

from loguru import logger

from ml.prediction.predictor import predict
from ml.prediction.skill_gap import analyse as skill_gap_analyse
from ml.prediction.placement import calculate as placement_calculate
from ml.recommendation.recommender import recommend
from ml.recommendation.roadmap_generator import generate as roadmap_generate
from ml.utils.visualization import build_visualization_data


def generate_full_report(profile: dict[str, Any]) -> dict[str, Any]:
    """Run the entire ML pipeline for one student profile.

    Parameters
    ----------
    profile:
        Dict of skill_name → score (0-100) plus profile meta-fields.

    Returns
    -------
    Full report dict with keys:
        prediction, skill_gap, placement, recommendations, roadmap,
        visualization_data
    """
    logger.info("Generating ML report for profile …")

    # 1. Career prediction
    prediction = predict(profile)
    predicted_career: str = prediction["predicted_career"]

    # 2. Skill gap for the predicted career
    skill_gap = skill_gap_analyse(profile, predicted_career)

    # 3. Placement readiness (tailored to predicted career)
    placement = placement_calculate(profile, target_career=predicted_career)

    # 4. Recommendations
    missing_skill_names = [s["name"] for s in skill_gap["missing_skills"]]
    recommendations = recommend(
        predicted_career=predicted_career,
        missing_skills=missing_skill_names,
        current_skill_levels={
            k: v for k, v in profile.items() if isinstance(v, (int, float))
        },
    )

    # 5. Learning roadmap
    roadmap = roadmap_generate(
        predicted_career=predicted_career,
        missing_skills=skill_gap["missing_skills"],
        profile=profile,
    )

    # 6. Visualization data
    viz = build_visualization_data(
        top_careers=prediction["top_5_careers"],
        skill_gap=skill_gap,
        placement=placement,
        roadmap=roadmap,
    )

    return {
        "prediction": prediction,
        "skill_gap": skill_gap,
        "placement": placement,
        "recommendations": recommendations,
        "roadmap": roadmap,
        "visualization_data": viz,
    }

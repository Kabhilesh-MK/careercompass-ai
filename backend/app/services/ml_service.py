"""ML prediction service — thin async wrapper around the synchronous ML engine.

Heavy ML operations (model inference) run in a thread pool via
``asyncio.to_thread`` so they don't block the FastAPI event loop.
"""

from __future__ import annotations

import asyncio
from typing import Any

from loguru import logger

from ml.models.report_assembler import generate_full_report
from ml.prediction.predictor import predict, reload_artifacts


async def run_full_prediction(profile_dict: dict[str, Any]) -> dict[str, Any]:
    """Async wrapper: run the full ML pipeline in a thread pool executor."""
    logger.info("ML prediction request received.")
    result = await asyncio.to_thread(generate_full_report, profile_dict)
    return result


async def retrain_models() -> dict[str, Any]:
    """Re-run the training pipeline (admin-only usage).

    Runs in a thread pool and reloads the cached artifacts when done.
    """
    logger.info("Retraining ML models …")

    def _train() -> dict[str, Any]:
        from ml.training.run_training import run
        run()
        reload_artifacts()
        return {"status": "retrained"}

    return await asyncio.to_thread(_train)

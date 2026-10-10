"""
Performance Benchmark Script for CareerCompass (Phase 7).

Measures:
- Model Loading Time
- Prediction Latency (/api/v1/predictions/career)
- Explanation Latency (/api/v1/predictions/career/explain)
- Career Intelligence Latency (/api/v1/career/intelligence)
- Project Recommendation Latency (/api/v1/career/projects/recommendations)

Computes:
- Sample Count
- Mean Latency (ms)
- Median Latency (ms)
- Min Latency (ms)
- Max Latency (ms)
"""

import time
import statistics
import json
import sys
from pathlib import Path

# Add backend directory to sys.path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from fastapi.testclient import TestClient

from app.main import app
from app.services.model_service import ModelService

def benchmark_service():
    print("=" * 60)
    print("CAREERCOMPASS PERFORMANCE BENCHMARK SUITE")
    print("=" * 60)

    # 1. Model Loading Time
    ModelService.reset_instance()
    t0 = time.perf_counter()
    svc = ModelService.get_instance()
    svc.load_artifacts()
    load_time_ms = (time.perf_counter() - t0) * 1000.0
    print(f"\n[1] Model Artifact Loading Time: {load_time_ms:.2f} ms")

    client = TestClient(app)

    # 2. Warmup requests
    sample_skills = ["python", "machine_learning", "data_analysis", "sql"]
    client.post("/api/v1/predictions/career", json={"skills": sample_skills})
    client.post("/api/v1/career/intelligence", json={"skills": sample_skills})

    N = 50

    endpoints = [
        ("Career Prediction", "/api/v1/predictions/career", {"skills": ["python", "ai", "programming"]}),
        ("Career Explanation", "/api/v1/predictions/career/explain", {"skills": ["python", "ai", "programming"]}),
        ("Career Intelligence", "/api/v1/career/intelligence", {"skills": ["python", "programming", "web_development"]}),
        ("Project Recommendations", "/api/v1/career/projects/recommendations", {"skills": ["python", "ai", "programming"]}),
    ]

    results = {
        "model_loading_ms": round(load_time_ms, 2),
        "benchmarks": {}
    }

    for name, path, payload in endpoints:
        latencies = []
        for _ in range(N):
            start = time.perf_counter()
            resp = client.post(path, json=payload)
            dur = (time.perf_counter() - start) * 1000.0
            if resp.status_code == 200:
                latencies.append(dur)
            else:
                print(f"Warning: request failed with {resp.status_code}: {resp.text}")

        mean_val = statistics.mean(latencies)
        median_val = statistics.median(latencies)
        min_val = min(latencies)
        max_val = max(latencies)

        results["benchmarks"][name] = {
            "requests": len(latencies),
            "mean_ms": round(mean_val, 2),
            "median_ms": round(median_val, 2),
            "min_ms": round(min_val, 2),
            "max_ms": round(max_val, 2),
        }

        print(f"\n[{name}] ({len(latencies)} requests)")
        print(f"  Mean:   {mean_val:.2f} ms")
        print(f"  Median: {median_val:.2f} ms")
        print(f"  Min:    {min_val:.2f} ms")
        print(f"  Max:    {max_val:.2f} ms")

    # Output JSON summary for reports
    out_path = Path("backend/scripts/performance_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nBenchmark results saved to {out_path.resolve()}")
    print("=" * 60)

if __name__ == "__main__":
    benchmark_service()

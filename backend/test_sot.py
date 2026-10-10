import joblib
from app.services.career_discovery_service import (
    CANONICAL_CAREERS,
    resolve_canonical_career,
    get_canonical_career_detail,
    to_slug
)
from ml.prediction.skill_gap import CAREER_SKILL_TIERS, analyse as analyse_skill_gap
from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE

le = joblib.load("ml/saved_models/label_encoder.pkl")
le_classes = list(le.classes_)

print("Checking Source-of-Truth Consistency across all 14 careers...")
for c in CANONICAL_CAREERS:
    # 1. Career catalogue name == c
    assert c in KNOWLEDGE_BASE, f"{c} not in KNOWLEDGE_BASE"
    
    # 2. ML label encoder name == c
    assert c in le_classes, f"{c} not in label_encoder classes"
    
    # 3. Career detail identifier resolves to c
    slug = to_slug(c)
    assert resolve_canonical_career(slug) == c, f"Slug {slug} does not resolve to {c}"
    detail = get_canonical_career_detail(c)
    assert detail["title"] == c, f"Detail title mismatch {detail['title']} != {c}"
    
    # 4. Skill-gap career identifier resolves to c
    assert c in CAREER_SKILL_TIERS, f"{c} not in CAREER_SKILL_TIERS"
    sg = analyse_skill_gap({}, c)
    assert sg["target_career"] == c, f"Skill gap target_career mismatch: {sg['target_career']} != {c}"
    
    # 5. Project recommendation career identifier
    projects = detail["projects"]
    assert len(projects) > 0, f"No projects for {c}"
    
    # 6. Certification recommendation career identifier
    certs = detail["certifications"]
    assert len(certs) > 0, f"No certs for {c}"
    
    # 7. Comparison identifier
    assert resolve_canonical_career(c) == c
    assert resolve_canonical_career(c.lower()) == c
    print(f"  [PASS] {c} -> slug: {slug}")

print("\nSOURCE-OF-TRUTH CONSISTENCY TEST: 100% PASS for all 14 canonical careers!")

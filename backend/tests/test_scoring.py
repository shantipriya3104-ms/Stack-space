from app.scoring import evaluate

def test_empty_project_scores_zero_and_returns_actions():
    data = {key: False for key in [
        "has_tests", "has_ci", "has_docker", "has_monitoring", "has_logging",
        "has_https", "has_secrets_management", "has_backups", "has_health_checks", "has_scaling_plan"
    ]}
    score, level, categories, recommendations = evaluate(data)
    assert score == 0
    assert level == "Early stage"
    assert len(categories) == 4
    assert recommendations

def test_fully_ready_project_scores_one_hundred():
    data = {key: True for key in [
        "has_tests", "has_ci", "has_docker", "has_monitoring", "has_logging",
        "has_https", "has_secrets_management", "has_backups", "has_health_checks", "has_scaling_plan"
    ]}
    score, level, categories, recommendations = evaluate(data)
    assert score == 100
    assert level == "Strong"
    assert all(value == 100 for value in categories.values())

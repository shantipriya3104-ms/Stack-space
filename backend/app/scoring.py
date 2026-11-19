def evaluate(data: dict):
    groups = {
        "Delivery": [("Automated tests", "has_tests", 1), ("CI pipeline", "has_ci", 1), ("Containerization", "has_docker", 1)],
        "Security": [("HTTPS", "has_https", 1), ("Secrets management", "has_secrets_management", 1)],
        "Operations": [("Monitoring", "has_monitoring", 1), ("Centralized logging", "has_logging", 1), ("Health checks", "has_health_checks", 1)],
        "Resilience & scale": [("Database backups", "has_backups", 1), ("Scaling plan", "has_scaling_plan", 1)],
    }
    categories, recommendations = {}, []
    total, earned = 0, 0
    for category, checks in groups.items():
        possible = sum(weight for _, _, weight in checks)
        points = sum(weight for _, key, weight in checks if data.get(key, False))
        categories[category] = round(points / possible * 100)
        total += possible
        earned += points
        for label, key, _ in checks:
            if not data.get(key, False):
                recommendations.append(f"Add {label.lower()} to strengthen your {category.lower()} practices.")
    score = round(earned / total * 100)
    level = "Strong" if score >= 80 else "Developing" if score >= 50 else "Early stage"
    if not recommendations:
        recommendations.append("Keep reviewing dependencies, access permissions, and recovery procedures regularly.")
    return score, level, categories, recommendations

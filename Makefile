.PHONY: test test-back test-front lint security security-back security-front security-infra trivy-scan help

all: test lint security

test: test-back test-front

lint: lint-back lint-front

security: security-secrets security-back security-front trivy-scan

test-back:
	@echo "🐍 --- BACKEND TESTS ---"
	docker exec -it -e PYTHONPATH=/app cinops-backend-1 pytest

test-front:
	@echo "⚛️  --- FRONTEND TESTS ---"
	docker exec -it cinops-frontend-1 npm test -- run

lint-back:
	@echo "🐍 --- BACKEND LINTING (Flake8) ---"
	docker exec -it cinops-backend-1 flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics --exclude=frontend,venv,.git,__pycache__
	docker exec -it cinops-backend-1 flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics --exclude=frontend,venv,.git,__pycache__

lint-front:
	@echo "⚛️  --- FRONTEND LINTING (ESLint) ---"
	docker exec -it cinops-frontend-1 npm run lint

security-secrets:
	@echo "🕵️  --- SECRETS SCANNING (Gitleaks) ---"
	docker run --rm -v $(PWD):/path zricethezav/gitleaks:latest detect --source="/path" --no-git -v

security-back:
	@echo "🐍 --- BACKEND SAST (Bandit) ---"
	docker exec -it cinops-backend-1 bandit -r . -x ./tests -ll

security-front:
	@echo "⚛️  --- FRONTEND AUDIT (NPM) ---"
	docker exec -it cinops-frontend-1 npm audit --audit-level=high

trivy-scan:
	@echo "🐳 --- IMAGE AND CONFIG SCANNING (Trivy) ---"
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $(PWD):/app aquasec/trivy:latest fs /app --scanners vuln,secret,misconfig

shell-back:
	docker exec -it cinops-backend-1 bash
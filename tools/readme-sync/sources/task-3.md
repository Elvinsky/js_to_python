# {{TASK_TITLE}}

> Part of **Python Kick-Start**: {{SECTION_TITLE}} ({{TIMESPAN}}). This repository is a **forkable starting point**:
> fork it, clone your fork, and build the task.

{{INCLUDE:venv-setup}}

This repository has **two independent uv projects**, `services/auth` and `services/core`, so `make setup` creates two
virtual environments. Run a service's own commands from inside its folder (`cd services/auth && uv run pytest`) or use
the `make` targets from the root, which run in both services.

{{INCLUDE:fork-workflow}}

## 3. Task description

{{OVERVIEW}}

## 4. What already exists in this repository

{{EXISTS}}

Everything else is yours to create: the code of both services, their tests and migrations, the Dockerfiles,
`compose.yaml`, `ARCHITECTURE.md` and all Kubernetes manifests. Until you have written tests, `make test` fails because
pytest finds none: that is expected.

## 5. What you need to do (acceptance criteria)

{{ACCEPTANCE_CRITERIA}}

## 6. Step-by-step setup

{{STEPS}}

Hints for the infrastructure: you choose how to run PostgreSQL and Redis. Compose is the natural place for local
development. For the cluster you can reach those containers from the pods through `host.k3d.internal` (publish their
ports on your machine), or run the databases inside the cluster with a Helm chart or an operator. Create Secrets with
`kubectl create secret` instead of writing real values into YAML. `k3d` bundles the Traefik ingress controller; do not
use Ingress NGINX, which the Kubernetes project retired in March 2026.

## 7. Tech stack requirements

{{TECH_STACK}}

## 8. Recommended stack

{{RECOMMENDED_STACK}}

## 9. Architecture guidelines

{{GUIDELINES}}

## 10. Study first

Topics from the Python Kick-Start roadmap for this section:

{{RELEVANT_TOPICS}}

## Definition of done

- [ ] every acceptance criterion above is met
- [ ] `make check` is green
- [ ] `docker compose up --build` starts both services, their databases and Redis
- [ ] the cluster runs two replicas of each service behind one Ingress, and you demonstrated the resilience steps
- [ ] each service has its committed Alembic migration and `uv.lock`; no secrets, `.env` files or `.venv` are committed
- [ ] `ARCHITECTURE.md` is complete and matches the code

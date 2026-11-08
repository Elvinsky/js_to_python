# {{TASK_TITLE}}

> Part of **Python Kick-Start**: {{SECTION_TITLE}} ({{TIMESPAN}}). This repository is a **forkable template**:
> fork it, clone your fork, and implement everything marked `TODO` until all acceptance tests pass.

{{INCLUDE:venv-setup}}

This repository has **three independent uv projects**, so `make setup` creates three virtual environments:
the repository root (static checks for Dockerfiles, Compose and Kubernetes manifests), `services/auth` and
`services/core`. Run a service's own commands from inside its folder (`cd services/auth && uv run pytest`) or use
the `make` targets from the root.

{{INCLUDE:fork-workflow}}

## 3. Task description

{{OVERVIEW}}

## 4. Acceptance criteria

{{ACCEPTANCE_CRITERIA}}

## 5. What the template gives you, and what is yours

| Path | State | Purpose |
|---|---|---|
| `Makefile`, `.python-version`, `pyproject.toml` | provided | tooling for the three projects |
| `services/auth/app/{config,models,schemas,deps,database,logging_config,health,main}.py` | provided | settings, `users` table, schemas, dependencies, structlog setup, `/health` and `/ready` |
| `services/auth/app/security.py` | **TODO (AC 1, AC 2)** | `hash_password`, `verify_password` (Argon2id), `create_access_token` (JWT) |
| `services/auth/app/otp.py` | **TODO (AC 1)** | `issue_otp`, `verify_otp` on Redis |
| `services/auth/app/routers/auth.py` | **TODO (AC 1, AC 2, AC 6)** | `/auth/register`, `/auth/verify-otp`, `/auth/login` and the log events |
| `services/auth/tests/test_otp.py` | **TODO (AC 5)** | your OTP tests with fakeredis |
| `services/core/app/{config,models,schemas,deps,database,logging_config,health,main}.py` | provided | settings, `items` and `orders` tables, schemas, dependencies |
| `services/core/app/security.py` | **TODO (AC 3, AC 4)** | `get_current_user` (local JWT validation) and `require_roles` |
| `services/core/app/routers/{items,orders}.py` | **TODO (AC 4)** | price override, stock edit, order placement (the listing endpoint is a worked example) |
| `services/core/tests/test_guards.py` | **TODO (AC 5)** | your guard-matrix tests |
| `services/*/alembic/` | provided, **TODO (AC 10)** | async Alembic environment; you generate the first migration |
| `services/*/Dockerfile` | **TODO (AC 7)** | multi-stage, non-root image |
| `compose.yaml` | **yours to create (AC 7)** | the whole local stack: `auth`, `core`, their two databases and Redis |
| `ARCHITECTURE.md` | **TODO (AC 8)** | boundaries, JWT claims, error format, data ownership, URL prefixes |
| `deploy/k8s/base/` and `deploy/k8s/overlays/local/` | **yours to create (AC 9, AC 10)** | every Kubernetes manifest and the two Kustomize files; nothing is provided |
| `**/tests/acceptance/` | provided, do not edit | one file per acceptance criterion |

### Service contracts

**Auth** (mounted under `/auth`):

| Endpoint | Success | Errors |
|---|---|---|
| `POST /auth/register` `{email, password}` | `201` user without password or hash; role `user`, not verified; an OTP is stored in Redis | `409` email exists, `422` invalid body |
| `POST /auth/verify-otp` `{email, code}` | `200` user, now verified; the code is deleted (single use) | `400` or `401` wrong or expired code |
| `POST /auth/login` (OAuth2 password form, `username` = email) | `200` `{access_token, token_type: "bearer"}`; JWT claims `sub` (string), `role`, `exp` | `401` bad credentials, `403` not verified |

OTP: Redis key `otp:{email}`, a 6-digit string, TTL `OTP_TTL_SECONDS`, never returned by the API.
Log events (JSON, structlog): `user_registered`, `otp_issued`, `otp_verified`, `otp_failed`, `login_succeeded`, `login_failed`.
Never log a password, a hash, a code or a token.

**Core** (mounted under `/api`, `/health` and `/ready` at the root):

| Endpoint | Allowed roles | Result |
|---|---|---|
| `GET /api/items` | any authenticated user | `200` list |
| `PATCH /api/items/{item_id}/price` `{price}` | `moderator`, `admin` | `200` item, `404` unknown, `422` invalid |
| `PATCH /api/items/{item_id}/stock` `{stock}` | `moderator`, `admin` | `200` item, `404` unknown, `422` invalid |
| `POST /api/orders` `{item_id, quantity}` | `user` only | `201` order and stock decremented, `404` unknown item, `409` not enough stock |

Missing, malformed, tampered or expired token, or a token without `sub`, `role` or `exp`: `401` with `WWW-Authenticate: Bearer`.
Valid token with the wrong role: `403`. Core validates tokens with the shared key and never calls Auth.

### What the infrastructure tests look for

Building the infrastructure is your job: the template contains no Compose file, no Kubernetes manifests and no
helper scripts. The static tests only fix the names below so they can find your work.

| Area | Expected |
|---|---|
| `compose.yaml` (repo root) | services `auth`, `core`, `auth-db`, `core-db`, `redis`; `auth` and `core` built from `./services/auth` and `./services/core`; databases have a healthcheck and the services wait with `condition: service_healthy`; `auth` needs `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `core` needs `DATABASE_URL`, `JWT_SECRET` (same secret as Auth); each service points at its own database host |
| `services/{auth,core}/Dockerfile` | at least two stages, pinned base tag (never `latest`), `uv sync --frozen --no-dev`, copy from the builder stage, non-root `USER`, no secrets in `ENV`/`ARG`, start `uvicorn app.main:app` |
| `deploy/k8s/base/kustomization.yaml` | lists every resource file; `deploy/k8s/overlays/local/kustomization.yaml` lists `../../base` |
| Namespace | `kickstart`, and every other resource sets `namespace: kickstart` |
| Per service (`auth`, `core`) | Deployment named after the service with 2 replicas; image `kickstart/<service>:<tag>` (pinned); `envFrom` a ConfigMap `<service>-config` and a Secret `<service>-secrets`; readiness probe `/ready`, liveness probe `/health`; CPU and memory requests; a ClusterIP Service on port 80 selecting the pods |
| Ingress | exactly one, `ingressClassName: traefik`, `/auth` routes to `auth` and `/api` to `core` |
| Secrets | `deploy/k8s/base/secret.example.yaml` documents `auth-secrets` and `core-secrets` (keys `DATABASE_URL`, `JWT_SECRET`) with placeholder values; it is not listed in the kustomization and real values are never committed |
| Migrations | a Job per service running `alembic upgrade head` with the service image and its Secret, `restartPolicy` `OnFailure` or `Never` |
| `ARCHITECTURE.md` | sections `Service boundaries`, `JWT claims`, `Error format`, `Data ownership`, `URL prefixes` |

### How the acceptance tests map to the criteria

| Criterion | Checked by |
|---|---|
| AC 1 | `services/auth/tests/acceptance/test_ac1_register_hash_otp.py` |
| AC 2 | `services/auth/tests/acceptance/test_ac2_jwt.py` |
| AC 3 | `services/core/tests/acceptance/test_ac3_jwt_guard.py` |
| AC 4 | `services/core/tests/acceptance/test_ac4_rbac.py` |
| AC 5 | `services/auth/tests/acceptance/test_ac5_learner_tests.py` and `services/core/tests/acceptance/test_ac5_learner_tests.py` check your own tests: 4+ OTP tests (success, wrong code, expiry, single use) and 4+ guard tests mentioning 401, 403 and 200 |
| AC 6 | `services/auth/tests/acceptance/test_ac6_logging.py` |
| AC 7 | `tests/acceptance/test_ac7_containers.py` (Dockerfiles and `compose.yaml`, static checks) |
| AC 8 | `services/core/tests/acceptance/test_ac8_local_validation.py` (no HTTP client in Core) and `tests/acceptance/test_ac8_architecture.py` |
| AC 9 | `tests/acceptance/test_ac9_kubernetes.py` (manifests, parsed with PyYAML) |
| AC 10 | `tests/acceptance/test_ac10_migration_jobs.py` and `services/*/tests/acceptance/test_ac10_migrations.py` |

The acceptance tests do not need Docker, a cluster or PostgreSQL: they use in-memory SQLite and fakeredis, and parse the
YAML files. Things only you can verify by hand (the cluster really running, the resilience demo) are described in the steps.

### Makefile cheat sheet

| Command | What it does |
|---|---|
| `make setup` | `uv sync` in the root, `services/auth` and `services/core` |
| `make lint` / `make typecheck` / `make test` | Ruff, strict Mypy and pytest in all three projects |
| `make check` | all of the above: the definition of "green" |
| `make fmt` | auto-fix Ruff findings and format |

## 6. Step-by-step setup

{{STEPS}}

### Infrastructure hints

You choose how to run PostgreSQL and Redis. Compose is the natural place for local development. For the cluster
you can reach those containers from the pods through `host.k3d.internal` (publish their ports on your machine), or
run the databases inside the cluster with a Helm chart or an operator. Create the Secrets with `kubectl create secret`
(from environment variables or files) instead of writing real values into YAML, and run the migration Jobs after the
Secrets exist and before the Deployments become ready. `k3d` bundles the Traefik ingress controller; do not use
Ingress NGINX, which the Kubernetes project retired in March 2026.

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

- [ ] `make check` is green
- [ ] `docker compose up --build` starts both services, their databases and Redis (your `compose.yaml`)
- [ ] The cluster runs two replicas of each service behind one Ingress, and you demonstrated the resilience steps
- [ ] Each service has its committed Alembic migration and `uv.lock`; no secrets, `.env` files or `.venv` are committed
- [ ] `ARCHITECTURE.md` is complete and matches the code

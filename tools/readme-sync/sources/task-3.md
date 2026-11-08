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
| `compose.yaml` | **TODO (AC 7)** | databases and Redis are provided; add `auth` and `core` |
| `ARCHITECTURE.md` | **TODO (AC 8)** | boundaries, JWT claims, error format, data ownership, URL prefixes |
| `deploy/k8s/base/{namespace,core}.yaml`, `deploy/k8s/overlays/local/` | provided | the Namespace and a worked example (Deployment + Service for Core) |
| `deploy/k8s/base/{auth,ingress,configmap,secret.example,migrate-job}.yaml` | **TODO (AC 9, AC 10)** | the rest of the manifests, already listed in `kustomization.yaml` |
| `scripts/` | provided | `k3d-up.sh` (cluster and images) and `k8s-secrets.sh` (Secrets, never committed) |
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
| `make compose-up` / `make compose-down` | the local stack (AC 7) |
| `make k3d-up` / `make k3d-down` | create or delete the local cluster and import the images (AC 9) |
| `make k8s-secrets` / `make k8s-apply` | create the Secrets (never committed) and apply the manifests |

## 6. Step-by-step setup

{{STEPS}}

### The cluster commands

```bash
# k3d bundles the Traefik ingress controller; port 8080 on your machine -> cluster port 80
k3d cluster create kickstart -p "8080:80@loadbalancer"

docker build -t kickstart/auth:0.1.0 services/auth
docker build -t kickstart/core:0.1.0 services/core
k3d image import kickstart/auth:0.1.0 kickstart/core:0.1.0 -c kickstart

make k8s-secrets          # creates auth-secrets and core-secrets (values are never committed)
make k8s-apply            # kubectl apply -k deploy/k8s/overlays/local
kubectl get pods -n kickstart -w

# resilience demo
kubectl delete pod -n kickstart -l app=core --wait=false
kubectl scale deployment/core -n kickstart --replicas=3

# clean up
k3d cluster delete kickstart
```

`make k3d-up` runs the cluster and image steps for you. PostgreSQL and Redis run in `docker compose`
(`docker compose up -d auth-db core-db redis`); pods reach them at `host.k3d.internal` (ports 5433, 5434 and 6379),
which is what `scripts/k8s-secrets.sh` uses. Run the migration Jobs after the Secrets exist and before the Deployments
become ready. Helm charts or an operator are the alternative if you want the databases inside the cluster.
Do not use Ingress NGINX: the Kubernetes project retired it in March 2026 (this template uses Traefik).

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
- [ ] `docker compose up --build` starts both services, their databases and Redis
- [ ] The cluster runs two replicas of each service behind one Ingress, and you demonstrated the resilience steps
- [ ] Each service has its committed Alembic migration and `uv.lock`; no secrets, `.env` files or `.venv` are committed
- [ ] `ARCHITECTURE.md` is complete and matches the code

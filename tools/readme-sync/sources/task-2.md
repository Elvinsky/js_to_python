# {{TASK_TITLE}}

> Part of **Python Kick-Start**: {{SECTION_TITLE}} ({{TIMESPAN}}). This repository is a **forkable template**:
> fork it, clone your fork, and implement everything marked `TODO` until all acceptance tests pass.

{{INCLUDE:venv-setup}}

{{INCLUDE:fork-workflow}}

## 3. Task description

{{OVERVIEW}}

## 4. Acceptance criteria

{{ACCEPTANCE_CRITERIA}}

## 5. What the template gives you, and what is yours

The tooling from Task 1 (Ruff, Mypy `strict`, pytest, `Makefile`, CI) is already configured, and `uv.lock` is committed
so everyone installs the same versions.

| Path | State | Purpose |
|---|---|---|
| `pyproject.toml`, `uv.lock`, `.python-version`, `Makefile`, `.github/workflows/ci.yml` | provided | dependencies and tool configuration, `make` shortcuts, CI |
| `compose.yaml`, `.env.example` | provided | local PostgreSQL 16 (`db` service) and the settings to connect to it |
| `app/config.py` | provided | typed settings with `pydantic-settings` (`DATABASE_URL`, `ECHO_SQL`) |
| `app/models.py` | provided | SQLAlchemy 2.0 model `Item` (`id`, `sku` unique, `name`, `description`, `price`, `stock`) |
| `app/main.py` | provided | the FastAPI app; includes the items router |
| `app/database.py` | **TODO (AC 3)** | the engine exists without pooling options: configure the pool |
| `app/schemas.py` | **TODO (AC 2)** | `ItemOut` is provided; write `ItemCreate` and `ItemUpdate` with validation |
| `app/routers/items.py` | **TODO (AC 2, AC 4)** | `GET /items` is a worked example; implement the other four endpoints (they return `501` now) and document status codes |
| `scripts/seed.py` | **TODO (AC 1)** | implement `seed(session)`; `load_products()` and the `python -m scripts.seed` entry point are provided |
| `data/products.json` | provided | 14 mock products to seed |
| `alembic.ini`, `alembic/env.py` | provided | async Alembic setup (reads `DATABASE_URL`) |
| `alembic/versions/` | **TODO (AC 5)** | empty: generate the first migration |
| `tests/conftest.py` | provided | fixtures: temporary SQLite database, `session_factory`, and `client` (an `httpx.AsyncClient` talking to the app in-process) |
| `tests/test_items.py` | **TODO (AC 6)** | your own tests; one example is provided |
| `tests/acceptance/` | provided, do not edit | one file per acceptance criterion |

### How the acceptance tests map to the criteria

| Criterion | Checked by |
|---|---|
| AC 1 | `tests/acceptance/test_ac1_seed.py`: valid data file, `seed()` is `async`, inserts every product, commits, is idempotent, does not overwrite existing rows |
| AC 2 | `tests/acceptance/test_ac2_endpoints.py`: all five endpoints, status codes (`200`, `201`, `204`, `404`, `409`, `422`), validation, partial `PATCH`, ordering |
| AC 3 | `tests/acceptance/test_ac3_pool.py`: a `QueuePool` with `pool_size == 10` and `max_overflow == 20` |
| AC 4 | `tests/acceptance/test_ac4_swagger.py`: `/docs` and `/openapi.json` are served, all five operations are documented with request bodies and the right status codes (`201`, `204`, `404`, `409`) |
| AC 5 | `tests/acceptance/test_ac5_migrations.py`: a revision exists, `alembic upgrade head` creates `items` with a unique `sku`, `downgrade` removes it, no `create_all` under `app/` or `scripts/` |
| AC 6 | `tests/acceptance/test_ac6_own_tests.py`: your `tests/test_items.py` has at least 8 tests, calls `get`, `post`, `patch` and `delete` on the client, and expects `404` and `422` |

The tests need **no Docker and no network**: every test gets its own temporary SQLite database. Run everything with
`make check`. At the start it fails on purpose; it is green when you are done.

### The API contract

| Endpoint | Success | Errors |
|---|---|---|
| `GET /items` | `200` list ordered by `id` (provided) | |
| `GET /items/{item_id}` | `200` item | `404` unknown id |
| `POST /items` | `201` created item (`stock` defaults to `0`) | `409` duplicate `sku`, `422` invalid body |
| `PATCH /items/{item_id}` | `200` updated item; only the fields in the body change | `404` unknown id, `422` invalid body |
| `DELETE /items/{item_id}` | `204` with no body | `404` unknown id |

Validation: `sku` and `name` are not empty, `price >= 0`, `stock >= 0` (integers). The `sku` cannot be changed with `PATCH`.

## 6. Run the API locally

You need Docker for the real PostgreSQL database (the tests do not).

```bash
cp .env.example .env     # connection settings (git-ignored)
make db-up               # start PostgreSQL 16 and wait until it is healthy
make migrate             # alembic upgrade head (after you generated the first migration)
make seed                # python -m scripts.seed
make run                 # uvicorn app.main:app --reload
```

Open <http://127.0.0.1:8000/docs> for the interactive Swagger UI (and `/redoc` for ReDoc). Stop the database with
`make db-down`.

Generate the first migration once your model is final (AC 5), against the running database:

```bash
uv run alembic revision --autogenerate -m "create items"
```

Open the generated file in `alembic/versions/` and **read it** before applying it: autogenerate is a draft, not an oracle.

## 7. Connection pooling in two minutes

Opening a database connection is slow, so SQLAlchemy keeps a **pool** of them and lends one to each request.

- `pool_size=10`: up to 10 connections are kept open and reused.
- `max_overflow=20`: under a burst, up to 20 *extra* temporary connections may be opened (30 in total); they are closed
  again when returned. Request number 31 waits (`pool_timeout`, 30 s by default) and then fails.
- `pool_recycle=1800` (optional): replace connections older than 30 minutes, because firewalls and databases drop idle
  connections.
- `pool_pre_ping=True` (optional): test a connection before lending it, so a dropped connection does not fail a request.

The `get_db` dependency opens one `AsyncSession` per request; leaving `async with` returns its connection to the pool.
Keep the sum `(pool_size + max_overflow) x number of app processes` below PostgreSQL's `max_connections`.

## 8. Tech stack requirements

{{TECH_STACK}}

## 9. Recommended stack

{{RECOMMENDED_STACK}}

## 10. Architecture guidelines

{{GUIDELINES}}

## 11. Study first

Topics from the Python Kick-Start roadmap for this section:

{{RELEVANT_TOPICS}}

## Definition of done

- [ ] `make check` is green locally and in the CI of your fork
- [ ] `make migrate && make seed && make run` works against PostgreSQL, and every endpoint can be tried in `/docs`
- [ ] Your migration is committed under `alembic/versions/`
- [ ] Stretch: add pagination (`limit` / `offset`) and a `?q=` name filter to `GET /items`, with tests

/*
 * PARKED: Section 4 of the Python Kick-Start curriculum (Django hybrid + production infra).
 * Removed from index.html on request ("for now"). To restore, paste this object back into the
 * CURRICULUM array in index.html (after sec_3, with a comma between sections).
 * Topic ids t_4_1..t_4_4 and task_4 are unchanged, so any saved progress/notes still match.
 */
var PARKED_SECTION_4 = {
      id: 'sec_4',
      title: 'Section 4: Advanced Microservices & Production Infrastructure',
      timespan: '3–4 Weeks',
      topics: [
        {
          id: 't_4_3',
          name: 'Django Essentials (for the Hybrid Pattern)',
          details: [
            'Project vs app, `settings.py`, `manage.py`, models → `makemigrations` / `migrate`, the admin site, lazy QuerySets.',
            'Django creates and tracks its own tables (`django_migrations`, `django_content_type`, `auth_*`, ...). You need to recognize them because Alembic must leave them alone.',
            'Django ORM is synchronous-first; that is why FastAPI serves the async, high-throughput endpoints while Django keeps the schema and the admin.',
            'Django vs FastAPI vs Flask: batteries-included vs typed and async-first vs minimal. The admin panel is the main reason to keep Django here.'
          ],
          js: [
            'Django ≈ a batteries-included framework (think Rails, or NestJS + an ORM + an admin UI)',
            '`models.py` + `makemigrations` ≈ Prisma schema + `prisma migrate`',
            'Django admin has no first-party Node equivalent (AdminJS is the closest)'
          ],
          roadmap: ['Frameworks', 'Django', 'Flask', 'Pyramid / Sanic / Tornado (awareness)'],
          links: [
            { label: 'Django tutorial', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' },
            { label: 'Django migrations', url: 'https://docs.djangoproject.com/en/stable/topics/migrations/' },
            { label: 'Django admin site', url: 'https://docs.djangoproject.com/en/stable/ref/contrib/admin/' }
          ]
        },
        {
          id: 't_4_1',
          name: 'Polyglot Persistence & Shared Schemas',
          details: [
            'Relational (PostgreSQL) for ACID transactions vs. Document NoSQL (MongoDB) for event logs.',
            'Enterprise Hybrid Pattern: Django owns migrations & the admin panel; FastAPI serves async high-throughput APIs.',
            'Alembic `include_object` configuration excluding `django_migrations` to avoid schema lockouts.'
          ],
          js: [
            'Prisma / Knex migrations ≈ Alembic (here only for tables FastAPI owns)',
            'Mongoose ≈ Motor / Beanie for MongoDB from async Python'
          ],
          roadmap: ['Frameworks', 'Common Packages'],
          links: [
            { label: 'Django + FastAPI shared database migration strategy', url: 'https://damianhodgkiss.com/tutorials/django-fastapi-shared-database-migration-strategy' },
            { label: 'Alembic documentation', url: 'https://alembic.sqlalchemy.org/' }
          ]
        },
        {
          id: 't_4_2',
          name: 'Async Task Queues & Cloud Deployment',
          details: [
            'Background job processing using ARQ or Celery backed by Redis.',
            'Docker multi-stage builds and ASGI deployment (Uvicorn / Granian).',
            'Near-free cloud deployment on Render, Railway, or FastAPI Cloud.'
          ],
          js: [
            'BullMQ / Bee-Queue ≈ ARQ (asyncio) or Celery (mature, heavier)',
            '`node server.js` / PM2 ≈ Uvicorn / Granian (ASGI servers)',
            'Multi-stage `node:alpine` Dockerfile ≈ multi-stage Python image with a copied `.venv`'
          ],
          roadmap: ['Concurrency', 'Asynchrony', 'Multiprocessing'],
          links: [
            { label: 'Python services deployment guide (runxbuild.com)', url: 'https://www.runxbuild.com/docs/services/python/' },
            { label: 'ARQ documentation', url: 'https://arq-docs.helpmanual.io/' },
            { label: 'Docker multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/' }
          ]
        },
        {
          id: 't_4_4',
          name: 'Observability, Health Checks & CI',
          details: [
            '`/health` (liveness) and `/ready` (checks DB and Redis); Docker `HEALTHCHECK`; graceful shutdown for workers.',
            'CI with GitHub Actions: `uv sync --frozen`, Ruff, Mypy, pytest against Postgres and Redis service containers, with the uv cache enabled.',
            'Awareness of metrics and tracing (`prometheus-client`, OpenTelemetry) and error reporting (Sentry).'
          ],
          js: [
            'GitHub Actions workflows look the same; swap `npm ci` for `uv sync --frozen`',
            '`prom-client` ≈ `prometheus-client`; `@sentry/node` ≈ `sentry-sdk`'
          ],
          roadmap: [],
          links: [
            { label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions' },
            { label: 'uv: GitHub Actions integration', url: 'https://docs.astral.sh/uv/guides/integration/github/' },
            { label: 'OpenTelemetry for Python', url: 'https://opentelemetry.io/docs/languages/python/' },
            { label: 'Sentry for Python', url: 'https://docs.sentry.io/platforms/python/' }
          ]
        }
      ],
      task: {
        id: 'task_4',
        title: 'Practical Task 4: Hybrid Django-FastAPI Polyglot Platform',
        overview: 'Combine everything into a production-shaped platform: Django owns the PostgreSQL schema (migrations and admin panel), FastAPI serves the high-throughput async API against the same database, a Redis-backed worker handles background email jobs, and both services ship as small multi-stage Docker images with health checks and a CI pipeline, deployed to a free-tier cloud host.',
        acs: [
          'Configure shared PostgreSQL database where Django manages schema migrations and FastAPI executes read/write endpoints.',
          'Exclude Django system tables from Alembic autogenerate using `include_object` filter in `env.py`.',
          'Implement ARQ/Celery background queue for async email notifications.',
          'Dockerize services with multi-stage Dockerfiles and deploy to Render/Railway.',
          'Expose `/health` and `/ready` on the FastAPI service and add a GitHub Actions workflow that runs `ruff`, `mypy` and `pytest` against Postgres and Redis.',
          'Stretch: append domain events (e.g. order placed, email sent) to a MongoDB collection and document why they are not stored in PostgreSQL.'
        ],
        stack: ['Django', 'FastAPI', 'SQLAlchemy 2.0', 'Alembic', 'PostgreSQL', 'Redis', 'ARQ or Celery', 'Docker', 'GitHub Actions', 'Render / Railway'],
        guidelines: [
          'Single source of truth for schema: Django migrations. Alembic is used only for tables FastAPI owns, if any, and must never propose drops for Django tables.',
          'Mirror Django-owned tables in SQLAlchemy only as needed for queries; do not autogenerate DDL from those mirrors.',
          'Keep MongoDB (if used) for append-only event logs; keep money and inventory in PostgreSQL for ACID guarantees.',
          'Enqueue jobs from request handlers and return immediately; make jobs idempotent and retry-safe.',
          'Multi-stage images: build dependencies in a builder stage, copy only the virtualenv into a slim runtime image, run as a non-root user.',
          'All configuration through environment variables so the same image runs locally, in CI and in the cloud.',
          'Readiness checks verify real dependencies (DB, Redis); liveness checks stay cheap.'
        ],
        snippets: [
          {
            label: 'alembic/env.py (exclude Django tables)',
            code: [
              '# Django owns these tables; Alembic must never create, alter or drop them.',
              'DJANGO_PREFIXES = ("django_", "auth_")',
              '',
              'def include_object(obj, name, type_, reflected, compare_to):',
              '    if type_ == "table":',
              '        if name is not None and name.startswith(DJANGO_PREFIXES):',
              '            return False',
              '        # table exists in the DB but not in our metadata -> Django app table; do not propose a drop',
              '        if reflected and compare_to is None:',
              '            return False',
              '    return True',
              '',
              '# in run_migrations_online() / run_migrations_offline():',
              '# context.configure(',
              '#     connection=connection,',
              '#     target_metadata=target_metadata,',
              '#     include_object=include_object,',
              '# )'
            ].join('\n')
          },
          {
            label: 'worker.py (ARQ background email job)',
            code: [
              'import os',
              '',
              'from arq import create_pool',
              'from arq.connections import RedisSettings',
              '',
              'REDIS = RedisSettings.from_dsn(os.environ["REDIS_URL"])',
              '',
              'async def send_welcome_email(ctx: dict, user_id: int, email: str) -> None:',
              '    # call your email provider here (SMTP, SES, Resend, ...)',
              '    print(f"sending welcome email to {email} (user {user_id})")',
              '',
              'class WorkerSettings:',
              '    functions = [send_welcome_email]',
              '    redis_settings = REDIS',
              '',
              '# run the worker:  uv run arq worker.WorkerSettings',
              '',
              '# enqueue from a FastAPI route:',
              '# pool = await create_pool(REDIS)',
              '# await pool.enqueue_job("send_welcome_email", user.id, user.email)'
            ].join('\n')
          },
          {
            label: 'Dockerfile (multi-stage, uv)',
            code: [
              '# ---- build stage ----',
              'FROM python:3.12-slim AS builder',
              '# pin a uv version instead of :latest in real projects',
              'COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv',
              'WORKDIR /app',
              'COPY pyproject.toml uv.lock ./',
              'RUN uv sync --frozen --no-dev --no-install-project',
              'COPY . .',
              'RUN uv sync --frozen --no-dev',
              '',
              '# ---- runtime stage ----',
              'FROM python:3.12-slim',
              'WORKDIR /app',
              'COPY --from=builder /app /app',
              'ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1',
              'RUN useradd --create-home appuser',
              'USER appuser',
              'EXPOSE 8000',
              'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]'
            ].join('\n')
          },
          {
            label: 'main.py (liveness and readiness endpoints)',
            code: [
              'from sqlalchemy import text',
              '',
              '# continues from the Task 2 snippets: app, Depends, AsyncSession, get_db',
              '',
              '@app.get("/health")',
              'async def health() -> dict[str, str]:',
              '    return {"status": "ok"}  # liveness: the process is up',
              '',
              '@app.get("/ready")',
              'async def ready(db: AsyncSession = Depends(get_db)) -> dict[str, str]:',
              '    await db.execute(text("SELECT 1"))  # readiness: dependencies answer',
              '    return {"status": "ready"}'
            ].join('\n')
          },
          {
            label: '.github/workflows/ci.yml',
            code: [
              'name: ci',
              'on: [push, pull_request]',
              '',
              'jobs:',
              '  test:',
              '    runs-on: ubuntu-latest',
              '    services:',
              '      postgres:',
              '        image: postgres:16',
              '        env:',
              '          POSTGRES_PASSWORD: postgres',
              '          POSTGRES_DB: app',
              '        ports: ["5432:5432"]',
              '        options: >-',
              '          --health-cmd "pg_isready -U postgres"',
              '          --health-interval 5s',
              '          --health-retries 10',
              '      redis:',
              '        image: redis:7',
              '        ports: ["6379:6379"]',
              '    env:',
              '      DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/app',
              '      REDIS_URL: redis://localhost:6379/0',
              '      JWT_SECRET: ci-only-secret',
              '    steps:',
              '      - uses: actions/checkout@v4',
              '      - uses: astral-sh/setup-uv@v5',
              '        with:',
              '          enable-cache: true',
              '      - run: uv sync --frozen',
              '      - run: uv run ruff check . && uv run ruff format --check .',
              '      - run: uv run mypy .',
              '      - run: uv run pytest'
            ].join('\n')
          }
        ]
      }
    };

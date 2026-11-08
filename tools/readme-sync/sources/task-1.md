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

| Path | State | Purpose |
|---|---|---|
| `.python-version` | provided | pins the Python version for uv (3.14) |
| `pyproject.toml` | **TODO (AC 1, AC 2)** | only the `[project]` table exists: add dev tools and configure Ruff, Mypy and pytest |
| `Makefile` | provided | `make setup`, `make lint`, `make typecheck`, `make test`, `make check` |
| `config/`, `domain/`, `api/` | **TODO (AC 3)** | create these packages (each with `__init__.py`); `domain/` must not import any framework |
| `domain/pricing.py` | **TODO (AC 4)** | implement `apply_discount(price: Decimal, percent: int) -> Decimal` |
| `tests/test_pricing.py` | provided | the tests your function has to satisfy; add your own parametrized tests beside it |
| `tests/acceptance/` | provided, do not edit | one file per acceptance criterion |

### How the acceptance tests map to the criteria

| Criterion | Checked by |
|---|---|
| AC 1 | `tests/acceptance/test_ac1_environment.py`: Python 3.12+, running inside a virtual environment, `uv.lock` committed, `.venv` ignored |
| AC 2 | `tests/acceptance/test_ac2_tooling_config.py`: dev group, Ruff rules, Mypy `strict = true`, pytest `testpaths` |
| AC 3 | `tests/acceptance/test_ac3_structure.py`: the four packages exist, `/domain` imports no framework |
| AC 4 | `tests/test_pricing.py` and `tests/acceptance/test_ac4_quality_gates.py`: `ruff check`, `ruff format --check` and `mypy .` all pass |

Run everything with `make check`. At the start it fails on purpose; it is green when you are done.

### `apply_discount` contract

- `apply_discount(Decimal("100.00"), 0) == Decimal("100.00")`
- `apply_discount(Decimal("19.99"), 10) == Decimal("17.99")` (round to 2 decimal places with `quantize`)
- A `percent` outside `0..100` raises `ValueError`
- It is a pure function: no I/O, no globals, no framework imports

## 6. Tech stack requirements

{{TECH_STACK}}

## 7. Recommended stack

{{RECOMMENDED_STACK}}

## 8. Architecture guidelines

{{GUIDELINES}}

## 9. Study first

Topics from the Python Kick-Start roadmap for this section:

{{RELEVANT_TOPICS}}

## Definition of done

- [ ] `make check` is green
- [ ] `uv.lock` and your `pyproject.toml` configuration are committed, `.venv` is not
- [ ] Stretch: add a second pure function to `/domain` with its own parametrized tests

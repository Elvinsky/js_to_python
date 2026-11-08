## 1. Set up your virtual environment first

> **Do this before you touch any code.** Every task in the course runs inside an isolated virtual
> environment, so dependencies never leak into your system Python (there is no `node_modules`-style
> implicit lookup in Python). Nothing in this repository is guaranteed to work outside it.

You need [git](https://git-scm.com/) and [uv](https://docs.astral.sh/uv/getting-started/installation/)
(a fast package and environment manager that also installs Python for you).

```bash
{{SETUP_COMMANDS}}
```

What these commands do:

- `uv python install 3.14` downloads Python 3.14 (the version pinned in `.python-version`). Python 3.12 is the
  minimum the acceptance criteria allow; use 3.13 only if a dependency has no wheels for 3.14 yet.
- `uv sync` creates the `.venv` folder and installs the locked dependencies into it.
- `uv run <command>` always runs inside that environment, so you do not have to activate it. If you prefer to
  activate it: `source .venv/bin/activate` (macOS/Linux) or `.venv\Scripts\activate` (Windows).
- `uv run python --version` must print `Python 3.14.x` (or at least 3.12). If it prints another version, stop and fix
  the environment before continuing.

Common problems:

- `uv: command not found`: install uv and open a new terminal.
- Wrong Python version: run `uv python list` and `uv python install 3.14`, then delete `.venv` and run `uv sync` again.
- `make: command not found` (Windows): run the commands from the `Makefile` by hand, or use WSL / Git Bash.

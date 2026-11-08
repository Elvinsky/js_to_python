# Python Kick-Start

An interactive roadmap for developers moving from JavaScript to Python backend development. Open
[`index.html`](index.html) in a browser (no build step, no dependencies): collapsible topics with
"Coming from JavaScript" notes and roadmap.sh mapping, practical tasks with acceptance criteria, notes and
progress saved in `localStorage`, and a layout that works on phones and tablets.

## Practical task repositories

Each practical task has its own **forkable template repository** with starter code, configuration and
acceptance tests. Learners fork it, clone their fork, set up the virtual environment first (`uv`), and implement
the `TODO`s until `make check` is green.

| Task | Repository |
|---|---|
| 1. Environment & project boilerplate setup | https://github.com/Elvinsky/Python_Course_Task_1 |
| 2. Product inventory catalog API | https://github.com/Elvinsky/Python_Course_Task_2 |
| 3. Auth & order microservices on Kubernetes | https://github.com/Elvinsky/Python_Course_Task_3 |

## Maintaining the task repositories

This repository contains only the course app. The task repositories are separate git repositories that you
clone **next to the app, inside this folder**; `.gitignore` keeps them out of this repository:

```bash
git clone https://github.com/Elvinsky/js_to_python.git
cd js_to_python
git clone https://github.com/Elvinsky/Python_Course_Task_1.git
git clone https://github.com/Elvinsky/Python_Course_Task_2.git
git clone https://github.com/Elvinsky/Python_Course_Task_3.git
```

The description, acceptance criteria, stack and guidelines in each task README are **generated from the task
data in `index.html`**, so they always match the task window of the app. After changing a task in `index.html`,
or the hand-written README parts in [`tools/readme-sync/sources/`](tools/readme-sync/sources), regenerate and
then commit and push inside each task repository:

```bash
node tools/readme-sync/sync-readmes.mjs           # rewrite ./Python_Course_Task_N/README.md
node tools/readme-sync/sync-readmes.mjs --check   # exit 1 if any README is out of date
```

Conventions shared by the task repositories:

- Python 3.14 pinned in `.python-version` (`requires-python >= 3.12`), dependencies managed with `uv`; `uv.lock` is
  committed in Tasks 2 and 3 (in Task 1, creating it is part of the task).
- `make check` runs Ruff, the Ruff format check, Mypy strict and pytest.
- `tests/acceptance/` has one test file per acceptance criterion. They fail on the untouched template and pass
  once the task is done; learners write their own tests beside them.

## Other files

- [`parked-section-4.js`](parked-section-4.js): the former Section 4 (Django hybrid platform), removed from the
  app for now. Paste it back into the `CURRICULUM` array in `index.html` to restore it.

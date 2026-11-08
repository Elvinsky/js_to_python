## 2. Fork, clone and work on your fork

1. **Fork** [{{REPO_NAME}}]({{REPO_URL}}) to your own GitHub account (the *Fork* button, top right).
2. **Clone your fork** (not this repository):

   ```bash
   git clone https://github.com/<your-username>/{{REPO_NAME}}.git
   cd {{REPO_NAME}}
   ```

3. Set up the virtual environment (section 1), then create a branch: `git switch -c solution`.
4. Search for `TODO` to find everything you have to implement: `grep -rn "TODO" . --exclude-dir=.venv --exclude-dir=.git --exclude=README.md`.
5. Commit small steps and run `make check` before every push, so you always know which criteria are done.
6. Keep the acceptance tests in `tests/acceptance/` unchanged: they are the definition of "done" for each
   acceptance criterion. Write your own tests next to them.

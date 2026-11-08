## 2. Fork, clone and work on your fork

1. **Fork** [{{REPO_NAME}}]({{REPO_URL}}) to your own GitHub account (the *Fork* button, top right).
2. **Clone your fork** (not this repository):

   ```bash
   git clone https://github.com/<your-username>/{{REPO_NAME}}.git
   cd {{REPO_NAME}}
   ```

3. Set up the virtual environment (section 1), then create a branch: `git switch -c solution`.
4. Build the task step by step and commit small steps. Run `make check` before every push so you always know where you stand.

#!/usr/bin/env node
/*
 * Generates the README.md of each task repository (./Python_Course_Task_N, separate git repos that the
 * main repo ignores) from the task data in index.html, so the description, acceptance criteria, stack
 * and guidelines in the repos are always identical to what the Python Kick-Start app shows.
 *
 *   node tools/readme-sync/sync-readmes.mjs            # (re)write the three READMEs
 *   node tools/readme-sync/sync-readmes.mjs --check    # exit 1 if any README is out of date
 *
 * Hand-written parts: tools/readme-sync/sources/task-N.md and sources/partials/*.md
 * ({{PLACEHOLDER}} values come from index.html; {{INCLUDE:name}} pulls in a partial).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..'); // main repo root: index.html and the Python_Course_Task_N folders
const sources = path.join(here, 'sources');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const check = process.argv.includes('--check');

// ---- load CURRICULUM from the app (it is a plain `var CURRICULUM = [...]` literal) ----
const start = html.indexOf('var CURRICULUM = [');
const end = html.indexOf('\n  ];', start);
if (start < 0 || end < 0) throw new Error('CURRICULUM not found in index.html');
const ctx = {};
vm.runInNewContext(html.slice(start, end + 5) + '\nthis.CURRICULUM = CURRICULUM;', ctx);
const CURRICULUM = ctx.CURRICULUM;

const bullets = (items) => items.map((i) => `- ${i}`).join('\n');

function recommended(rec) {
  const out = [`**Python version:** ${rec.python}`, ''];
  for (const g of rec.groups) {
    out.push(`**${g.title}**`, '');
    for (const it of g.items) out.push(`- ${it.name}: ${it.why}`);
    out.push('');
  }
  if (rec.avoid && rec.avoid.length) out.push('**Avoid**', '', bullets(rec.avoid));
  return out.join('\n').trim();
}

function topics(section) {
  return section.topics
    .map((t) => {
      const links = t.links.map((l) => `[${l.label}](${l.url})`).join(' · ');
      return `- **${t.name}**: ${links}`;
    })
    .join('\n');
}

let outdated = 0;
CURRICULUM.forEach((section, index) => {
  const n = index + 1;
  const task = section.task;
  const srcPath = path.join(sources, `task-${n}.md`);
  if (!fs.existsSync(srcPath)) {
    console.warn(`skip task ${n}: ${path.relative(process.cwd(), srcPath)} does not exist yet`);
    return;
  }
  const repoName = task.repo.replace(/\/+$/, '').split('/').pop();
  const values = {
    TASK_TITLE: task.title,
    SECTION_TITLE: section.title,
    TIMESPAN: section.timespan,
    REPO_URL: task.repo,
    REPO_NAME: repoName,
    SETUP_COMMANDS: task.setup,
    OVERVIEW: task.overview,
    EXISTS: bullets(task.exists || []),
    ACCEPTANCE_CRITERIA: task.acs.map((a, i) => `- [ ] **AC ${i + 1}**: ${a}`).join('\n'),
    TECH_STACK: bullets(task.stack),
    RECOMMENDED_STACK: task.recommended ? recommended(task.recommended) : '',
    GUIDELINES: bullets(task.guidelines),
    STEPS: (task.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n'),
    RELEVANT_TOPICS: topics(section),
  };

  let text = fs.readFileSync(srcPath, 'utf8');
  // {{INCLUDE:name}} pulls in sources/partials/name.md (shared text, may contain placeholders)
  text = text.replace(/\{\{INCLUDE:([a-z0-9-]+)\}\}/g, (m, name) => {
    const p = path.join(sources, 'partials', `${name}.md`);
    if (!fs.existsSync(p)) throw new Error(`task-${n}.md: missing partial ${m}`);
    return fs.readFileSync(p, 'utf8').trimEnd();
  });
  text = text.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => {
    if (!(key in values)) throw new Error(`task-${n}.md: unknown placeholder ${m}`);
    return values[key];
  });
  const banner =
    '<!--\n  Generated from the Python Kick-Start course: the description and acceptance criteria match the\n' +
    '  task window of the course app. Do not edit by hand; changes are made in the course repository.\n-->\n\n';
  const out = banner + text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

  const target = path.join(root, repoName, 'README.md');
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  if (check) {
    if (current !== out) { console.error(`OUT OF DATE: ${path.relative(process.cwd(), target)}`); outdated++; }
    else console.log(`ok  ${repoName}/README.md`);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, out);
    console.log(`wrote ${path.relative(process.cwd(), target)}`);
  }
});
if (outdated) process.exit(1);

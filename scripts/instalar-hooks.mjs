/**
 * Aponta o Git para os hooks versionados em .githooks/ (pre-commit,
 * pre-merge-commit e pre-push). Roda sozinho no `npm install`.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';

if (!fs.existsSync('.git') || process.env.CI) process.exit(0);

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
  console.log('Hooks do Git ativados: os testes rodam antes de cada commit, merge e push.');
} catch {
  console.warn('Não foi possível ativar os hooks do Git. Rode: git config core.hooksPath .githooks');
}

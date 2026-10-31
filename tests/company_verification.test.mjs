/* The actual TypeScript route is exercised with a stubbed provider; no live keys or calls. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function compile(file, imports = {}, processEnv = {}) {
  const compiled = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module: compiled, exports: compiled.exports, require: name => {
      assert.ok(name in imports, `Unexpected runtime import: ${name}`);
      return imports[name];
    }, Buffer, Request, Response, URL, AbortSignal, crypto: globalThis.crypto, Date, Error,
    process: { env: processEnv },
  }, { filename: file });
  return compiled.exports;
}
const game = compile('src/lib/game.ts');
const proof = compile('src/lib/proof.ts');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'public/demo-evidence/profile-values.json'), 'utf8'));
const verdict = { decision: 'approved', confidence: 0.9, documentType: 'Registration certificate', parties: ['PayLah Lite'], date: null, reason: 'The visible registration fields match.' };
class ApiError extends Error { constructor(status) { super('Stub provider failure'); this.status = status; } }

function setup(generate, env = { GEMINI_API_KEY: 'test-only', GEMMA_MODEL: 'gemma-4-31b-it' }) {
  const calls = [];
  class GoogleGenAI {
    constructor() {
      this.models = { generateContent: async params => { calls.push(params); return generate(calls.length); } };
    }
  }
  const route = compile('src/app/api/company/verify/route.ts', {
    '@google/genai': { GoogleGenAI, ApiError, ThinkingLevel: { MINIMAL: 'MINIMAL' } },
    '@/lib/game': game, '@/lib/proof': proof,
  }, env);
  function request(query = '') {
    return route.POST(new Request('http://localhost/api/company/verify' + query, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, mimeType: 'image/png', imageBase64: fs.readFileSync(path.join(root, 'public/demo-evidence/01-matching-company-record.png')).toString('base64') }),
    }));
  }
  return { calls, request };
}

test('live mode uses configured Gemma, minimal thinking, and no SDK retries', async () => {
  const { calls, request } = setup(() => ({ text: JSON.stringify(verdict) }));
  const response = await request();
  const { verification } = await response.json();
  assert.equal(response.status, 200);
  assert.equal(verification.mode, 'live');
  assert.equal(verification.model, 'gemma-4-31b-it');
  assert.ok(verification.passportId);
  assert.ok(verification.durationMs >= 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'gemma-4-31b-it');
  assert.equal(calls[0].config.thinkingConfig.thinkingLevel, 'MINIMAL');
  assert.equal(calls[0].config.httpOptions.retryOptions.attempts, 1);
  assert.ok(calls[0].config.httpOptions.timeout <= 25000);
  assert.equal(calls[0].config.maxOutputTokens, 512);
});
for (const [status, expected, code] of [[504,504,'MODEL_TIMEOUT'],[429,429,'MODEL_RATE_LIMIT'],[403,503,'MODEL_ACCESS'],[400,503,'MODEL_REQUEST']]) {
  test(`provider ${status} returns a specific error without retry or fake approval`, async () => {
    const { calls, request } = setup(() => { throw new ApiError(status); });
    const response = await request();
    const data = await response.json();
    assert.equal(response.status, expected);
    assert.equal(data.code, code);
    assert.equal(data.verification, undefined);
    assert.equal(calls.length, 1);
  });
}
test('only unusable output retries once, within the shared deadline', async () => {
  const { calls, request } = setup(attempt => ({ text: attempt === 1 ? '{' : JSON.stringify(verdict) }));
  assert.equal((await request()).status, 200);
  assert.equal(calls.length, 2);
  assert.ok(calls[1].config.httpOptions.timeout <= calls[0].config.httpOptions.timeout);
  assert.equal(calls[1].config.maxOutputTokens, 1024);
});
test('invalid output twice never issues a passport', async () => {
  const { calls, request } = setup(() => ({ text: 'invalid' }));
  const response = await request();
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, 'INVALID_MODEL_RESPONSE');
  assert.equal(calls.length, 2);
});
test('explicit demo mode never calls Gemma and is labelled', async () => {
  const { calls, request } = setup(() => { throw new Error('Must not call provider'); });
  const data = await (await request('?demo=1')).json();
  assert.equal(data.verification.mode, 'demo');
  assert.equal(data.verification.model, undefined);
  assert.equal(calls.length, 0);
});

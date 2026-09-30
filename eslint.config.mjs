/**
 * ESLint (Flat Config) — Next-Empfehlungen (React, Hooks, Core Web Vitals, jsx-a11y) plus die harten Regeln aus
 * CLAUDE.md, soweit sie sich maschinell prüfen lassen:
 *  - Widgets ohne 'use client', ohne useState/createContext direkt
 *  - repo.ts: jede exportierte async-Funktion beginnt mit `await requireUser(…)`
 *  - SQL nur als fester Text an prepare()/exec() — keine Template-Platzhalter, keine String-Verkettung
 *  - kein dangerouslySetInnerHTML außer an den geprüften Stellen (statisches/generiertes Markup, JSON-LD)
 *   npm run lint
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** Eigene Regeln (lokales Plugin „ld“). */
const ld = {
  rules: {
    'require-user': {
      meta: {
        type: 'problem',
        messages: {
          missing: '„{{name}}“ ist exportiert und async, beginnt aber nicht mit `await requireUser()` (CLAUDE.md, Regel 3).',
        },
      },
      create(context) {
        const firstCallsRequireUser = (body) => {
          const first = body?.body?.[0];
          if (!first) return false;
          let found = false;
          const visit = (n) => {
            if (!n || typeof n !== 'object' || found) return;
            if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'requireUser') {
              found = true;
              return;
            }
            for (const k of Object.keys(n))
              if (k !== 'parent') {
                const v = n[k];
                if (Array.isArray(v)) v.forEach(visit);
                else if (v && typeof v.type === 'string') visit(v);
              }
          };
          visit(first);
          return found;
        };
        return {
          'ExportNamedDeclaration > FunctionDeclaration[async=true]'(fn) {
            if (!firstCallsRequireUser(fn.body))
              context.report({ node: fn.id ?? fn, messageId: 'missing', data: { name: fn.id?.name ?? '?' } });
          },
        };
      },
    },
    'static-sql': {
      meta: {
        type: 'problem',
        messages: {
          dynamic: 'SQL nur als fester Text mit `?`-Platzhaltern — keine Template-Platzhalter oder Verkettung (CLAUDE.md, Regel 3).',
        },
      },
      create(context) {
        const isStatic = (a) =>
          (a.type === 'Literal' && typeof a.value === 'string') || (a.type === 'TemplateLiteral' && a.expressions.length === 0);
        /** Konstanten in GROSSBUCHSTABEN (z. B. MIGRATIONS[v]) sind fester Quelltext, keine Eingabe. */
        const isConstant = (a) => {
          let n = a;
          while (n.type === 'MemberExpression') n = n.object;
          return n.type === 'Identifier' && /^[A-Z][A-Z0-9_]*$/.test(n.name);
        };
        /** Nur Datenbank-Aufrufe: `db().prepare(…)`, `db.exec(…)` — nicht RegExp#exec. */
        const onDb = (obj) =>
          (obj.type === 'Identifier' && obj.name === 'db') ||
          (obj.type === 'CallExpression' && obj.callee.type === 'Identifier' && obj.callee.name === 'db');
        return {
          'CallExpression[callee.type="MemberExpression"][callee.property.name=/^(prepare|exec)$/]'(call) {
            const arg = call.arguments[0];
            if (call.callee.property.name === 'exec' && !onDb(call.callee.object)) return;
            if (arg && !isStatic(arg) && !isConstant(arg)) context.report({ node: arg, messageId: 'dynamic' });
          },
        };
      },
    },
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'data/**',
    'design/**',
    'docs/**',
    'public/**',
    'next-env.d.ts',
    // Generierte Dateien (CLAUDE.md, Regel 1)
    'src/site/hero/engine/heroEngine.js',
    'src/orbit/**',
    'src/site/splash/sketchMarkup.ts',
    'content/journey.ts',
    'src/widgets/index.ts',
    // Quelltext-Fragment, das der Generator vor die Hero-Engine setzt (kein vollständiges Modul)
    'scripts/hero-engine-head.js',
  ]),
  {
    plugins: { ld },
    rules: {
      'react/no-danger': 'error',
      // Der Markenslogan „/// the web. my passion“ steht bewusst als Text im JSX (Prototyp).
      'react/jsx-no-comment-textnodes': 'off',
      // Regeln für den React Compiler (react-hooks 7) blockieren: Refs nie während des Renderns schreiben (stattdessen
      // useLayoutEffect), setState nicht synchron im Effekt. Begründete Ausnahmen (Sync aus localStorage nach der
      // Hydration, Animationen) stehen einzeln mit „eslint-disable-next-line … -- Grund“ im Code.
      'react-hooks/refs': 'error',
      'react-hooks/set-state-in-effect': 'error',
      // Bilder laufen bewusst über <img> mit eigenem srcset (mediaSrcSet, /media/<id>?w=…) — next/image bräuchte im
      // statischen Export einen Loader und würde die Varianten aus LD Flow doppeln.
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  {
    // Geprüfte Ausnahmen: Theme-Boot-Skript (konstant, CSP-Hash), generiertes Orbit-/Skizzen-Markup, JSON-LD mit Escaping.
    files: [
      'src/site/RootDocument.tsx',
      'src/app/(orbit)/orbit/OrbitWallpaper.tsx',
      'src/site/splash/Splash.tsx',
      'src/site/seo/JsonLd.tsx',
    ],
    rules: { 'react/no-danger': 'off' },
  },
  {
    files: ['tests/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['src/cms/repo.ts'],
    rules: { 'ld/require-user': 'error' },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'ld/static-sql': 'error' },
  },
  {
    files: ['src/widgets/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > ExpressionStatement[directive="use client"]',
          message: "Widgets sind keine Client-Module — kein 'use client' (CLAUDE.md, Regel 2).",
        },
        {
          selector: 'MemberExpression[object.name="React"][property.name=/^(useState|createContext)$/]',
          message: 'In Widgets kein useState/createContext — Zustand über useSite/useContent (CLAUDE.md, Regel 2).',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useState', 'createContext'],
              message: 'In Widgets kein useState/createContext — Zustand über useSite/useContent (CLAUDE.md, Regel 2).',
            },
          ],
        },
      ],
    },
  },
]);

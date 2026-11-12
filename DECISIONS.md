# Entscheidungen

Kleine Entscheidungen, die ich selbst getroffen habe, plus die bestätigten Antworten auf die offenen Fragen aus dem Plan.

## Bestätigt am 12.11.2026 (OK zum Plan, alle Hypothesen übernommen)

- Tendenzen zählen im Schnitt mit. Anzeige im Notensystem: (17 − P)/3, begrenzt auf 1,00–6,00.
- Login: Magic Link **und** 6-stelliger Code in derselben Mail (wegen iOS-PWA).
- Stammformen: alle Formen in Reihenfolge, Tippfehler-Toleranz pro Form; „Adv.“, „Präp. …“, „–“ sind keine abfragbaren Formen.
- Supabase: lokal entwickeln, echtes Projekt legt Markus an (Region Frankfurt).
- Claude-Standardmodell in `.env.example`: `claude-opus-5-5`, austauschbar über `ANTHROPIC_MODEL`.
- Alle Annahmen aus PLAN.md Abschnitt 5 gelten.

## Meilenstein 2

- Projekt mit `sv create` (SvelteKit 3, Svelte 5, TypeScript strict, Vitest, ESLint/Prettier, Vercel-Adapter) angelegt.
- npm 10 bricht bei der Installation mit einem internen Fehler ab („edgesOut“); installiert wurde mit `npx npm@11 install`.
- Schriften werden über `@fontsource` selbst gehostet, Icons kommen aus `@lucide/svelte` (Strichstärke 1,5–2,5 je nach Richtung).
- Die Entwürfe nutzen echte Notion-Daten. Die drei Hausaufgaben sind Beispiele, weil Notion keine enthielt.
- In den Entwürfen funktionieren nur Umdrehen, Abhaken und die Eintipp-Prüfung (D). Darauf weist ein Hinweis oben auf jeder Seite hin.

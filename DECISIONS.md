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

## Design-Auswahl (12.11.2026)

- Gewählt: **Richtung B „Präzises Werkzeug“**. Tokens in `src/lib/styles/tokens.css`, Regeln in `docs/DESIGN.md`.
- Die Entwurfsrouten `/design/a–d` sind gelöscht, nicht mehr gebrauchte Schriften deinstalliert. Die Screens von B liegen als Referenz in `docs/design/`.
- Fachfarben werden als Token-Name gespeichert (z. B. `violett`), damit hell und dunkel automatisch passen. Zwölf Farben stehen zur Wahl, zwei davon sind für neue Fächer frei.
- Kräftige Rahmen (`--border-strong`, z. B. für Checkboxen) haben mindestens 3:1 Kontrast (WCAG 1.4.11).
- Bei einer Schrift (Geist) geblieben. Eine zweite Schrift für Zahlen wäre möglich, ist aber nicht nötig.
- Nach Prüfung angepasst: Akzent-Auswahl auf Orange, Tanne und Wein reduziert. Blau, Grün, Violett und Graphit fielen weg, weil sie mit Fachfarben, Status oder Text zusammenfielen. `--positive` ist gestrichen, weil nicht gebraucht. Chemie ist jetzt „senf“, W&R „braun“, die zweite freie Farbe „pflaume“, damit sich nichts mit dem orangen Akzent beißt.
- Farbabstände werden mit CIEDE2000 statt RGB geprüft. Dafür sind Rot (Deutsch), Gefahr, Petrol und Magenta leicht verschoben, Tanne und Wein im Dunkelmodus heller. So wirkt der orange Akzent neben Deutsch und „Konto löschen“ nicht mehr rot.

# Plan – Lern-Dashboard „Lernraum“

Stand: 12.11.2026 · Meilenstein 1 (Plan) · **Noch nichts umgesetzt.**

---

## 1. Architektur

```
Handy/Desktop (PWA, SvelteKit-Client)
   │  Magic Link (+ 6-stelliger Code, falls Frage 2 bestätigt), Session-Cookie (@supabase/ssr)
   ▼
SvelteKit auf Vercel (Node-Runtime)
   ├─ Seiten + Form-Actions (lesen/schreiben mit dem Nutzer-JWT → RLS greift)
   ├─ /api/scan          → Claude API (Schlüssel nur hier), Zod-Prüfung, Limit
   ├─ /api/account/*     → Export (JSON), Konto löschen (service_role, nur serverseitig)
   └─ hooks.server.ts    → Session prüfen, geschützte Routen
   ▼
Supabase
   ├─ Postgres + RLS auf jeder Tabelle (owner = auth.uid())
   ├─ Auth: Magic Link (+ OTP-Code, Frage 2), Signup nur über Allowlist (Auth-Hook „before user created“)
   ├─ Storage: Bucket `scans` (privat, Pfad `{user_id}/…`, eigene Policies), temporär
   └─ SQL-Funktion `consume_scan()` für das atomare Tageslimit
```

Grundsätze:
- **Alle Rechenlogik als reine TypeScript-Funktionen** in `src/lib/domain/` (Noten, Leitner, Antwortprüfung, Countdown). Keine Abhängigkeit zu Svelte oder Supabase → einfach testbar (Vitest).
- **Datenzugriff** nur über Server-Load-Funktionen und Form-Actions mit dem Nutzer-Token. Der `service_role`-Schlüssel wird nur an vier Stellen geladen: Seed-Script, Einladungs-Script, Konto-Löschen und Scan-Zähler (`consume_scan`/`refund_scan`). Ein Lint-Check (`$env/static/private` nur in `*.server.ts`) verhindert, dass er ins Frontend rutscht.
- **Zeitzone fest Europe/Berlin** für „heute“, Fälligkeiten, Countdown, Lerntage und das Scan-Limit (Reset um Mitternacht deutscher Zeit, nicht UTC).
- **Schriften selbst gehostet** (`@fontsource`), kein Google-Fonts-CDN (DSGVO, später relevant für Freunde, und besser für Lighthouse).
- **Claude:** offizielles SDK `@anthropic-ai/sdk`, Structured Outputs (`output_config.format` mit JSON-Schema) + zusätzliche Zod-Prüfung, 1 Wiederholung bei ungültiger Antwort, Abbruch-Gründe (`refusal`, `max_tokens`) werden abgefangen. Modell aus `ANTHROPIC_MODEL` (Vorschlag als Standard in `.env.example`: `claude-opus-5-5`; austauschbar, z. B. gegen ein günstigeres Modell).
- **PWA:** `@vite-pwa/sveltekit` (Manifest, Service Worker, Icons). Offline nur App-Hülle + „Du bist offline“-Hinweis, keine Offline-Datenhaltung (nicht beauftragt).
- **Kamera:** `<input type="file" accept="image/*" capture="environment">` öffnet direkt die Rückkamera; ein zweiter Button für Galerie/Dateien.

### Ordnerstruktur

```
/
├─ PLAN.md · DECISIONS.md · README.md · .env.example
├─ supabase/
│  ├─ migrations/               # Schema, RLS, Storage-Policies, Funktionen, Auth-Hook
│  ├─ tests/rls.test.sql        # pgTAP: Nutzer A sieht/ändert nichts von Nutzer B
│  └─ config.toml               # lokale Supabase (CLI + Docker)
├─ scripts/
│  ├─ seed.ts                   # Startdaten aus Notion für EINE E-Mail (idempotent)
│  └─ invite.ts                 # E-Mail auf Allowlist setzen + Einladung schicken
├─ src/
│  ├─ app.html · app.css · hooks.server.ts · service-worker (via vite-pwa)
│  ├─ lib/
│  │  ├─ domain/                # reine Logik + *.test.ts
│  │  │  ├─ grades.ts           # Punkt⇄Note-Tabelle, Schnitte, Ziel-Rechner
│  │  │  ├─ leitner.ts          # Boxen, Fälligkeit, Serie
│  │  │  ├─ answer-check.ts     # Eintipp-Prüfung
│  │  │  ├─ dates.ts            # Berlin-Zeit, „Noch 3 Tage“
│  │  │  └─ csv.ts
│  │  ├─ server/                # *.server.ts: supabase-admin, claude, scan-schema (Zod)
│  │  ├─ client/                # Bild verkleinern/HEIC, Upload
│  │  ├─ components/            # UI-Bausteine (Button, Sheet, SubjectDot, Flashcard …)
│  │  ├─ styles/tokens.css      # Design-Tokens (nach Meilenstein 2)
│  │  └─ types/database.ts      # generiert aus Supabase
│  └─ routes/
│     ├─ login/ · auth/confirm/
│     ├─ (app)/+layout          # geschützter Bereich mit Navigation
│     │  ├─ +page               # Dashboard
│     │  ├─ aufgaben/ · pruefungen/ · noten/
│     │  ├─ karten/[deck]/ · karten/[deck]/lernen/ · scan/
│     │  └─ einstellungen/
│     ├─ api/scan/ · api/account/export/ · api/account/delete/
│     └─ design/a … design/d    # nur Meilenstein 2, danach gelöscht
└─ tests/e2e/                   # Playwright: Login-Flow (mit Test-Nutzer), Abfrage, Tastatur
```

Navigation (mobil unten, 5 Punkte): **Start · Karten · Aufgaben · Noten · Mehr** (Prüfungen liegen unter „Aufgaben“ als zweiter Tab, Einstellungen unter „Mehr“). Desktop: Seitenleiste.

---

## 2. Datenmodell

Alle Nutzertabellen haben `id uuid pk`, `user_id uuid not null references auth.users on delete cascade`, `created_at`, `updated_at` (Ausnahmen: `allowed_emails` ohne Nutzerbezug, `profiles` mit `user_id` als pk, `scan_usage` mit pk (user_id, day)). **RLS-Regel überall gleich:** `select/insert/update/delete` nur wenn `user_id = auth.uid()` (bei `insert` per `with check`). Kind-Tabellen tragen `user_id` selbst, damit die Regel ohne Joins funktioniert. **Jeder Fremdschlüssel ist zusammengesetzt** `(x_id, user_id) → x(id, user_id)` (grades→subjects/exam_types/exams, homework→subjects, exams→subjects/exam_types/decks, decks→subjects, cards→decks, subject_exam_weights→subjects/exam_types, reviews→cards, scan_sources→decks). So kann niemand Zeilen an fremde IDs hängen; der RLS-Test prüft das.

| Tabelle | Wichtige Felder | Hinweise |
|---|---|---|
| `allowed_emails` | `email` (pk), `invited_at`, `note` | RLS an, keine Policy für Nutzer; nur eine Lese-Policy für `supabase_auth_admin` (Auth-Hook) und Zugriff über service_role (`invite.ts`). |
| `profiles` | `user_id` (pk), `grade_system` ('noten'\|'punkte'), `theme`, `accent`, `week_start`, `daily_goal`, `leitner_intervals int[5]` (Tage, Std. 1,3,7,14,30), `default_quiz_mode`, `default_direction`, `keep_originals bool`, `dashboard_modules jsonb` (Reihenfolge + sichtbar) | 1:1 zum Nutzer, wird beim ersten Login angelegt. |
| `subjects` | `name`, `short`, `color` (Token-Name), `icon` (Lucide-Name), `position`, `hidden bool`, `calc_mode` ('per_grade'\|'per_group'), `group_weight_big`, `group_weight_small` | „Ausblenden statt löschen“. |
| `exam_types` | `name`, `default_weight numeric`, `group` ('gross'\|'klein'), `position`, `archived bool` | Global pro Nutzer. Löschen = archivieren, wenn noch Noten daran hängen. |
| `subject_exam_weights` | `subject_id`, `exam_type_id`, `weight numeric` | Überschreibung pro Fach (unique pro Paar). |
| `grades` | `subject_id`, `exam_type_id`, `points numeric(4,2)` (0–15, Halbschritte für „2,5“), `date date null`, `note text`, `exam_id null` | Intern immer Punkte. Sortierung im Verlauf: `coalesce(date, created_at::date)`. |
| `homework` | `subject_id`, `title`, `due_date date`, `priority smallint null`, `note`, `done_at timestamptz null` | Ansichten per Abfrage. |
| `exams` | `subject_id`, `exam_type_id`, `title`, `date date`, `time time null`, `topics text`, `deck_id null`, `grade_prompt_dismissed bool` | „Note eintragen?“ erscheint, wenn `date < heute`, keine Note mit `exam_id` und nicht weggeklickt. |
| `decks` | `subject_id`, `name`, `default_kind` ('vokabel'\|'fakt'), `custom_fields jsonb` ([{key,label}]), `last_used_at` | |
| `cards` | `deck_id`, `kind`, `term`, `forms`, `meaning`, `hint`, `question`, `answer`, `extra jsonb` (eigene Felder), `box smallint 1–5`, `due_date date`, `last_reviewed_at`, `position` | Vokabel nutzt term/forms/meaning/hint, Fakt nutzt question/answer. |
| `reviews` | `card_id`, `reviewed_at`, `mode`, `direction`, `part` ('bedeutung'\|'formen'\|'beides'), `result` ('richtig'\|'fast'\|'falsch'), `overridden bool`, `box_before`, `box_after` | Grundlage für Tagesziel, Serie, „schwierige Karten“. |
| `scan_sources` | `deck_id null`, `path`, `mime`, `created_at` | Nur wenn „Originale speichern“ an ist: Verweis auf die gespeicherte (verkleinerte) Datei im Bucket. |
| `scan_usage` | `user_id`, `day date` (Berlin), `count int` — pk (user_id, day) | Nur lesbar für den Nutzer; Schreiben ausschließlich über Funktion. |

**SQL-Funktionen**
- `consume_scan(p_user_id uuid, p_limit int) returns int` – `security definer`, **`execute` für `anon` und `authenticated` entzogen**, nur der Server ruft sie mit `service_role` auf (nachdem er den Nutzer aus der Session bestimmt hat). Macht `insert … on conflict (user_id, day) do update set count = count + 1 where scan_usage.count < p_limit returning count`. Kein Ergebnis ⇒ Limit erreicht. Atomar, auch bei parallelen Anfragen. Das Limit kommt aus der Env-Variable `SCAN_DAILY_LIMIT` (Std. 30). Bei Fehlern der Claude-API (Netz, 5xx – nicht bei „Seite leer/unscharf“) bucht der Server mit `refund_scan(p_user_id)` (gleiche Rechte, nur service_role) zurück. Der RLS-Test prüft, dass ein normaler Nutzer beide Funktionen nicht aufrufen kann.
- `hook_before_user_created(event jsonb)` – Auth-Hook: lehnt die Anmeldung ab, wenn die E-Mail nicht in `allowed_emails` steht. Rechte ausdrücklich: `grant execute … to supabase_auth_admin`, `grant select on allowed_emails to supabase_auth_admin` + Policy nur für diese Rolle; `execute` für `authenticated`/`anon`/`public` entzogen. `invite.ts` setzt die E-Mail zuerst auf die Allowlist und lädt dann ein; beides wird getestet. Zusätzlich sendet die Login-Seite `shouldCreateUser: false`, und die Supabase-Einstellung „Allow new users to sign up“ bleibt an, nur dann greift der Hook (siehe README).
- `handle_new_user()` – Trigger auf `auth.users`: legt `profiles` und die Standard-Prüfungsarten an.

**Storage**
- Bucket `scans`, privat. Policies: Lesen/Schreiben/Löschen nur, wenn der erste Pfadteil `= auth.uid()`. Dateien werden nach der Verarbeitung gelöscht, außer `keep_originals = true`.
- Bei „Originale speichern = an“ lädt der Client die verkleinerte Datei (bzw. das PDF/den Text) nach erfolgreichem Scan in den Bucket und legt eine Zeile in `scan_sources` an.
- **Konto löschen:** zuerst alle Dateien unter `scans/{user_id}/` löschen, dann `auth.admin.deleteUser` (Kaskade löscht alle Zeilen). Vorher Bestätigungsdialog mit Eintippen der E-Mail.
- Große PDFs (> 4 MB): Client lädt per Signed Upload URL direkt in den Bucket; `/api/scan` bekommt nur den Pfad und liest die Datei mit dem Nutzer-Token aus Storage.

**RLS-Test:** pgTAP-Test in `supabase/tests/` (läuft mit `supabase test db`): legt zwei Nutzer an, schreibt Daten als A, prüft als B für **jede** Tabelle und den Storage-Bucket, dass Lesen 0 Zeilen liefert und Schreiben/Ändern/Löschen fehlschlägt; prüft, dass `allowed_emails` für niemanden lesbar ist. Zusätzlich ein Test, der automatisch fehlschlägt, wenn eine Tabelle im Schema `public` ohne aktiviertes RLS existiert.

---

## 3. Fachlogik – wie ich sie umsetzen würde

**Noten ⇄ Punkte** (eine Tabelle in `grades.ts`, getestet): 1+=15, 1=14, 1-=13, 2+=12, 2=11, 2-=10, 3+=9, 3=8, 3-=7, 4+=6, 4=5, 4-=4, 5+=3, 5=2, 5-=1, 6=0. Eingabe „2,5“ → Mittel aus 2 (11) und 3 (8) = 9,5 Punkte. Schnitte werden in Punkten gerechnet, erst bei der Anzeige gerundet und immer mit zwei Nachkommastellen ausgegeben; im Notensystem per (17 − P)/3, **begrenzt auf 1,00–6,00** (15 P → 1,00; 1 P → 5,33; 0 P → 6,00). Grenzfälle 15/1/0 sind Unit-Tests (Frage 1). Farben/Pfeile: „besser“ ist im Notensystem ein sinkender, im Punktesystem ein steigender Wert – intern einheitlich über Punkte, Anzeige dreht nur die Richtung.

**Fachschnitt** pro Note: Σ(Punkte × Gewicht)/Σ(Gewicht); pro Gruppe: Schnitt „groß“ und „klein“ getrennt (innerhalb der Gruppe gelten die Einzelgewichte der Prüfungsarten, inkl. Überschreibung pro Fach), dann die beiden Gruppen gewichtet (Standard 1 : 1, pro Fach änderbar); fehlt eine Gruppe, zählt nur die andere. **Gesamtschnitt** = Mittel der Fachschnitte aller Fächer mit ≥ 1 Note. Fächer ohne Note: „–“.

**Ziel-Rechner:** löst die Formel nach der benötigten nächsten Note der gewählten Art auf, rundet auf die nächste erreichbare Stufe (Tendenzen/Punkte), prüft Grenzen (0–15). Unerreichbar ⇒ klarer Satz + bestes erreichbares Ergebnis (mit 1+ bzw. 15 Punkten).

**Leitner:** neue Karten Box 1, fällig heute. Gewusst/fast ⇒ Box + 1 (max 5), fällig = heute + Intervall der neuen Box; nicht gewusst ⇒ Box 1, fällig morgen. Ein Leitner-Stand pro Karte (nicht pro Richtung). „Beides“: nur weiter, wenn Bedeutung **und** Formen gewusst.

**Antwortprüfung** (`answer-check.ts`): Normalisierung (Kleinschreibung, Längenzeichen/Diakritika → Grundbuchstabe via NFD, Satzzeichen und Mehrfach-Leerzeichen weg), deutschen Artikel (der/die/das/ein/eine) optional, Klammerinhalte und Gebrauchshinweise vor dem Doppelpunkt entfernen, Alternativen an `,` `;` `/` trennen – eine reicht. Levenshtein ≤ 1 ab 5 Buchstaben ⇒ „fast richtig“, die korrekte Form wird angezeigt. Nach jeder Antwort erscheint die vollständige Lösung inkl. der vorher entfernten Hinweise (z. B. „m. dopp. Akk.: nennen“). „Doch richtig“ überstimmt jede Bewertung. Für **Stammformen** wird nicht in Alternativen getrennt, sondern Form für Form verglichen (Frage 3). Unit-Tests mit allen schwierigen Wörtern aus dem Latein-Stapel, ausdrücklich u. a.: „amo, amavi, amatum“ ist richtig für „amō, amāvī, amātum“; „Freund“ = „der Freund“; „ob“ ist richtig für `an`; „nennen“ ist richtig für `appellāre`; „bemerkem“ ⇒ fast richtig.

---

## 4. Meilensteine (nach jedem: STOPP + Bericht + Prüf-Agent)

| # | Inhalt | Umfang (grob) |
|---|---|---|
| 1 | Dieser Plan | – |
| 2 | 4 Design-Richtungen unter `/design/a–d` (je Dashboard + Abfrage, Handygröße, Text zu Schrift/Farbe/Stimmung) → Auswahl → `tokens.css` (Farben inkl. 10 Fachfarben hell/dunkel, Abstände, Typo-Skala, Radien, Bewegung) | mittel |
| 3 | Grundgerüst: SvelteKit-Projekt, Supabase-Migrationen + RLS + Storage-Policies + Auth-Hook, RLS-Test, Login (Magic Link, ggf. + Code), Allowlist + `invite.ts`, Navigation, leere Seiten mit hilfreichen Texten, Einstellungsseite mit aufklappbaren Gruppen + Gruppe „Fächer“, `seed.ts` mit allen Startdaten | groß |
| 4 | Hausaufgaben (4 Ansichten, Abhaken) + Prüfungen (Countdown, Vergangenes ausblenden, „Note eintragen?“, Stapel verknüpfen) | mittel |
| 5 | Notenmanager: Eintragen, beide Systeme (+ Einstellungsgruppe „Notensystem“), Prüfungsarten/Gewichte global + pro Fach (+ Einstellungsgruppe), beide Rechenarten, Ziel-Rechner, Verlaufsgrafik, Unit-Tests | groß |
| 6 | Karteikarten manuell (Stapel anlegen/umbenennen, Karten, eigene Felder + Einstellungsgruppe „Karteikarten“, Verschieben, CSV) + Einstellungsgruppe „Lernen“ (Intervalle, Tagesziel, Standard-Modus/-Richtung) + Abfrage (3 Modi, Richtung, Teil, Leitner, Tastatur/Wischen, Auswertung, Tagesziel/Serie) + Tests der Prüffunktion | groß |
| 7 | Scan: alle Eingabewege, Kartenart automatisch oder vorab festgelegt, Einstellung „Originale speichern“, Verkleinern/HEIC im Browser, PDF-Direkt-Upload, Claude-Aufruf mit Schema + Zod + Retry, Vorschau-Editor (korrigieren, löschen, hinzufügen, zusammenführen, Dubletten), Limit mit freundlicher Meldung, Fehlerfälle: unscharfes Foto, leere Seite, falscher Dateityp, ungültige KI-Antwort, Zeitüberschreitung | groß |
| 8 | Dashboard (5 Module in der vorgegebenen Reihenfolge, ein-/ausblendbar, sortierbar; Lernvorschlag für mit einer Prüfung verknüpften Stapel), Einstellungsgruppen „Dashboard“, „Darstellung“, „Konto“ (E-Mail, JSON-Export, Löschen), PWA | mittel |
| 9 | Abschluss: Prüf-Agent gegen den ganzen Auftrag, Lighthouse mobil (≥ 90 P/A/BP), README + Vercel-Deployment, To-do-Liste für dich | klein–mittel |

Tests insgesamt: Vitest (Domain-Logik), pgTAP (RLS), Playwright (Kernabläufe, Tastaturbedienung, axe-Barrierefreiheits-Check).

---

## 5. Annahmen (entscheide ich selbst, Einspruch jederzeit)

1. **Wochenstart Montag**, Datumsformat deutsch (10.11.2026), Zeitzone Europe/Berlin.
2. **Seed:** idempotent (zweimal ausführen legt nichts doppelt an). Die Prüfung „Mathematik 1. Kurzarbeit, 10.11.2026“ ist vorbei → sie wird ausgeblendet und das Dashboard fragt „Note eintragen?“ (gewollt, weil das genau der beschriebene Ablauf ist). Die fünf Noten bekommen kein Datum; „3“ = 8 Punkte, „4“ = 5 Punkte. „Deutsch 30.11. Uhrzeit unsicher“ → Uhrzeit leer, Hinweis „Uhrzeit unsicher“ in der Notiz.
3. **Prüfungsart „Mündlich/Abfrage“** wird so geschrieben angelegt; die Standard-Gewichte genau wie im Auftrag; Gruppe „groß“ = Schulaufgabe und Klausur, Rest „klein“. Standard-Rechenart pro Fach: „Pro Note“.
4. **Serie (Lerntage):** ein Tag zählt, wenn mindestens das Tagesziel erreicht wurde. Heute noch nicht gelernt bricht die Serie erst um Mitternacht.
5. **Multiple Choice:** falsche Antworten aus demselben Stapel und vom gleichen Kartentyp; hat der Stapel weniger als 4 Karten, gibt es entsprechend weniger Optionen (Hinweis statt Fake-Antworten).
6. **Dubletten** beim Scan: gleicher normalisierter `begriff` (bzw. `frage`) im Zielstapel.
7. **„Gemischt“** heißt pro Karte zufällig eine Richtung.
8. **Fakt-Karten** haben keine Formen; „nur Stammformen“ überspringt sie in einer Runde.
9. Kein Offline-Lernen in v1 (nicht beauftragt); die App zeigt offline einen klaren Hinweis.
10. Die Struktur für Impressum/Datenschutz wird vorbereitet (Route-Gruppe `(legal)` + Footer-Link-Slot), aber nicht befüllt und nicht verlinkt (keine leeren Platzhalter-Seiten).
11. Schuljahr: Noten und Prüfungen bekommen kein eigenes Schuljahr-Feld in v1 (nicht beauftragt). Kann später per Migration ergänzt werden.

---

## 6. Offene Fragen (mit meiner Hypothese)

1. **Tendenzen im Schnitt (Notensystem 1–6):** Ich rechne intern mit Punkten, also zählen Tendenzen mit (2- ist schlechter als 2). An bayerischen Gymnasien werden Tendenzen im Zeugnisschnitt oft *nicht* mitgerechnet. *Hypothese:* Tendenzen zählen mit, so wie die Tabelle im Auftrag es nahelegt, und der Schnitt wird für die Anzeige als Note mit zwei Nachkommastellen ausgegeben (Umrechnung Punkte → Note: (17 − P)/3, begrenzt auf 1,00–6,00).
2. **Login in der installierten iPhone-App:** Ein Magic Link öffnet sich auf dem iPhone in Safari, nicht in der installierten PWA – dort bist du dann eingeloggt, in der App aber nicht. *Hypothese:* Die Mail enthält zusätzlich einen 6-stelligen Code, den man in der App eintippt. Link und Code funktionieren beide.
3. **Stammformen eintippen:** Bei „amāre → amō, amāvī, amātum“ müssen *alle* Formen in der richtigen Reihenfolge stimmen (Tippfehler-Toleranz pro Form), anders als bei Bedeutungen, wo eine reicht. Einträge wie „Adv.“, „Präp. m. Akk.“ oder „–“ gelten nicht als abfragbare Formen; solche Karten werden bei „nur Stammformen“ übersprungen.
4. **Supabase-Projekt:** In dieser Umgebung ist ein Supabase-Zugang verbunden. *Hypothese:* Ich entwickle und teste lokal (Supabase CLI + Docker), und **du** legst das echte Projekt an (Region Frankfurt `eu-central-1`) und trägst die Keys ein. Alternativ lege ich es mit deiner Erlaubnis direkt über den Zugang an.
5. **Claude-Modell als Standard:** *Hypothese:* `claude-opus-5-5` als Vorgabe in `.env.example` (beste Erkennung von Längenzeichen, ca. 3–8 Cent pro Seite); du kannst per `ANTHROPIC_MODEL` auf ein günstigeres Modell wechseln. Nach Meilenstein 7 messe ich die Erkennung an einem echten Foto, wenn du mir eins gibst.

---

## 7. Dinge, die dich später erwischen könnten (schon eingeplant)

- **E-Mail-Versand:** Der eingebaute Supabase-Mailer schickt nur sehr wenige Mails pro Stunde und ist nicht für echte Nutzer gedacht. Für dich allein reicht er; bevor Freunde testen, brauchst du einen eigenen SMTP-Dienst (README erklärt es).
- **Supabase Free pausiert** Projekte nach rund einer Woche ohne Aktivität. Wieder aufwecken geht im Dashboard; steht in der README.
- **Vercel Funktionsdauer:** Ein Scan kann 10–40 s dauern. Die Scan-Route bekommt eine erhöhte `maxDuration`, und die App zeigt einen Fortschritt statt einer eingefrorenen Seite.
- **Kosten-Deckel:** Das Tageslimit schützt pro Nutzer; zusätzlich empfehle ich ein monatliches Ausgabenlimit in der Anthropic-Konsole (To-do-Liste).
- **Datenschutz für später:** Scans gehen an Anthropic (USA). Das gehört in die Datenschutzerklärung, bevor Freunde testen.

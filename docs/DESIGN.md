# Design-System „Präzises Werkzeug“

Gewählt am 12.11.2026 aus vier Richtungen (Richtung B). Referenz-Screens: `docs/design/b-startseite.png`, `docs/design/b-abfrage.png`.
Alle Werte stehen in `src/lib/styles/tokens.css`. Die Kontraste prüft `src/lib/styles/tokens.test.ts` (WCAG AA, hell und dunkel).

## Haltung

- Ruhig, neutral und dicht wie ein Profi-Werkzeug. Viel Information auf einen Blick, keine Deko.
- **Eine Akzentfarbe** (Standard Signalorange) markiert nur die _eine_ Aktion pro Ansicht, die gerade zählt, zum Beispiel „Start“ oder „Gewusst“. Alles andere ist neutral.
- **Fachfarben** erscheinen als schmaler Marker (3 × 14 px) oder als Text, nie als große Fläche.
- **Überfällig** steht immer als Wort da („überfällig“) und zusätzlich in Akzentfarbe, nicht rot und nicht fett. Die Information hängt nie nur an der Farbe.
- Tastenkürzel werden am Desktop als `kbd` angezeigt, am Handy ausgeblendet.

## Typografie

- Eine Familie: **Geist** (selbst gehostet über `@fontsource-variable/geist`). Die Hierarchie entsteht über Größe und Gewicht.
- Skala: 12,5 · 13 · 14 (Basis) · 16 · 18 · 22 · 28 · 44 px.
- Gewichte: 400 Text, 500 Bedienelemente, 600 Überschriften und Labels, 650 große Zahlen und Seitentitel.
- Zahlen (Noten, Fristen, Zähler) immer tabellarisch (`.tn` oder `font-variant-numeric: tabular-nums`) und in Spalten rechtsbündig.
- Labels in normaler Schreibung, keine Versalien.

## Raster und Module

- Mobil eine Spalte mit 12 px Rand. Module (`panel`: Fläche, 1 px Rahmen, Radius 8) haben je nach Wichtigkeit unterschiedliche Größen. Beispiel: „Wiederholen“ breit mit großer Zahl, Serie als schmales Modul daneben.
- Listen bestehen aus Zeilen mit mindestens 40 px Höhe (Tippziel 44 px über Padding) und 1 px Trennlinie.
- Desktop: Seitenleiste plus Inhalt in zwei bis drei Spalten unterschiedlicher Breite.

## Fachfarben (Zuordnung der Startfächer)

| Fach                     | Token                                    |
| ------------------------ | ---------------------------------------- |
| Mathematik               | `--subject-blau`                         |
| Deutsch                  | `--subject-rot`                          |
| Englisch                 | `--subject-petrol`                       |
| Latein                   | `--subject-violett`                      |
| Physik                   | `--subject-gruen`                        |
| Chemie                   | `--subject-senf`                         |
| Geographie               | `--subject-oliv`                         |
| Wirtschaft & Recht       | `--subject-braun`                        |
| Religion                 | `--subject-schiefer`                     |
| Politik und Gesellschaft | `--subject-magenta`                      |
| frei für neue Fächer     | `--subject-tuerkis`, `--subject-pflaume` |

In der Datenbank wird nur der Name des Tokens gespeichert (z. B. `violett`), nie ein Hexwert. So passt die Farbe automatisch zu hell und dunkel.

## Akzentfarben

- Wählbar sind **Orange** (Standard), **Tanne** und **Wein**. Sie sind so gewählt, dass keine einer Fachfarbe, der Gefahr-Farbe oder der Textfarbe gleicht. Ein Test prüft den Mindestabstand.
- Status: Nur `--danger` für zerstörende Aktionen, zum Beispiel „Konto löschen“. Für richtig und falsch gibt es keine Ampelfarben, die Abfrage arbeitet mit Graphit, Grau und Akzent.

## Bewegung

- 120 ms für Abhaken und Hover, 200 ms für Umdrehen und Einblenden, 320 ms höchstens für Fortschrittsbalken.
- Die Karteikarte klappt beim Umdrehen kurz um die Querachse. Es gibt keine Einblend-Animationen beim Laden.
- `prefers-reduced-motion` schaltet alle Animationen global ab (`base.css`).

## Icons

- Nur **Lucide** (`@lucide/svelte`), Strichstärke **1,75**, Größe 16 (in Zeilen) oder 18 (in Buttons).

## Hell und dunkel

- Hell: kühles Neutralgrau `#f3f4f6`, Flächen weiß.
- Dunkel: Graphit `#16181c`, Flächen `#1f2228`, Rahmen statt Schatten. Akzent und Fachfarben sind aufgehellt.
- Umschaltung über `data-theme="light|dark"` am `<html>`. Ohne Attribut folgt die App dem System. Die Akzentfarbe wird über `data-accent` gesetzt.

## Barrierefreiheit

- Fokusring 2 px in `--focus` mit 2 px Abstand, mindestens 3:1 zu jedem Hintergrund. Wenn ein Element auf eigener Fläche sitzt, setzt die Komponente `--focus` lokal passend.
- Kontraste sind über Tests abgesichert: Text, gedämpfter Text, Fach-, Akzent- und Gefahr-Farbe auf allen Flächen (inklusive `--surface-sunken` und `--accent-soft`), ≥ 4,5:1. Neue Farben kommen nur über `tokens.css` mit Test hinzu.

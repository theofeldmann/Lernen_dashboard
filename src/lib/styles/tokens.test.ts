import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8');

function block(selector: string, from = 0): Record<string, string> {
	const start = css.indexOf(selector, from);
	if (start < 0) throw new Error(`Block ${selector} fehlt`);
	const open = css.indexOf('{', start);
	const close = css.indexOf('}', open);
	const vars: Record<string, string> = {};
	for (const m of css.slice(open + 1, close).matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
		vars[m[1]] = m[2].toLowerCase();
	}
	return vars;
}

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mix(a: string, b: string, p: number): string {
	const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
	return (
		'#' +
		[1, 3, 5]
			.map((i) =>
				Math.round(ch(a, i) * p + ch(b, i) * (1 - p))
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}

function distance(a: string, b: string): number {
	const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
	return Math.hypot(...[1, 3, 5].map((i) => ch(a, i) - ch(b, i)));
}

export function contrast(a: string, b: string): number {
	const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (l1 + 0.05) / (l2 + 0.05);
}

const light = block(':root {');
const darkAttr = block(":root[data-theme='dark'] {");
const darkMedia = block(
	":root:not([data-theme='light']) {",
	css.indexOf('@media (prefers-color-scheme: dark)')
);
const dark = { ...light, ...darkAttr };

const subjects = Object.keys(light).filter((k) => k.startsWith('subject-'));
const accents = Object.keys(light).filter((k) => k.startsWith('accent-'));

describe.each([
	['hell', light],
	['dunkel', dark]
])('Kontraste im Modus %s (WCAG AA)', (_name, t) => {
	it('Text und gedämpfter Text auf Hintergrund und Fläche ≥ 4,5:1', () => {
		for (const fg of ['text', 'text-muted'])
			for (const bg of ['bg', 'surface', 'surface-sunken'])
				expect(contrast(t[fg], t[bg]), `${fg} auf ${bg}`).toBeGreaterThanOrEqual(4.5);
	});

	it('jede Fachfarbe ist als Text auf Hintergrund und Fläche lesbar (≥ 4,5:1)', () => {
		expect(subjects.length).toBeGreaterThanOrEqual(10);
		for (const s of subjects)
			for (const bg of ['bg', 'surface', 'surface-sunken'])
				expect(contrast(t[s], t[bg]), `${s} auf ${bg}`).toBeGreaterThanOrEqual(4.5);
	});

	it('jede Akzentfarbe trägt Button-Text und ist auf allen Flächen als Text lesbar', () => {
		expect(accents.length).toBeGreaterThanOrEqual(3);
		for (const a of accents) {
			expect(contrast(t['text-on-accent'], t[a]), `Text auf ${a}`).toBeGreaterThanOrEqual(4.5);
			const soft = mix(t[a], t.surface, 0.1); // entspricht --accent-soft
			for (const [name, bg] of [
				['bg', t.bg],
				['surface', t.surface],
				['surface-sunken', t['surface-sunken']],
				['accent-soft', soft]
			])
				expect(contrast(t[a], bg), `${a} auf ${name}`).toBeGreaterThanOrEqual(4.5);
		}
	});

	it('Akzentfarben sind klar von Text, Fach- und Statusfarben unterscheidbar', () => {
		for (const a of accents) {
			expect(t[a]).not.toBe(t.text);
			for (const other of [...subjects, 'danger'])
				expect(distance(t[a], t[other]), `${a} vs. ${other}`).toBeGreaterThanOrEqual(35);
		}
	});

	it('Gefahr-Farbe ist als Text und als Button lesbar', () => {
		for (const bg of ['bg', 'surface', 'surface-sunken'])
			expect(contrast(t.danger, t[bg]), `danger auf ${bg}`).toBeGreaterThanOrEqual(4.5);
		expect(contrast(t['text-on-accent'], t.danger)).toBeGreaterThanOrEqual(4.5);
	});

	it('Fachfarben sind untereinander unterscheidbar', () => {
		for (let i = 0; i < subjects.length; i++)
			for (let j = i + 1; j < subjects.length; j++)
				expect(
					distance(t[subjects[i]], t[subjects[j]]),
					`${subjects[i]} vs. ${subjects[j]}`
				).toBeGreaterThanOrEqual(30);
	});

	it('Fokusring und kräftige Rahmen heben sich ab (≥ 3:1)', () => {
		for (const bg of ['bg', 'surface']) {
			expect(contrast(t.focus, t[bg])).toBeGreaterThanOrEqual(3);
			expect(contrast(t['border-strong'], t[bg]), `border-strong auf ${bg}`).toBeGreaterThanOrEqual(
				3
			);
		}
	});
});

describe('Dunkelmodus', () => {
	it('Attribut- und System-Variante haben identische Werte', () => {
		expect(darkMedia).toEqual(darkAttr);
	});
	it('überschreibt jede Farbe des Hellmodus', () => {
		for (const k of Object.keys(light)) expect(darkAttr, k).toHaveProperty(k);
	});
});

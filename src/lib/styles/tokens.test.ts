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

/** Wahrgenommener Farbabstand nach CIEDE2000 (sRGB → Lab, D65). */
function lab(hex: string): [number, number, number] {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
	const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
	const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
	return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function deltaE(c1: string, c2: string): number {
	const rad = (d: number) => (d * Math.PI) / 180;
	const deg = (r: number) => (r * 180) / Math.PI;
	const [L1, a1, b1] = lab(c1);
	const [L2, a2, b2] = lab(c2);
	const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
	const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
	const a1p = a1 * (1 + G);
	const a2p = a2 * (1 + G);
	const C1p = Math.hypot(a1p, b1);
	const C2p = Math.hypot(a2p, b2);
	const h1 = (deg(Math.atan2(b1, a1p)) + 360) % 360;
	const h2 = (deg(Math.atan2(b2, a2p)) + 360) % 360;
	let dh = h2 - h1;
	if (C1p * C2p === 0) dh = 0;
	else if (dh > 180) dh -= 360;
	else if (dh < -180) dh += 360;
	const dL = L2 - L1;
	const dC = C2p - C1p;
	const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dh / 2));
	const Lb = (L1 + L2) / 2;
	const Cbp = (C1p + C2p) / 2;
	let hb = h1 + h2;
	if (C1p * C2p !== 0)
		hb = Math.abs(h1 - h2) <= 180 ? hb / 2 : hb < 360 ? (hb + 360) / 2 : (hb - 360) / 2;
	const T =
		1 -
		0.17 * Math.cos(rad(hb - 30)) +
		0.24 * Math.cos(rad(2 * hb)) +
		0.32 * Math.cos(rad(3 * hb + 6)) -
		0.2 * Math.cos(rad(4 * hb - 63));
	const dt = 30 * Math.exp(-(((hb - 275) / 25) ** 2));
	const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
	const Sl = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2);
	const Sc = 1 + 0.045 * Cbp;
	const Sh = 1 + 0.015 * Cbp * T;
	const Rt = -Math.sin(rad(2 * dt)) * Rc;
	return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
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

	it('Akzentfarben sind klar von Text, Fach- und Statusfarben unterscheidbar (ΔE2000 ≥ 12)', () => {
		for (const a of accents) {
			expect(t[a]).not.toBe(t.text);
			for (const other of [...subjects, 'danger'])
				expect(deltaE(t[a], t[other]), `${a} vs. ${other}`).toBeGreaterThanOrEqual(12);
		}
	});

	it('Gefahr-Farbe ist lesbar und von jeder Fachfarbe unterscheidbar', () => {
		for (const bg of ['bg', 'surface', 'surface-sunken'])
			expect(contrast(t.danger, t[bg]), `danger auf ${bg}`).toBeGreaterThanOrEqual(4.5);
		expect(contrast(t['text-on-accent'], t.danger)).toBeGreaterThanOrEqual(4.5);
		for (const sub of subjects)
			expect(deltaE(t.danger, t[sub]), `danger vs. ${sub}`).toBeGreaterThanOrEqual(10);
	});

	it('Fachfarben sind untereinander unterscheidbar (ΔE2000 ≥ 10)', () => {
		for (let i = 0; i < subjects.length; i++)
			for (let j = i + 1; j < subjects.length; j++)
				expect(
					deltaE(t[subjects[i]], t[subjects[j]]),
					`${subjects[i]} vs. ${subjects[j]}`
				).toBeGreaterThanOrEqual(10);
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

describe('Farbabstand (Selbsttest)', () => {
	it('liefert bekannte CIEDE2000-Werte', () => {
		expect(deltaE('#ffffff', '#ffffff')).toBe(0);
		expect(deltaE('#000000', '#ffffff')).toBeCloseTo(100, 0);
	});
});

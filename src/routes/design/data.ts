// Gemeinsame Inhalte für die vier statischen Design-Entwürfe (Stand 12.11.2026).
// Prüfungen, Noten und Karten stammen aus deinen Notion-Startdaten.
// Hausaufgaben gibt es dort keine – die drei Einträge sind Beispiele für den Entwurf.

export type SubjectKey =
	| 'mathe'
	| 'deutsch'
	| 'englisch'
	| 'latein'
	| 'physik'
	| 'chemie'
	| 'geo'
	| 'wr'
	| 'religion'
	| 'pug';

export const subjects: Record<SubjectKey, { name: string; short: string }> = {
	mathe: { name: 'Mathematik', short: 'M' },
	deutsch: { name: 'Deutsch', short: 'D' },
	englisch: { name: 'Englisch', short: 'E' },
	latein: { name: 'Latein', short: 'L' },
	physik: { name: 'Physik', short: 'Ph' },
	chemie: { name: 'Chemie', short: 'C' },
	geo: { name: 'Geographie', short: 'Geo' },
	wr: { name: 'Wirtschaft & Recht', short: 'WR' },
	religion: { name: 'Religion', short: 'Rel' },
	pug: { name: 'Politik und Gesellschaft', short: 'PuG' }
};

export const today = { weekday: 'Donnerstag', date: '12. November', short: 'Do, 12.11.' };

export const homework = [
	{ subject: 'mathe' as SubjectKey, title: 'Ableitungen, AB Aufgabe 3–6', due: 'Überfällig seit gestern', overdue: true },
	{ subject: 'englisch' as SubjectKey, title: 'Vokabeln Unit 2 wiederholen', due: 'Heute', overdue: false },
	{ subject: 'deutsch' as SubjectKey, title: 'Gedichtanalyse fertig schreiben', due: 'Heute', overdue: false }
];

export const review = { due: 30, done: 12, goal: 30, streak: 4 };

export const decks = [
	{ subject: 'latein' as SubjectKey, name: 'Latein Wortschatz A (S. 15 + 17)', cards: 42, due: 30, lastUsed: 'Heute' }
];

export const exams = [
	{ subject: 'wr' as SubjectKey, title: 'Kurzarbeit', type: 'Kurzarbeit', date: 'Mo, 16.11.', time: '08:00', days: 4 },
	{ subject: 'chemie' as SubjectKey, title: '1. Kurzarbeit', type: 'Kurzarbeit', date: 'Mo, 23.11.', time: null, days: 11 },
	{ subject: 'latein' as SubjectKey, title: '1. Schulaufgabe (Sallust)', type: 'Schulaufgabe', date: 'Mi, 25.11.', time: '09:30', days: 13, deck: 'Latein Wortschatz A (S. 15 + 17)' }
];

export const gradePrompt = { subject: 'mathe' as SubjectKey, title: '1. Kurzarbeit', date: '10.11.' };

// Schnitte im Notensystem 1–6 (aus Punkten gerechnet, siehe PLAN.md).
export const averages: { subject: SubjectKey; avg: number | null; grades: string[] }[] = [
	{ subject: 'latein', avg: 3.5, grades: ['4', '3'] },
	{ subject: 'englisch', avg: 4.0, grades: ['4'] },
	{ subject: 'religion', avg: 3.0, grades: ['3'] },
	{ subject: 'pug', avg: 4.0, grades: ['4'] },
	{ subject: 'mathe', avg: null, grades: [] },
	{ subject: 'deutsch', avg: null, grades: [] }
];
export const overall = 3.63;

export const fmt = (n: number | null) => (n === null ? '–' : n.toFixed(2).replace('.', ','));

export const quiz = {
	deck: 'Latein Wortschatz A (S. 15 + 17)',
	position: 13,
	total: 30,
	box: 1,
	front: 'amāre',
	forms: 'amō, amāvī, amātum',
	meaning: 'lieben',
	hint: null as string | null,
	next: { front: 'appellāre', forms: 'appellō, appellāvī, appellātum', meaning: 'ansprechen, anrufen; nennen, bezeichnen (als)', hint: 'm. dopp. Akk.: nennen' }
};

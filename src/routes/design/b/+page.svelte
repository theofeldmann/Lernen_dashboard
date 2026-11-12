<script lang="ts">
	import '@fontsource-variable/geist';
	import { Check, ScanLine, ChevronRight, X, Flame, CircleAlert } from '@lucide/svelte';
	import Frame from '../Frame.svelte';
	import { subjects, today, homework, review, decks, exams, averages, overall, fmt, quiz as q, gradePrompt, type SubjectKey } from '../data';

	const color: Record<SubjectKey, string> = {
		mathe: '#2563eb', deutsch: '#dc2626', englisch: '#0e7490', latein: '#7c3aed', physik: '#047857',
		chemie: '#b45309', geo: '#4d7c0f', wr: '#9a3412', religion: '#475569', pug: '#be185d'
	};
	let done = $state<boolean[]>(homework.map(() => false));
	let flipped = $state(false);
	const segs = Array.from({ length: q.total }, (_, i) => (i < q.position - 1 ? (i % 4 === 2 ? 'bad' : 'ok') : i === q.position - 1 ? 'cur' : ''));
</script>

<svelte:head><title>Richtung B – Präzises Werkzeug</title></svelte:head>

<Frame letter="b" title="Präzises Werkzeug">
	{#snippet about()}
		<p><strong>Schrift:</strong> Nur Geist, aber mit klarer Hierarchie über Gewicht und Größe. Alle Zahlen sind tabellarisch und rechtsbündig, damit Spalten sauber stehen.</p>
		<p><strong>Farben:</strong> Kühles Neutralgrau, Weiß und Graphit. Signalorange ist die einzige Akzentfarbe und markiert nur die eine Aktion, die gerade zählt. Fachfarben erscheinen nur als kleine Marker.</p>
		<p><strong>Stimmung:</strong> Wie ein gutes Profi-Werkzeug: dicht, schnell und ohne Deko. Viel Information auf einen Blick. Tastenkürzel sind sichtbar, Module haben je nach Wichtigkeit unterschiedliche Größen.</p>
		<p><strong>Dunkelmodus:</strong> Graphit (#17191d) mit Flächen eine Stufe heller und feinen Rahmen statt Schatten. Das Orange wird für Text etwas heller. Falls dir eine einzige Schrift zu nüchtern ist, kann für Zahlen eine zweite dazukommen.</p>
	{/snippet}

	{#snippet dashboard()}
		<div class="tool">
			<header class="bar">
				<div>
					<h1>{today.weekday}, {today.date}</h1>
					<p class="sub">3 offen · {review.due} Karten fällig · nächste Prüfung in 4 Tagen</p>
				</div>
			</header>


			<section class="panel">
				<h2>Heute <span class="count">3</span></h2>
				<ul class="rows">
					{#each homework as hw, i (hw.title)}
						<li class:done={done[i]}>
							<button class="check" aria-pressed={done[i]} aria-label="{hw.title} erledigt" onclick={() => (done[i] = !done[i])}>
								{#if done[i]}<Check size={12} strokeWidth={2.5} />{/if}
							</button>
							<span class="mark" style:background={color[hw.subject]}></span>
							<span class="t">{hw.title}</span>
							<span class="meta" class:late={hw.overdue}>{hw.overdue ? 'überfällig' : 'heute'}</span>
						</li>
					{/each}
				</ul>
			</section>

			<div class="grid">
				<section class="panel hero">
					<h2>Wiederholen</h2>
					<p class="kpi"><span class="n">{review.due}</span> Karten heute fällig</p>
					<div class="meter" role="progressbar" aria-valuenow={review.done} aria-valuemax={review.goal} aria-label="Tagesziel">
						<span style:width="{(review.done / review.goal) * 100}%"></span>
					</div>
					<p class="meta"><span class="tn">{review.done}/{review.goal}</span> Tagesziel</p>
					<button class="primary">Start <kbd>↵</kbd></button>
				</section>
				<section class="panel mini">
					<Flame size={16} strokeWidth={1.75} />
					<p class="n tn">{review.streak}</p>
					<p class="meta">Tage am Stück</p>
				</section>
			</div>

			<section class="panel">
				<h2>Karteikarten</h2>
				<ul class="rows">
					{#each decks as d (d.name)}
						<li>
							<span class="mark" style:background={color[d.subject]}></span>
							<span class="t">{d.name}</span>
							<span class="meta tn">{d.due}/{d.cards}</span>
							<ChevronRight size={16} strokeWidth={1.75} />
						</li>
					{/each}
				</ul>
				<button class="ghost wide"><ScanLine size={16} strokeWidth={1.75} /> Neue Seite scannen</button>
			</section>

			<section class="panel">
				<h2>Prüfungen</h2>
				<table>
					<tbody>
						{#each exams as e (e.date)}
							<tr>
								<td class="tn d">{e.date.slice(4)}</td>
								<td><span class="mark" style:background={color[e.subject]}></span>{subjects[e.subject].short} · {e.title}</td>
								<td class="tn r">in {e.days} Tagen</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="notice">
				<CircleAlert size={16} strokeWidth={1.75} />
				<span><b>{subjects[gradePrompt.subject].name}</b>, {gradePrompt.title} ({gradePrompt.date}) – Note eintragen?</span>
				<button class="ghost">Eintragen</button>
			</div>
			</section>

			<section class="panel">
				<h2>Noten <span class="avg tn">Ø {fmt(overall)}</span></h2>
				<table>
					<tbody>
						{#each averages as a (a.subject)}
							<tr>
								<td><span class="mark" style:background={color[a.subject]}></span>{subjects[a.subject].name}</td>
								<td class="tn meta r">{a.grades.join(' ') || ''}</td>
								<td class="tn r strong">{fmt(a.avg)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		</div>
	{/snippet}

	{#snippet quiz()}
		<div class="tool qz">
			<header class="qbar">
				<button class="icon" aria-label="Abfrage beenden"><X size={18} strokeWidth={1.75} /></button>
				<span class="t">{q.deck}</span>
				<span class="tn meta">{q.position}/{q.total}</span>
			</header>
			<div class="segs" aria-hidden="true">
				{#each segs as s, i (i)}<span class={s}></span>{/each}
			</div>
			<div class="modes" role="group" aria-label="Modus">
				<button aria-pressed="true">Umdrehen</button><button aria-pressed="false">Eintippen</button><button aria-pressed="false">Auswahl</button>
			</div>

			<button class="qcard" onclick={() => (flipped = !flipped)}>
				{#key flipped}<span class="flip">
				<span class="row1"><span><span class="mark" style:background={color.latein}></span>Latein → Deutsch</span><span class="tn">Box {q.box}</span></span>
				<span class="term">{q.front}</span>
				{#if flipped}
					<dl>
						<dt>Formen</dt><dd>{q.forms}</dd>
						<dt>Bedeutung</dt><dd class="strong">{q.meaning}</dd>
					</dl>
				{:else}
					<span class="hint">Umdrehen <kbd>Leertaste</kbd></span>
				{/if}
				</span>{/key}
			</button>

			<div class="answers">
				<button class="ghost big" disabled={!flipped}><kbd>1</kbd> Nicht gewusst</button>
				<button class="primary big" disabled={!flipped}><kbd>2</kbd> Gewusst</button>
			</div>
			<p class="meta center">9 richtig · 3 falsch in dieser Runde</p>
		</div>
	{/snippet}
</Frame>

<style>
	.tool {
		--bg: #f3f4f6;
		--surface: #ffffff;
		--text: #16181d;
		--muted: #5f6672;
		--border: #e1e4e8;
		--accent: #c2410c;
		--focus: #16181d;
		box-sizing: border-box;
		min-height: 100%;
		background: var(--bg);
		color: var(--text);
		font: 14px/1.45 'Geist Variable', sans-serif;
		padding: 16px 12px 32px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.tn {
		font-variant-numeric: tabular-nums;
	}
	h1 {
		font-size: 22px;
		font-weight: 650;
		letter-spacing: -0.02em;
		margin: 0;
	}
	.sub {
		margin: 2px 0 6px;
		color: var(--muted);
		font-size: 13px;
	}
	.bar {
		padding: 4px 4px 0;
	}
	h2 {
		font-size: 13px;
		font-weight: 600;
		margin: 0 0 6px;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.count {
		font-weight: 500;
		color: var(--muted);
	}
	.avg {
		margin-left: auto;
		font-size: 13px;
	}
	.panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px 12px;
	}
	.notice {
		margin-top: 8px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 6px 6px 12px;
		border-radius: 8px;
		background: #fff4ed;
		border: 1px solid #fbd5bf;
		font-size: 13px;
	}
	.notice span {
		flex: 1;
	}
	.rows {
		list-style: none;
		margin: 0 -12px;
		padding: 0;
	}
	.rows li {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 40px;
		padding: 0 12px;
		border-top: 1px solid var(--border);
	}
	.rows .t {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	li.done .t {
		color: var(--muted);
		text-decoration: line-through;
	}
	.mark {
		display: inline-block;
		width: 3px;
		height: 14px;
		border-radius: 1px;
		flex: none;
		margin-right: 6px;
		vertical-align: -2px;
	}
	.rows .mark {
		margin-right: 0;
	}
	.meta {
		color: var(--muted);
		font-size: 12.5px;
		margin: 0;
	}
	.late {
		color: var(--accent);
	}
	.check {
		width: 18px;
		height: 18px;
		border: 1.5px solid #9aa1ab;
		border-radius: 4px;
		background: var(--surface);
		display: grid;
		place-items: center;
		padding: 0;
		color: #fff;
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s;
	}
	.check[aria-pressed='true'] {
		background: var(--text);
		border-color: var(--text);
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 96px;
		gap: 8px;
	}
	.kpi {
		margin: 0 0 10px;
		color: var(--muted);
	}
	.kpi .n {
		display: block;
		font-size: 44px;
		line-height: 1;
		font-weight: 650;
		letter-spacing: -0.04em;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}
	.meter {
		height: 4px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 4px;
	}
	.meter span {
		display: block;
		height: 100%;
		background: var(--text);
	}
	.mini {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		color: var(--muted);
	}
	.mini .n {
		font-size: 28px;
		font-weight: 650;
		color: var(--text);
		margin: 4px 0 0;
		line-height: 1;
	}
	button {
		font: inherit;
		cursor: pointer;
	}
	.primary,
	.ghost {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 36px;
		padding: 0 12px;
		border-radius: 6px;
		font-weight: 600;
	}
	.primary {
		background: var(--accent);
		color: #fff;
		border: 0;
		width: 100%;
		margin-top: 10px;
	}
	.ghost {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
	}
	.wide {
		width: 100%;
		margin-top: 8px;
	}
	kbd {
		font: 500 11px 'Geist Variable', sans-serif;
		padding: 1px 5px;
		border-radius: 4px;
		border: 1px solid currentColor;
		opacity: 0.75;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	td {
		padding: 8px 0;
		border-top: 1px solid var(--border);
		white-space: nowrap;
	}
	td.d {
		width: 52px;
		color: var(--muted);
	}
	.r {
		text-align: right;
		padding-left: 8px;
	}
	.strong {
		font-weight: 650;
	}
	/* Abfrage */
	.qz {
		gap: 12px;
	}
	.qbar {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.qbar .t {
		flex: 1;
		font-weight: 600;
	}
	.icon {
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
	}
	.segs {
		display: grid;
		grid-template-columns: repeat(30, 1fr);
		gap: 2px;
	}
	.segs span {
		height: 4px;
		border-radius: 1px;
		background: var(--border);
	}
	.segs .ok {
		background: var(--text);
	}
	.segs .bad {
		background: #9aa1ab;
	}
	.segs .cur {
		background: var(--accent);
	}
	.modes {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		background: #e7e9ec;
		padding: 2px;
		border-radius: 7px;
	}
	.modes button {
		border: 0;
		background: transparent;
		padding: 6px;
		border-radius: 5px;
		color: var(--muted);
		font-weight: 500;
	}
	.modes button[aria-pressed='true'] {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 0 0 1px var(--border);
	}
	.qcard {
		flex: 1;
		min-height: 360px;
		display: flex;
		flex-direction: column;
		text-align: left;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 14px 16px;
		color: var(--text);
	}
	.flip {
		flex: 1;
		display: flex;
		flex-direction: column;
		animation: flip 0.22s cubic-bezier(0.3, 0.7, 0.2, 1);
		transform-origin: center;
	}
	@keyframes flip {
		from {
			transform: perspective(900px) rotateX(-70deg);
			opacity: 0.3;
		}
	}
	.row1 {
		display: flex;
		justify-content: space-between;
		color: var(--muted);
		font-size: 12.5px;
	}
	.term {
		font-size: 40px;
		font-weight: 650;
		letter-spacing: -0.03em;
		margin: auto 0 16px;
	}
	.hint {
		color: var(--muted);
		margin-bottom: auto;
		display: inline-flex;
		gap: 8px;
		align-items: center;
	}
	dl {
		display: grid;
		grid-template-columns: 84px 1fr;
		gap: 8px 12px;
		margin: 0 0 auto;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		animation: show 0.18s ease-out;
	}
	dt {
		color: var(--muted);
		font-size: 12.5px;
		padding-top: 3px;
	}
	dd {
		margin: 0;
		font-size: 17px;
	}
	@keyframes show {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}
	.answers {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.big {
		min-height: 48px;
		margin: 0;
	}
	.big:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.center {
		text-align: center;
	}
	@media (prefers-reduced-motion: reduce) {
		dl,
		.flip {
			animation: none;
		}
		.check {
			transition: none;
		}
	}
</style>

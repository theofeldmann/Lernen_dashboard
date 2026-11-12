<script lang="ts">
	import '@fontsource-variable/source-serif-4';
	import '@fontsource/ibm-plex-sans/400.css';
	import '@fontsource/ibm-plex-sans/500.css';
	import '@fontsource/ibm-plex-sans/600.css';
	import { Check, RotateCcw, ScanLine, ChevronRight, X } from '@lucide/svelte';
	import Frame from '../Frame.svelte';
	import { subjects, today, homework, review, decks, exams, averages, overall, fmt, quiz as q, gradePrompt, type SubjectKey } from '../data';

	const color: Record<SubjectKey, string> = {
		mathe: '#1f6f8b', deutsch: '#a23b2a', englisch: '#2f5d9e', latein: '#6e4a86', physik: '#276b4e',
		chemie: '#8a5512', geo: '#58742c', wr: '#86553a', religion: '#5f5f86', pug: '#99385f'
	};
	let done = $state<boolean[]>(homework.map(() => false));
	let flipped = $state(false);
</script>

<svelte:head><title>Richtung A – Schulheft</title></svelte:head>

<Frame letter="a" title="Schulheft">
	{#snippet about()}
		<p><strong>Schrift:</strong> Source Serif 4 für Überschriften und große Zahlen, IBM Plex Sans für Text und Bedienung. Alle Zahlen sind tabellarisch gesetzt.</p>
		<p><strong>Farben:</strong> Kühles Heftpapier statt Creme, Tinte in Königsblau für Text und Aktionen und ein roter Heftrand als einziges Ornament. Die Fachfarben sind gedeckt wie Buntstifte.</p>
		<p><strong>Stimmung:</strong> Ein ordentlich geführtes Heft. Termine und Noten stehen im Rand, wie Anmerkungen der Lehrkraft. Die Karteikarte sieht aus wie eine echte DIN-A7-Karte mit rotem Kopfstrich. Ruhig, vertraut und ernsthaft.</p>
		<p><strong>Dunkelmodus:</strong> Tintenblaues Nachtpapier (#151c2c) mit hellgrauen Linien. Der Heftrand bleibt rot, aber gedämpft. Die Fachfarben werden aufgehellt, damit sie auf dem dunklen Grund AA-Kontrast halten.</p>
	{/snippet}

	{#snippet dashboard()}
		<div class="heft">
			<header class="top">
				<p class="margin-note">{today.short}</p>
				<h1>{today.weekday},<br />{today.date}</h1>
			</header>

			
			<section>
				<h2>Heute</h2>
				<ul class="lines">
					{#each homework as hw, i (hw.title)}
						<li class:done={done[i]}>
							<span class="margin-note" class:overdue={hw.overdue}>{hw.overdue ? 'gestern' : 'heute'}</span>
							<button class="check" aria-pressed={done[i]} aria-label="{hw.title} erledigt" onclick={() => (done[i] = !done[i])}>
								{#if done[i]}<Check size={14} strokeWidth={2} />{/if}
							</button>
							<span class="txt"><span class="subj" style:color={color[hw.subject]}>{subjects[hw.subject].short}</span> {hw.title}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="review">
				<h2>Wiederholen</h2>
				<p class="big">Heute fällig: <span class="num">{review.due}</span> Karten</p>
				<div class="ink" role="progressbar" aria-valuenow={review.done} aria-valuemax={review.goal} aria-label="Tagesziel">
					<span style:width="{(review.done / review.goal) * 100}%"></span>
				</div>
				<p class="small"><span class="num">{review.done} von {review.goal}</span> fürs Tagesziel · seit {review.streak} Tagen dran</p>
				<button class="primary">Wiederholen starten</button>
			</section>

			<section>
				<h2>Karteikarten</h2>
				{#each decks as d (d.name)}
					<a class="deck" href="#top">
						<span class="dot" style:background={color[d.subject]}></span>
						<span class="txt">{d.name}<small><span class="num">{d.cards}</span> Karten, zuletzt {d.lastUsed.toLowerCase()}</small></span>
						<ChevronRight size={18} strokeWidth={1.5} />
					</a>
				{/each}
				<button class="secondary"><ScanLine size={18} strokeWidth={1.5} /> Neue Seite scannen</button>
			</section>

			<section>
				<h2>Nächste Prüfungen</h2>
				<div class="next">
					<p class="nextdays">Noch <span class="num">{exams[0].days}</span> Tage</p>
					<p><span class="subj" style:color={color[exams[0].subject]}>{subjects[exams[0].subject].name}</span>, {exams[0].title}<small class="num">{exams[0].date}, {exams[0].time} Uhr</small></p>
				</div>
				<ul class="lines">
					{#each exams.slice(1) as e (e.date)}
						<li>
							<span class="margin-note num">{e.date.slice(4)}</span>
							<span class="txt"><span class="subj" style:color={color[e.subject]}>{subjects[e.subject].name}</span> {e.title}{#if e.time}<small class="num">{e.time} Uhr</small>{/if}</span>
							<span class="days num">noch {e.days} Tage</span>
						</li>
					{/each}
				</ul>
				<aside class="prompt">
					<p><span class="dot" style:background={color[gradePrompt.subject]}></span>{subjects[gradePrompt.subject].name}, {gradePrompt.title} vom {gradePrompt.date} ist vorbei.</p>
					<div class="row"><button class="link">Note eintragen</button><button class="link quiet">Später</button></div>
				</aside>
			</section>

			<section>
				<h2>Noten</h2>
				<ul class="lines grades">
					{#each averages as a (a.subject)}
						<li>
							<span class="margin-note grade num">{fmt(a.avg)}</span>
							<span class="txt"><span class="dot" style:background={color[a.subject]}></span>{subjects[a.subject].name}</span>
							<span class="singles num">{a.grades.join('  ') || 'noch keine Note'}</span>
						</li>
					{/each}
				</ul>
				<p class="overall">Gesamtschnitt <span class="num">{fmt(overall)}</span></p>
			</section>
		</div>
	{/snippet}

	{#snippet quiz()}
		<div class="heft quizscreen">
			<header class="qtop">
				<button class="icon" aria-label="Abfrage beenden"><X size={20} strokeWidth={1.5} /></button>
				<span class="qdeck">{q.deck}</span>
				<span class="num">{q.position}/{q.total}</span>
			</header>
			<div class="ink thin"><span style:width="{(q.position / q.total) * 100}%"></span></div>

			<button class="card" class:flipped onclick={() => (flipped = !flipped)}>
				<span class="face front" aria-hidden={flipped}>
					<span class="cardhead"><span>Latein</span><span>Box {q.box}</span></span>
					<span class="term">{q.front}</span>
					<span class="tap">Tippen zum Umdrehen</span>
				</span>
				<span class="face back" aria-hidden={!flipped}>
					<span class="cardhead"><span>Latein</span><span>Box {q.box}</span></span>
					<span class="term termsm">{q.front}</span>
					<span class="forms">{q.forms}</span>
					<span class="meaning">{q.meaning}</span>
				</span>
			</button>

			<div class="answer" class:show={flipped}>
				<button class="no" disabled={!flipped}><RotateCcw size={18} strokeWidth={1.5} /> Nicht gewusst</button>
				<button class="yes" disabled={!flipped}><Check size={18} strokeWidth={1.5} /> Gewusst</button>
			</div>
			<p class="keys">Leertaste: umdrehen · 1 / 2: bewerten · oder wischen</p>
		</div>
	{/snippet}
</Frame>

<style>
	.heft {
		--paper: #f1f3f1;
		--ink: #1f2b44;
		--muted: #5b6475;
		--line: #c9d4de;
		--rand: #cf4438;
		--blue: #2a4ba0;
		--margin: 60px;
		--focus: var(--ink);
		box-sizing: border-box;
		min-height: 100%;
		background:
			linear-gradient(to right, transparent calc(var(--margin) - 1px), var(--rand) calc(var(--margin) - 1px), var(--rand) var(--margin), transparent var(--margin)),
			var(--paper);
		color: var(--ink);
		font: 15px/1.5 'IBM Plex Sans', sans-serif;
		padding: 28px 20px 40px calc(var(--margin) + 16px);
		font-variant-numeric: tabular-nums;
	}
	.num {
		font-variant-numeric: tabular-nums lining-nums;
	}
	h1 {
		font: 600 34px/1.08 'Source Serif 4 Variable', serif;
		font-variation-settings: 'opsz' 60;
		letter-spacing: -0.01em;
		margin: 0;
	}
	h2 {
		font: 600 20px/1.2 'Source Serif 4 Variable', serif;
		margin: 0 0 6px;
	}
	.top {
		position: relative;
		margin-bottom: 24px;
	}
	.margin-note {
		position: absolute;
		left: calc(-1 * var(--margin) - 12px);
		width: calc(var(--margin) - 12px);
		text-align: right;
		font-size: 12px;
		color: var(--muted);
	}
	.top .margin-note {
		top: 8px;
	}
	section {
		margin-top: 28px;
	}
	.lines {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.lines li {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 10px;
		min-height: 44px;
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	.lines li .margin-note {
		top: 12px;
	}
	.overdue {
		color: #b0362b;
	}
	.txt {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.lines .txt {
		display: block;
	}
	.txt small,
	.deck small {
		display: block;
		color: var(--muted);
		font-size: 13px;
	}
	.subj {
		font-weight: 600;
	}
	.check {
		width: 20px;
		height: 20px;
		flex: none;
		border: 1.5px solid var(--ink);
		border-radius: 3px;
		background: transparent;
		color: var(--blue);
		display: grid;
		place-items: center;
		padding: 0;
		align-self: center;
		cursor: pointer;
		transition: background 0.15s;
	}
	li.done .txt {
		color: var(--muted);
		text-decoration: line-through;
		text-decoration-color: var(--blue);
	}
	.prompt {
		border-left: 3px solid var(--blue);
		padding: 2px 0 2px 12px;
		margin-top: 16px;
	}
	.next {
		padding: 4px 0 12px;
		border-bottom: 1px solid var(--line);
	}
	.next p {
		margin: 0;
	}
	.next small {
		display: block;
		color: var(--muted);
		font-size: 13px;
	}
	.nextdays {
		font: 600 40px/1.05 'Source Serif 4 Variable', serif;
		margin-bottom: 4px !important;
	}
	.prompt p {
		margin: 0;
	}
	.row {
		display: flex;
		gap: 16px;
		margin-top: 4px;
	}
	.link {
		background: none;
		border: 0;
		padding: 6px 0;
		font: 600 15px 'IBM Plex Sans', sans-serif;
		color: var(--blue);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
	.link.quiet {
		color: var(--muted);
		font-weight: 400;
	}
	.dot {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		margin-right: 8px;
		flex: none;
	}
	.review .big {
		font: 500 28px/1.15 'Source Serif 4 Variable', serif;
		margin: 4px 0 14px;
	}
	.review .big .num {
		font-weight: 700;
		color: var(--blue);
	}
	.ink {
		height: 6px;
		background: var(--line);
		border-radius: 3px;
		overflow: hidden;
	}
	.ink span {
		display: block;
		height: 100%;
		background: var(--blue);
		transition: width 0.4s ease;
	}
	.ink.thin {
		height: 3px;
	}
	.small {
		font-size: 13px;
		color: var(--muted);
		margin: 6px 0 14px;
	}
	.primary,
	.secondary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 18px;
		border-radius: 6px;
		font: 600 15px 'IBM Plex Sans', sans-serif;
		cursor: pointer;
	}
	.primary {
		background: var(--blue);
		color: #fff;
		border: 0;
		width: 100%;
		justify-content: center;
	}
	.secondary {
		background: transparent;
		color: var(--ink);
		border: 1.5px solid var(--ink);
		margin-top: 10px;
	}
	.deck {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
		color: inherit;
		text-decoration: none;
	}
	.days {
		font-size: 13px;
		color: var(--muted);
		white-space: nowrap;
	}
	.grades .grade {
		font: 600 17px 'Source Serif 4 Variable', serif;
		color: var(--ink);
		top: 9px;
	}
	.singles {
		font-size: 13px;
		color: var(--muted);
		white-space: pre;
	}
	.overall {
		font: 600 18px 'Source Serif 4 Variable', serif;
		margin: 12px 0 0;
	}
	/* Abfrage */
	.quizscreen {
		display: flex;
		flex-direction: column;
		background: var(--paper);
		padding: 20px;
		min-height: 100%;
	}
	.qtop {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
		font-size: 14px;
	}
	.qdeck {
		flex: 1;
		font-weight: 500;
	}
	.icon {
		width: 44px;
		height: 44px;
		margin-left: -12px;
		display: grid;
		place-items: center;
		background: none;
		border: 0;
		color: var(--ink);
		cursor: pointer;
	}
	.card {
		margin: auto 0 24px;
		aspect-ratio: 74 / 90;
				border: 0;
		padding: 0;
		background: none;
		position: relative;
		cursor: pointer;
		font: inherit;
		color: inherit;
		transform-style: preserve-3d;
		transition: transform 0.45s cubic-bezier(0.3, 0.7, 0.2, 1);
	}
	.card.flipped {
		transform: perspective(1200px) rotateY(180deg);
	}
	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		background:
			repeating-linear-gradient(to bottom, transparent 0 27px, #cfdbe6 27px 28px) 0 50px / 100% calc(100% - 50px) no-repeat,
			#fff;
		border-radius: 3px;
		box-shadow: 0 1px 2px rgba(31, 43, 68, 0.18), 0 8px 24px -12px rgba(31, 43, 68, 0.35);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 0 18px 14px;
		text-align: left;
	}
	.back {
		transform: rotateY(180deg);
	}
	.face > span:not(.cardhead) {
		display: block;
	}
	.cardhead {
		box-sizing: border-box;
		align-self: stretch;
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--muted);
		height: 50px;
		align-items: flex-end;
		padding-bottom: 8px;
		border-bottom: 2px solid var(--rand);
		margin-bottom: 30px;
	}
	.term {
		font: 600 44px/44px 'Source Serif 4 Variable', serif;
		margin-top: 12px;
		font-variation-settings: 'opsz' 60;
	}
	.term.termsm {
		font-size: 22px;
		line-height: 28px;
		height: 28px;
		margin-top: 0;
		color: var(--muted);
		font-weight: 500;
	}
	.forms {
		font: italic 400 21px/28px 'Source Serif 4 Variable', serif;
	}
	.meaning {
		font: 600 23px/28px 'IBM Plex Sans', sans-serif;
		margin-top: 28px;
		color: var(--blue);
	}
	.tap {
		margin-top: auto;
		font-size: 13px;
		color: var(--muted);
	}
	.answer {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		opacity: 0.35;
		transition: opacity 0.2s;
	}
	.answer.show {
		opacity: 1;
	}
	.answer button {
		min-height: 52px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border-radius: 6px;
		font: 600 15px 'IBM Plex Sans', sans-serif;
		cursor: pointer;
	}
	.no {
		background: transparent;
		border: 1.5px solid var(--ink);
		color: var(--ink);
	}
	.yes {
		background: var(--blue);
		border: 0;
		color: #fff;
	}
	.answer {
		margin-bottom: auto;
	}
	.keys {
		padding-top: 24px;
		font-size: 12px;
		color: var(--muted);
		text-align: center;
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		.ink span,
		.answer {
			transition: none;
		}
	}
</style>

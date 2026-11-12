<script lang="ts">
	import '@fontsource-variable/literata';
	import { Check, ScanLine, X, ChevronRight, Moon } from '@lucide/svelte';
	import Frame from '../Frame.svelte';
	import { subjects, today, homework, review, decks, exams, averages, overall, fmt, quiz as q, gradePrompt, type SubjectKey } from '../data';

	const color: Record<SubjectKey, string> = {
		mathe: '#8fb3e8', deutsch: '#e8998f', englisch: '#7fc6c0', latein: '#d4b0e3', physik: '#9fd1a3',
		chemie: '#e8c07f', geo: '#c3d28a', wr: '#d6ab8c', religion: '#b9b4d6', pug: '#e8a3c1'
	};
	let done = $state<boolean[]>(homework.map(() => false));
	let typed = $state('amo, amavi, amatm');
	let checked = $state(false);
	const groups = Array.from({ length: review.goal / 5 }, (_, g) => Math.max(0, Math.min(5, review.done - g * 5)));
</script>

<svelte:head><title>Richtung D – Nachtlernen</title></svelte:head>

<Frame letter="d" title="Nachtlernen">
	{#snippet about()}
		<p><strong>Schrift:</strong> Nur Literata, eine Schrift fürs lange Lesen am Bildschirm. Sie wirkt abends weich und bleibt auch klein gut lesbar. Überschriften sind leicht und groß statt fett.</p>
		<p><strong>Farben:</strong> Warmes Dunkelbraun statt Schwarz, Text in gedämpftem Elfenbein, Akzent in Lampen-Bernstein. Die Fachfarben sind pastellig, damit nichts blendet. Die Kontraste sind bewusst weich, erfüllen aber WCAG AA.</p>
		<p><strong>Stimmung:</strong> Schreibtischlampe um 21 Uhr. Wenig Bewegung, nichts blinkt. Das Tagesziel ist eine Strichliste in Fünfergruppen wie auf dem Block. Hier zeige ich den Modus „Eintippen“, inklusive „Fast richtig“.</p>
	{/snippet}

	{#snippet dashboard()}
		<div class="night">
			<header>
				<p class="eyebrow"><Moon size={15} strokeWidth={1.5} /> {today.weekday}abend</p>
				<h1>Drei Aufgaben offen, dann noch 18 Karten bis zum Tagesziel.</h1>
			</header>

			<section>
				<h2>Heute</h2>
				<ul class="list">
					{#each homework as hw, i (hw.title)}
						<li class:done={done[i]}>
							<button class="tick" aria-pressed={done[i]} aria-label="{hw.title} erledigt" onclick={() => (done[i] = !done[i])}>
								{#if done[i]}<Check size={14} strokeWidth={2} />{/if}
							</button>
							<span class="tx">{hw.title}<small><span style:color={color[hw.subject]}>{subjects[hw.subject].name}</span> · {hw.overdue ? 'war gestern fällig' : 'heute'}</small></span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="lamp">
				<h2>Wiederholen</h2>
				<p class="lead">Heute fällig: <b>{review.due} Karten</b></p>
				<div class="tally" role="img" aria-label="{review.done} von {review.goal} Karten fürs Tagesziel">
					{#each groups as n, g (g)}
						<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true">
							{#each [0, 1, 2, 3] as k (k)}<line x1={6 + k * 8} y1="4" x2={6 + k * 8} y2="24" class:on={k < n} />{/each}
							<line x1="2" y1="22" x2="36" y2="6" class:on={n === 5} />
						</svg>
					{/each}
				</div>
				<p class="muted">{review.done} von {review.goal} fürs Tagesziel · {review.streak}. Lerntag in Folge</p>
				<button class="primary">Weiterlernen</button>
			</section>

			<section>
				<h2>Karteikarten</h2>
				{#each decks as d (d.name)}
					<a class="row" href="#top"><span class="pip" style:background={color[d.subject]}></span><span class="tx">{d.name}<small>{d.cards} Karten · zuletzt heute</small></span><ChevronRight size={18} strokeWidth={1.5} /></a>
				{/each}
				<button class="quiet"><ScanLine size={18} strokeWidth={1.5} /> Neue Seite scannen</button>
			</section>

			<section>
				<h2>Prüfungen</h2>
				{#each exams as e (e.date)}
					<div class="row exam">
						<span class="pip" style:background={color[e.subject]}></span>
						<span class="tx">{subjects[e.subject].name}, {e.title}<small>{e.date}{e.time ? `, ${e.time} Uhr` : ''}</small></span>
						<span class="days">Noch {e.days} Tage</span>
					</div>
				{/each}
				{#if exams[2].deck}<p class="tip">Für Latein am 25.11.: „{exams[2].deck}“ ist verknüpft.</p>{/if}
				<div class="ask"><span>{subjects[gradePrompt.subject].name}, {gradePrompt.title} ist vorbei.</span><button class="link">Note eintragen?</button></div>
			</section>

			<section>
				<h2>Noten</h2>
				<div class="grades">
					{#each averages as a (a.subject)}
						<div class="g"><span class="gv">{fmt(a.avg)}</span><span class="gn"><span class="pip" style:background={color[a.subject]}></span>{subjects[a.subject].short}</span></div>
					{/each}
				</div>
				<p class="muted">Gesamtschnitt <b class="num">{fmt(overall)}</b> aus 4 Fächern</p>
			</section>
		</div>
	{/snippet}

	{#snippet quiz()}
		<div class="night qz">
			<header class="qh">
				<button class="x" aria-label="Abfrage beenden"><X size={20} strokeWidth={1.5} /></button>
				<span class="muted">{q.deck} · Stammformen</span>
				<span class="num">{q.position} / {q.total}</span>
			</header>
			<div class="thin"><span style:width="{(q.position / q.total) * 100}%"></span></div>

			<div class="sheet">
				<p class="muted">Nenne die Stammformen</p>
				<p class="term">{q.front}</p>
				<label class="field">
					<span class="sr">Deine Antwort</span>
					<input bind:value={typed} autocomplete="off" autocapitalize="off" spellcheck="false" />
				</label>
				{#if checked}
					<div class="fb" role="status">
						<p class="verdict">Fast richtig</p>
						<p>Richtig ist: <b>{q.forms}</b></p>
						<p class="muted">Bedeutung: {q.meaning}</p>
					</div>
				{/if}
			</div>

			{#if checked}
				<div class="two">
					<button class="quiet">Doch richtig</button>
					<button class="primary">Weiter</button>
				</div>
			{:else}
				<button class="primary" onclick={() => (checked = true)}>Prüfen</button>
			{/if}
			<p class="muted center">Längenzeichen musst du nicht tippen.</p>
		</div>
	{/snippet}
</Frame>

<style>
	.night {
		--bg: #211b17;
		--surface: #2b241f;
		--line: #3d342d;
		--text: #eee4d5;
		--muted: #b3a693;
		--lamp: #e8b063;
		min-height: 100%;
		background: var(--bg);
		color: var(--text);
		font: 16px/1.55 'Literata Variable', serif;
		font-variant-numeric: tabular-nums lining-nums;
		padding: 28px 20px 40px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
	.num {
		font-variant-numeric: tabular-nums lining-nums;
	}
	button {
		font: inherit;
		cursor: pointer;
	}
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--lamp);
		margin: 0 0 8px;
		font-size: 15px;
	}
	h1 {
		font-size: 30px;
		line-height: 1.2;
		font-weight: 350;
		letter-spacing: -0.01em;
		margin: 0;
	}
	h2 {
		font-size: 15px;
		font-weight: 600;
		color: var(--muted);
		margin: 0 0 8px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.list li {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	.tick {
		width: 24px;
		height: 24px;
		margin-top: 2px;
		border-radius: 50%;
		border: 1.5px solid var(--muted);
		background: transparent;
		color: var(--bg);
		display: grid;
		place-items: center;
		padding: 0;
		flex: none;
		transition: background 0.2s, border-color 0.2s;
	}
	.tick[aria-pressed='true'] {
		background: var(--lamp);
		border-color: var(--lamp);
	}
	li.done .tx {
		color: var(--muted);
		text-decoration: line-through;
	}
	.tx {
		flex: 1;
	}
	.tx small {
		display: block;
		font-size: 14px;
		color: var(--muted);
	}
	.lamp {
		background: var(--surface);
		border-radius: 20px;
		padding: 18px;
		margin: 0 -6px;
	}
	.lead {
		font-size: 24px;
		font-weight: 350;
		margin: 0 0 12px;
	}
	.lead b {
		font-weight: 600;
		color: var(--lamp);
	}
	.tally {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}
	.tally line {
		stroke: var(--line);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.tally line.on {
		stroke: var(--lamp);
	}
	.muted {
		color: var(--muted);
		font-size: 14px;
		margin: 0;
	}
	.primary {
		min-height: 50px;
		width: 100%;
		border: 0;
		border-radius: 14px;
		background: var(--lamp);
		color: #2a1c0c;
		font-weight: 600;
		font-size: 17px;
		margin-top: 16px;
	}
	.quiet {
		min-height: 48px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: transparent;
		border: 1px solid var(--line);
		border-radius: 14px;
		color: var(--text);
		margin-top: 10px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
		color: inherit;
		text-decoration: none;
	}
	.pip {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex: none;
	}
	.days {
		font-size: 14px;
		color: var(--lamp);
		white-space: nowrap;
	}
	.tip {
		font-size: 14px;
		font-style: italic;
		color: var(--muted);
		margin: 10px 0 0;
	}
	.ask {
		margin-top: 14px;
		padding: 12px 14px;
		border-radius: 14px;
		border: 1px dashed var(--line);
		font-size: 15px;
	}
	.link {
		display: block;
		background: none;
		border: 0;
		padding: 4px 0 0;
		color: var(--lamp);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.grades {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px 8px;
		margin-bottom: 14px;
	}
	.g {
		display: flex;
		flex-direction: column;
	}
	.gv {
		font-size: 30px;
		font-weight: 350;
		line-height: 1.1;
	}
	.gn {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		color: var(--muted);
	}
	/* Abfrage */
	.qz {
		gap: 18px;
	}
	.qh {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.qh .muted {
		flex: 1;
	}
	.x {
		width: 44px;
		height: 44px;
		margin-left: -10px;
		display: grid;
		place-items: center;
		background: none;
		border: 0;
		color: var(--text);
	}
	.thin {
		height: 2px;
		background: var(--line);
	}
	.thin span {
		display: block;
		height: 100%;
		background: var(--lamp);
	}
	.sheet {
		margin-top: 48px;
	}
	.term {
		font-size: 52px;
		font-weight: 350;
		line-height: 1.1;
		margin: 4px 0 28px;
	}
	.field input {
		width: 100%;
		box-sizing: border-box;
		font: 22px 'Literata Variable', serif;
		color: var(--text);
		background: transparent;
		border: 0;
		border-bottom: 1.5px solid var(--muted);
		padding: 8px 0;
		outline: none;
	}
	.field input:focus-visible {
		border-bottom-color: var(--lamp);
		box-shadow: 0 2px 0 var(--lamp);
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	.fb {
		margin-top: 20px;
		padding: 14px 16px;
		border-radius: 14px;
		background: var(--surface);
		border-left: 3px solid var(--lamp);
		animation: fade 0.25s ease-out;
	}
	.fb p {
		margin: 0 0 4px;
	}
	.verdict {
		color: var(--lamp);
		font-weight: 600;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: auto;
	}
	.two button {
		margin-top: 0;
	}
	.qz > .primary {
		margin-top: auto;
	}
	.center {
		text-align: center;
	}
	@media (prefers-reduced-motion: reduce) {
		.fb {
			animation: none;
		}
		.tick {
			transition: none;
		}
	}
</style>

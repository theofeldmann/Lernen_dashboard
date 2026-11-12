<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import { Check, ScanLine, X, ArrowRight, Undo2 } from '@lucide/svelte';
	import Frame from '../Frame.svelte';
	import {
		subjects,
		homework,
		review,
		decks,
		exams,
		averages,
		overall,
		fmt,
		quiz as q,
		gradePrompt,
		type SubjectKey
	} from '../data';

	// [Fläche, Text darauf]
	const c: Record<SubjectKey, [string, string]> = {
		mathe: ['#2f5bff', '#ffffff'],
		deutsch: ['#ff5a36', '#1b1b1b'],
		englisch: ['#00a3a3', '#1b1b1b'],
		latein: ['#ffc533', '#1b1b1b'],
		physik: ['#1fb26b', '#1b1b1b'],
		chemie: ['#ff8f3d', '#1b1b1b'],
		geo: ['#9ccc4a', '#1b1b1b'],
		wr: ['#7b4ff0', '#ffffff'],
		religion: ['#c9a77c', '#1b1b1b'],
		pug: ['#ff74ad', '#1b1b1b']
	};
	let done = $state<boolean[]>(homework.map(() => false));
	let flipped = $state(false);
	const max = 6;
</script>

<svelte:head><title>Richtung C – Farbig und mutig</title></svelte:head>

<Frame letter="c" title="Farbig und mutig">
	{#snippet about()}
		<p>
			<strong>Schrift:</strong> Bricolage Grotesque in vielen Schnitten: extrafett und schmal für große
			Zahlen und Überschriften, normal für Text. Die Typo selbst ist die Grafik.
		</p>
		<p>
			<strong>Farben:</strong> Weiß und fast Schwarz als Bühne, darauf große, flache Flächen in den Fachfarben.
			Latein ist Gelb, Mathe Blau, Deutsch Orangerot. Keine Verläufe und keine Schatten, Schrift auf Farbe
			ist immer kontrastgeprüft.
		</p>
		<p>
			<strong>Stimmung:</strong> Selbstbewusst und ein bisschen verspielt, wie ein gut gestaltetes Schulbuch-Cover.
			Was ansteht, nimmt Fläche ein. Beim Abfragen färbt sich der ganze Bildschirm in der Fachfarbe.
		</p>
		<p>
			<strong>Dunkelmodus:</strong> Fast schwarze Bühne (#161616). Die Fachflächen bleiben kräftig, werden
			aber eine Spur dunkler. Schrift darauf wird je nach Fläche hell oder dunkel gesetzt, damit der Kontrast
			stimmt.
		</p>
	{/snippet}

	{#snippet dashboard()}
		<div class="bold">
			<header class="hd">
				<p class="day">Do</p>
				<p class="date">12.11.</p>
			</header>

			<section class="hw">
				<h2>Heute</h2>
				{#each homework as hw, i (hw.title)}
					<button
						class="task"
						class:done={done[i]}
						style:--s={c[hw.subject][0]}
						aria-pressed={done[i]}
						onclick={() => (done[i] = !done[i])}
					>
						<span class="box"
							>{#if done[i]}<Check size={16} strokeWidth={3} />{/if}</span
						>
						<span class="tt"
							>{hw.title}<small
								>{subjects[hw.subject].name} · {hw.overdue ? 'seit gestern offen' : 'heute'}</small
							></span
						>
					</button>
				{/each}
			</section>

			<section class="slab" style:background={c.latein[0]} style:color={c.latein[1]}>
				<p class="lbl">Heute fällig</p>
				<p class="mega">{review.due}<span>Karten</span></p>
				<div
					class="dots"
					role="progressbar"
					aria-valuenow={review.done}
					aria-valuemax={review.goal}
					aria-label="Tagesziel"
				>
					{#each Array.from({ length: review.goal }, (_, i) => i) as i (i)}<span
							class:on={i < review.done}
						></span>{/each}
				</div>
				<p class="lbl">{review.done} von {review.goal} geschafft · {review.streak} Tage in Folge</p>
				<button class="go">Los geht’s <ArrowRight size={20} strokeWidth={2.5} /></button>
			</section>

			<section>
				<h2>Karteikarten</h2>
				{#each decks as d (d.name)}
					<a class="deck" href="#top" style:--s={c[d.subject][0]}>
						<span class="dname">{d.name}</span>
						<span class="dn">{d.cards}</span>
					</a>
				{/each}
				<button class="scan"><ScanLine size={20} strokeWidth={2.25} /> Neue Seite scannen</button>
			</section>

			<section>
				<h2>Prüfungen</h2>
				<div class="exams">
					{#each exams as e (e.date)}
						<article class="exam" style:background={c[e.subject][0]} style:color={c[e.subject][1]}>
							<p class="big">{e.days}<span>Tage</span></p>
							<p class="et">{subjects[e.subject].name}<br />{e.title}</p>
							<p class="ed">{e.date}{e.time ? `, ${e.time}` : ''}</p>
						</article>
					{/each}
				</div>
			</section>

			<section class="prompt" style:--s={c[gradePrompt.subject][0]}>
				<p>Wie lief die {gradePrompt.title} in <b>Mathe</b>?</p>
				<button>Note eintragen</button>
			</section>

			<section>
				<h2>Noten <span class="ov">Ø {fmt(overall)}</span></h2>
				{#each averages as a (a.subject)}
					<div class="gr">
						<span class="gname"
							>{a.subject === 'pug' ? subjects.pug.short : subjects[a.subject].name}</span
						>
						<span class="track">
							{#if a.avg !== null}<span
									style:width="{((max - a.avg) / 5) * 100}%"
									style:background={c[a.subject][0]}
								></span>{/if}
						</span>
						<span class="gv">{fmt(a.avg)}</span>
					</div>
				{/each}
				<p class="foot">Längerer Balken = bessere Note</p>
			</section>
		</div>
	{/snippet}

	{#snippet quiz()}
		<div class="bold qz" style:background={c.latein[0]} style:color={c.latein[1]}>
			<header class="qh">
				<button class="x" aria-label="Abfrage beenden"><X size={22} strokeWidth={2.5} /></button>
				<span class="qn">{q.position}<span>/{q.total}</span></span>
			</header>
			<button class="card" class:flipped onclick={() => (flipped = !flipped)}>
				<span class="side front" aria-hidden={flipped}>
					<span class="ct">Was heißt</span>
					<span class="word">{q.front}</span>
					<span class="ct small">Tippen zum Umdrehen</span>
				</span>
				<span class="side back" aria-hidden={!flipped}>
					<span class="ct">{q.front}</span>
					<span class="word sm">{q.meaning}</span>
					<span class="forms">{q.forms}</span>
				</span>
			</button>
			<div class="ans">
				<button class="nope" disabled={!flipped}
					><Undo2 size={20} strokeWidth={2.5} /> Nicht gewusst</button
				>
				<button class="yep" disabled={!flipped}><Check size={22} strokeWidth={3} /> Gewusst</button>
			</div>
			<p class="swipe">Wischen: links nicht gewusst, rechts gewusst</p>
		</div>
	{/snippet}
</Frame>

<style>
	.bold {
		--ink: #1b1b1b;
		--paper: #ffffff;
		--soft: #f1f1ee;
		--focus: #1b1b1b;
		box-sizing: border-box;
		min-height: 100%;
		background: var(--paper);
		color: var(--ink);
		font:
			16px/1.4 'Bricolage Grotesque Variable',
			sans-serif;
		font-variant-numeric: tabular-nums;
		padding: 20px 16px 40px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}
	button {
		font: inherit;
		cursor: pointer;
	}
	h2 {
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0 0 10px;
		display: flex;
		align-items: baseline;
	}
	.hd {
		display: flex;
		align-items: baseline;
		gap: 10px;
		font-weight: 800;
		font-stretch: 75%;
		line-height: 0.85;
		letter-spacing: -0.04em;
	}
	.day {
		font-size: 96px;
		margin: 0;
	}
	.date {
		font-size: 40px;
		margin: 0;
		color: #6b6b66;
	}
	.task {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		text-align: left;
		border: 0;
		background: var(--soft);
		border-left: 10px solid var(--s);
		padding: 12px 14px;
		margin-bottom: 6px;
		border-radius: 4px 14px 14px 4px;
		color: var(--ink);
		transition: transform 0.12s;
	}
	.task:active {
		transform: scale(0.98);
	}
	.box {
		width: 26px;
		height: 26px;
		border: 2.5px solid var(--ink);
		border-radius: 8px;
		display: grid;
		place-items: center;
		flex: none;
	}
	.task.done .box {
		background: var(--ink);
		color: #fff;
	}
	.task.done .tt {
		text-decoration: line-through;
		color: #55554f;
	}
	.tt {
		font-weight: 600;
	}
	.tt small {
		display: block;
		font-weight: 400;
		font-size: 14px;
		color: #55554f;
	}
	.slab {
		border-radius: 28px;
		padding: 20px 20px 18px;
		margin: 0 -4px;
	}
	.lbl {
		margin: 0;
		font-weight: 600;
		font-size: 15px;
	}
	.mega {
		font-size: 120px;
		line-height: 0.9;
		font-weight: 800;
		font-stretch: 75%;
		letter-spacing: -0.05em;
		margin: 6px 0 12px;
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	.mega span {
		font-size: 28px;
		letter-spacing: -0.01em;
		font-stretch: 100%;
	}
	.dots {
		display: grid;
		grid-template-columns: repeat(15, 1fr);
		gap: 4px;
		margin-bottom: 10px;
	}
	.dots span {
		aspect-ratio: 1;
		border-radius: 50%;
		border: 2px solid currentColor;
	}
	.dots .on {
		background: currentColor;
	}
	.go {
		margin-top: 16px;
		width: 100%;
		min-height: 56px;
		border: 0;
		border-radius: 18px;
		background: var(--ink);
		color: #fff;
		font-weight: 800;
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}
	.deck {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: var(--ink);
		text-decoration: none;
		padding: 14px 16px;
		border: 2.5px solid var(--ink);
		border-radius: 16px;
		box-shadow: 6px 6px 0 var(--s);
		margin-bottom: 14px;
		font-weight: 650;
	}
	.dn {
		font-weight: 800;
		font-size: 28px;
		font-stretch: 75%;
	}
	.scan {
		width: 100%;
		min-height: 52px;
		background: transparent;
		border: 2.5px dashed var(--ink);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-weight: 700;
		color: var(--ink);
	}
	.exams {
		display: flex;
		gap: 10px;
		overflow-x: auto;
		margin: 0 -16px;
		padding: 0 16px 4px;
		scroll-snap-type: x mandatory;
	}
	.exam {
		flex: 0 0 62%;
		scroll-snap-align: start;
		border-radius: 22px;
		padding: 16px;
		display: flex;
		flex-direction: column;
	}
	.exam p {
		margin: 0;
	}
	.big {
		font-size: 72px;
		line-height: 0.9;
		font-weight: 800;
		font-stretch: 75%;
		letter-spacing: -0.04em;
		display: flex;
		align-items: baseline;
		gap: 6px;
	}
	.big span {
		font-size: 20px;
		font-stretch: 100%;
		letter-spacing: 0;
	}
	.et {
		font-weight: 700;
		margin-top: 16px !important;
	}
	.ed {
		font-size: 14px;
	}
	.prompt {
		background: var(--ink);
		color: #fff;
		border-radius: 22px;
		padding: 16px;
	}
	.prompt p {
		margin: 0 0 12px;
	}
	.prompt button {
		background: var(--s);
		color: #fff;
		border: 0;
		border-radius: 12px;
		padding: 10px 16px;
		font-weight: 700;
	}
	.ov {
		margin-left: auto;
		font-size: 26px;
	}
	.gr {
		display: grid;
		grid-template-columns: 112px 1fr 48px;
		align-items: center;
		gap: 10px;
		min-height: 36px;
	}
	.gname {
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.track {
		height: 18px;
		background: var(--soft);
		border-radius: 9px;
		overflow: hidden;
	}
	.track span {
		display: block;
		height: 100%;
		border-radius: 9px;
	}
	.gv {
		text-align: right;
		font-weight: 800;
	}
	.foot {
		font-size: 13px;
		color: #6b6b66;
		margin: 8px 0 0;
	}
	/* Abfrage */
	.qz {
		gap: 20px;
	}
	.qh {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.x {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 2.5px solid currentColor;
		background: transparent;
		color: inherit;
		display: grid;
		place-items: center;
	}
	.qn {
		font-weight: 800;
		font-size: 32px;
		font-stretch: 75%;
	}
	.qn span {
		opacity: 0.55;
	}
	.card {
		flex: 1;
		min-height: 420px;
		position: relative;
		border: 0;
		padding: 0;
		background: none;
		color: var(--ink);
		transform-style: preserve-3d;
		transition: transform 0.4s cubic-bezier(0.3, 0.7, 0.2, 1);
	}
	.card.flipped {
		transform: perspective(1400px) rotateY(180deg);
	}
	.side {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		background: var(--paper);
		border-radius: 32px;
		border: 3px solid var(--ink);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		padding: 24px;
		text-align: left;
	}
	.back {
		transform: rotateY(180deg);
	}
	.ct {
		font-weight: 600;
		font-size: 18px;
	}
	.ct.small {
		font-size: 14px;
		color: #6b6b66;
		margin-top: 24px;
	}
	.word {
		font-size: 76px;
		line-height: 0.95;
		font-weight: 800;
		font-stretch: 75%;
		letter-spacing: -0.04em;
		margin-top: 8px;
	}
	.word.sm {
		font-size: 64px;
	}
	.forms {
		font-size: 22px;
		font-weight: 500;
		margin-top: 16px;
	}
	.ans {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.ans button {
		min-height: 64px;
		border-radius: 20px;
		font-weight: 800;
		font-size: 16px;
		white-space: nowrap;
		padding: 0 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.ans button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.nope {
		background: transparent;
		border: 3px solid var(--ink);
		color: var(--ink);
	}
	.yep {
		background: var(--ink);
		border: 0;
		color: #fff;
	}
	.swipe {
		text-align: center;
		font-size: 13px;
		font-weight: 600;
		margin: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		.task {
			transition: none;
		}
	}
</style>

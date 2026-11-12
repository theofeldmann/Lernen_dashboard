<script lang="ts">
	import type { Snippet } from 'svelte';
	let { letter, title, about, dashboard, quiz }: { letter: string; title: string; about: Snippet; dashboard: Snippet; quiz: Snippet } = $props();
	let view = $state<'dashboard' | 'quiz'>('dashboard');
</script>

<div class="shell">
	<header class="meta">
		<nav aria-label="Entwürfe">
			{#each ['a', 'b', 'c', 'd'] as l (l)}
				<a href="/design/{l}" aria-current={l === letter ? 'page' : undefined}>{l.toUpperCase()}</a>
			{/each}
		</nav>
		<h1>Richtung {letter.toUpperCase()}: {title}</h1>
		<div class="about">{@render about()}</div>
		<p class="note">Statischer Entwurf. Nur Umdrehen und Abhaken reagieren, alles andere ist noch ohne Funktion.</p>
		<div class="switch" role="tablist" aria-label="Screen">
			<button role="tab" aria-selected={view === 'dashboard'} onclick={() => (view = 'dashboard')}>Startseite</button>
			<button role="tab" aria-selected={view === 'quiz'} onclick={() => (view = 'quiz')}>Abfrage</button>
		</div>
	</header>
	<div class="screens" data-view={view}>
		<section class="phone" data-screen="dashboard" aria-label="Startseite">{@render dashboard()}</section>
		<section class="phone" data-screen="quiz" aria-label="Abfrage">{@render quiz()}</section>
	</div>
</div>

<style>
	.shell {
		min-height: 100dvh;
		background: #d9dad6;
		color: #1d1d1b;
		font: 15px/1.5 system-ui, sans-serif;
		padding: 16px;
	}
	.meta {
		max-width: 820px;
		margin: 0 auto 20px;
	}
	nav {
		display: flex;
		gap: 6px;
		margin-bottom: 12px;
	}
	nav a {
		padding: 4px 12px;
		border-radius: 4px;
		color: inherit;
		text-decoration: none;
		border: 1px solid #9a9b96;
	}
	nav a[aria-current='page'] {
		background: #1d1d1b;
		color: #fff;
		border-color: #1d1d1b;
	}
	h1 {
		font-size: 20px;
		margin: 0 0 8px;
	}
	.about :global(p) {
		margin: 0 0 8px;
		max-width: 68ch;
	}
	.note {
		font-size: 13px;
		color: #55564f;
		margin: 8px 0 12px;
	}
	.switch {
		display: none;
		gap: 4px;
	}
	.switch button {
		flex: 1;
		padding: 8px;
		border: 1px solid #9a9b96;
		background: transparent;
		border-radius: 4px;
		font: inherit;
		color: inherit;
	}
	.switch button[aria-selected='true'] {
		background: #1d1d1b;
		color: #fff;
	}
	.screens {
		display: flex;
		gap: 32px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.phone {
		width: 390px;
		height: 844px;
		overflow: auto;
		border-radius: 28px;
		box-shadow: 0 0 0 10px #1d1d1b;
		position: relative;
	}
	:global(:focus-visible) {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
	@media (max-width: 860px) {
		.shell {
			padding: 16px 0 0;
		}
		.meta {
			padding: 0 16px;
		}
		.switch {
			display: flex;
		}
		.phone {
			width: 100%;
			height: auto;
			min-height: 100dvh;
			border-radius: 0;
			box-shadow: none;
		}
		.screens[data-view='dashboard'] [data-screen='quiz'],
		.screens[data-view='quiz'] [data-screen='dashboard'] {
			display: none;
		}
	}
</style>

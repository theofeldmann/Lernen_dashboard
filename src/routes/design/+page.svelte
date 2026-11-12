<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>Design-Richtungen</title></svelte:head>
<main style="max-width:640px;margin:0 auto;padding:24px 16px;font:16px/1.5 system-ui,sans-serif">
	<h1>Vier Design-Richtungen</h1>
	<ul>
		<li><a href={resolve('/design/a')}>A: Schulheft (Editorial)</a></li>
		<li><a href={resolve('/design/b')}>B: Präzises Werkzeug</a></li>
		<li><a href={resolve('/design/c')}>C: Farbig und mutig</a></li>
		<li><a href={resolve('/design/d')}>D: Nachtlernen</a></li>
	</ul>
</main>

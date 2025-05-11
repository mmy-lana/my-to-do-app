<!-- src\lib\TaskItem.svelte -->
<script lang="ts">
	export let task: { text: string; done: boolean; date: string };
	export let toggle: () => void;
	export let remove: () => void;

	function formatDateWithDayName(dateString: string): string {
		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		};
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-GB', options).format(date);
	}
</script>

<li
	class="mt-2 flex cursor-move items-center gap-2 rounded border bg-white p-2 shadow-sm"
	draggable="true"
	on:dragstart={(e) => e?.dataTransfer?.setData('application/json', JSON.stringify(task))}
>
	<input type="checkbox" bind:checked={task.done} on:change={toggle} />
	<span class={task.done ? 'line-through' : ''}>{task.text}</span>
	<span class="ml-auto text-xs text-gray-500">{formatDateWithDayName(task.date)}</span>
	<button on:click={remove} class="ml-2 text-sm text-red-500">Delete</button>
</li>

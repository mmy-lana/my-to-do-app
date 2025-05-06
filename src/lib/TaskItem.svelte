<script>
  export let task;
  export let toggle;
  export let remove;
</script>

<li class="mt-2 flex items-center gap-2 border p-2">
  <input type="checkbox" bind:checked={task.done} on:change={toggle} />
  <span class={task.done ? 'line-through' : ''}>{task.text}</span>
  <span class="text-xs text-gray-500 ml-auto">{task.date}</span>
  <button on:click={remove} class="text-red-500 text-sm ml-2">Delete</button>
</li>

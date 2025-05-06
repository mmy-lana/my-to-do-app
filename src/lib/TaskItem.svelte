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
  class="mt-2 flex items-center gap-2 border p-2 bg-white shadow-sm rounded cursor-move"
  draggable="true"
  on:dragstart={(e) =>
    e?.dataTransfer?.setData('application/json', JSON.stringify(task))
  }
>
  <input type="checkbox" bind:checked={task.done} on:change={toggle} />
  <span class={task.done ? 'line-through' : ''}>{task.text}</span>
  <span class="text-xs text-gray-500 ml-auto">{formatDateWithDayName(task.date)}</span>
  <button on:click={remove} class="text-red-500 text-sm ml-2">Delete</button>
</li>

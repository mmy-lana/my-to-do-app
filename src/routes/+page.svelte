<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import TaskItem from '$lib/TaskItem.svelte';

  type Task = {
    text: string;
    done: boolean;
    date: string; // 'YYYY-MM-DD'
  };

  let tasks: Task[] = [];
  let newTask = '';
  let newTaskDate = new Date().toISOString().split('T')[0]; // today
  let initialized = false;

  // Cache today and tomorrow as reactive values
  $: today = new Date().toISOString().split('T')[0];
  $: tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem('tasks');
      if (saved) tasks = JSON.parse(saved);
      initialized = true;
    }
  });

  $: if (browser && initialized) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function addTask() {
    if (newTask.trim() && newTaskDate) {
      tasks = [...tasks, { text: newTask, done: false, date: newTaskDate }];
      newTask = '';
    }
  }

  function toggleTask(index: number) {
    tasks = tasks.map((task, i) =>
      i === index ? { ...task, done: !task.done } : task
    );
  }

  function deleteTask(index: number) {
    tasks = tasks.filter((_, i) => i !== index);
  }

  function getTasksByDate(date: string) {
    return tasks.filter((t) => t.date === date);
  }

  function getFutureTasks() {
    return tasks.filter(t => t.date > tomorrow);
  }

  function getPastTasks() {
    return tasks.filter(t => t.date < today);
  }

  function sortTasks(tasks: Task[]) {
    return [...tasks].sort((a, b) => a.text.localeCompare(b.text));
  }
</script>

<div class="flex flex-col m-4 p-4 items-center justify-center">
  <h1 class="text-2xl font-bold mb-4">📝 My To-Do App</h1>

  <div class="flex flex-wrap gap-2 items-center justify-center mb-4">
    <input
      class="border rounded-md px-2 py-1"
      bind:value={newTask}
      placeholder="Add a task"
      on:keydown={(e) => e.key === 'Enter' && addTask()}
    />
    <input
      type="date"
      class="border rounded-md px-2 py-1"
      bind:value={newTaskDate}
    />
    <button
      on:click={addTask}
      class="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
    >
      Add
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">

    <!-- Past -->
    <div>
      <h2 class="text-lg font-semibold mb-2">⏪ Past / Done</h2>
      {#each sortTasks(getPastTasks()).map((t, i) => ({...t, _originalIndex: tasks.findIndex(task => task.text === t.text && task.date === t.date) })) as task}
        <TaskItem
          {task}
          toggle={() => toggleTask(task._originalIndex)}
          remove={() => deleteTask(task._originalIndex)}
        />
      {:else}
        <p class="text-sm text-gray-500">No past tasks</p>
      {/each}
    </div>

    <!-- Today -->
    <div>
      <h2 class="text-lg font-semibold mb-2">📅 Today ({today})</h2>
      {#each getTasksByDate(today).map((t) => ({ ...t, _originalIndex: tasks.findIndex(task => task.text === t.text && task.date === t.date) })) as task}
        <TaskItem
          {task}
          toggle={() => toggleTask(task._originalIndex)}
          remove={() => deleteTask(task._originalIndex)}
        />
      {:else}
        <p class="text-sm text-gray-500">No tasks</p>
      {/each}
    </div>


    <!-- Tomorrow -->
    <div>
      <h2 class="text-lg font-semibold mb-2">🕒 Tomorrow ({tomorrow})</h2>
      {#each getTasksByDate(tomorrow).map((t) => ({ ...t, _originalIndex: tasks.findIndex(task => task.text === t.text && task.date === t.date) })) as task}
        <TaskItem
          {task}
          toggle={() => toggleTask(task._originalIndex)}
          remove={() => deleteTask(task._originalIndex)}
        />
      {:else}
        <p class="text-sm text-gray-500">No tasks</p>
      {/each}
    </div>


    <!-- Future -->
    <div>
      <h2 class="text-lg font-semibold mb-2">🔜 Upcoming</h2>
      {#each getFutureTasks().map((t) => ({ ...t, _originalIndex: tasks.findIndex(task => task.text === t.text && task.date === t.date) })) as task}
        <TaskItem
          {task}
          toggle={() => toggleTask(task._originalIndex)}
          remove={() => deleteTask(task._originalIndex)}
        />
      {:else}
        <p class="text-sm text-gray-500">No upcoming tasks</p>
      {/each}
    </div>

  </div>
</div>

<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import TaskItem from '$lib/TaskItem.svelte';
	import { tasks, fetchTasks, updateTasks } from '$lib/stores/taskManager';
	import { auth, GoogleAuthProvider, signInWithPopup, signOut } from '$lib/firebase';
	import { user } from '$lib/stores/user';
	import type { Task } from '$lib/types';
	import { get } from 'svelte/store';
	import { signInWithRedirect } from '@firebase/auth';
	import { Provider } from '@firebase/component';

	let newTask = '';
	let newTaskDate = new Date().toISOString().split('T')[0];

	// ✅ wait for auth before fetching tasks
	onMount(() => {
		auth.onAuthStateChanged(async (u) => {
			user.set(u);
			await fetchTasks();
		});
	});

	$: today = new Date().toISOString().split('T')[0];
	$: tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

	const getPastDate = () =>
		new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
	const getUpcomingDate = () =>
		new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0];

	function sortTasks(arr: Task[]) {
		return [...arr].sort((a, b) => a.text.localeCompare(b.text));
	}

	function getTasksByDate(date: string) {
		return get(tasks).filter((t) => t.date === date);
	}

	function getPastTasks() {
		return get(tasks).filter((t) => t.date < today);
	}

	function getFutureTasks() {
		return get(tasks).filter((t) => t.date > tomorrow);
	}

	function addTask() {
		if (newTask.trim()) {
			const newTasks = [...get(tasks), { text: newTask, done: false, date: newTaskDate }];
			updateTasks(newTasks);
			newTask = '';
		}
	}

	async function toggleTask(index: number) {
		const updated = get(tasks).map((t, i) => (i === index ? { ...t, done: !t.done } : t));
		await updateTasks(updated);
	}

	async function deleteTask(index: number) {
		const updated = get(tasks).filter((_, i) => i !== index);
		await updateTasks(updated);
	}

	async function handleDrop(e: DragEvent, newDate: string) {
		const data = e.dataTransfer?.getData('application/json');
		if (!data) return;
		const droppedTask: Task = JSON.parse(data);

		const index = get(tasks).findIndex(
			(t) => t.text === droppedTask.text && t.date === droppedTask.date
		);
		if (index === -1) return;

		const updated = [...get(tasks)];
		updated[index].date = newDate;
		await updateTasks(updated);
	}

	export async function login() {
		try {
			const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

			if (isMobile) {
				await signInWithRedirect(auth, new GoogleAuthProvider());
			} else {
				await signInWithPopup(auth, new GoogleAuthProvider());
			}
		} catch (err) {
			console.error('Login error:', err);
			alert('Login failed');
		}
	}

	async function logout() {
		await updateTasks(get(tasks)); // save before logout
		await signOut(auth);
		tasks.set([]);
	}
</script>

<div class="m-4 flex flex-col items-center justify-center p-4">
	<h1 class="mb-4 text-2xl font-bold">📝 My To-Do App</h1>

	{#if $user}
		<div class="mb-4 flex w-full items-center justify-between px-4">
			<p class="text-md text-gray-700">Hi, {$user.displayName || 'User'}</p>
			<button on:click={logout} class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">
				Logout
			</button>
		</div>
	{:else}
		<div class="mb-4 flex w-full justify-end px-4">
			<button on:click={login} class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600">
				Login with Google
			</button>
		</div>
	{/if}

	<div class="mb-4 flex flex-wrap items-center justify-center gap-2">
		<input
			class="rounded-md border px-2 py-1"
			bind:value={newTask}
			placeholder="Add a task"
			on:keydown={(e) => e.key === 'Enter' && addTask()}
		/>
		<input type="date" class="rounded-md border px-2 py-1" bind:value={newTaskDate} />
		<button
			on:click={addTask}
			class="rounded-md bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
		>
			Add
		</button>
	</div>

	<div class="grid w-full grid-cols-1 gap-6 md:grid-cols-4">
		<!-- Past -->
		<div
			role="region"
			aria-label="Drop zone for Past tasks"
			on:dragover|preventDefault
			on:drop={(e) => handleDrop(e, getPastDate())}
		>
			<h2 class="mb-2 text-lg font-semibold">⏪ Past / Done</h2>
			{#each sortTasks($tasks.filter((t) => t.date < today)).map( (t) => ({ ...t, _originalIndex: $tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
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
		<div
			role="region"
			aria-label="Drop zone for Today"
			on:dragover|preventDefault
			on:drop={(e) => handleDrop(e, today)}
		>
			<h2 class="mb-2 text-lg font-semibold">📅 Today</h2>
			{#each sortTasks($tasks.filter((t) => t.date === today)).map( (t) => ({ ...t, _originalIndex: $tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
				<TaskItem
					{task}
					toggle={() => toggleTask(task._originalIndex)}
					remove={() => deleteTask(task._originalIndex)}
				/>
			{:else}
				<p class="text-sm text-gray-500">No tasks today</p>
			{/each}
		</div>

		<!-- Tomorrow -->
		<div
			role="region"
			aria-label="Drop zone for Tomorrow"
			on:dragover|preventDefault
			on:drop={(e) => handleDrop(e, tomorrow)}
		>
			<h2 class="mb-2 text-lg font-semibold">📆 Tomorrow</h2>
			{#each sortTasks($tasks.filter((t) => t.date === tomorrow)).map( (t) => ({ ...t, _originalIndex: $tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
				<TaskItem
					{task}
					toggle={() => toggleTask(task._originalIndex)}
					remove={() => deleteTask(task._originalIndex)}
				/>
			{:else}
				<p class="text-sm text-gray-500">No tasks for tomorrow</p>
			{/each}
		</div>

		<!-- Upcoming -->
		<div
			role="region"
			aria-label="Drop zone for Upcoming tasks"
			on:dragover|preventDefault
			on:drop={(e) => handleDrop(e, getUpcomingDate())}
		>
			<h2 class="mb-2 text-lg font-semibold">🔜 Upcoming</h2>
			{#each sortTasks($tasks.filter((t) => t.date > tomorrow)).map( (t) => ({ ...t, _originalIndex: $tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
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

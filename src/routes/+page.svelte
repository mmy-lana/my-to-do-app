<!-- PATH = src\routes\+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import TaskItem from '$lib/TaskItem.svelte';
	import { writable } from 'svelte/store';
	import {
		auth,
		GoogleAuthProvider,
		signInWithPopup,
		signOut,
		onAuthStateChanged,
		type User,
		doc,
		setDoc,
		db,
		getDoc
	} from '$lib/firebase';
	import { todos, user } from '$lib/stores/user';
	import { get } from 'svelte/store';

	let tasks: Task[] = [];

	onMount(() => {
		if (browser) {
			const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
				if (firebaseUser) {
					// Firebase user is logged in
					const docRef = doc(db, 'todos', firebaseUser.uid);
					const docSnap = await getDoc(docRef);

					const localTasks = JSON.parse(localStorage.getItem('todos') || '[]');
					if (docSnap.exists()) {
						const firestoreTasks: Task[] = docSnap.data().items || [];
						// Merge Firestore tasks and localStorage tasks if mismatch
						const mergedTasks: Task[] = [
							...firestoreTasks,
							...localTasks.filter(
								(localTask: { text: any }) =>
									!firestoreTasks.some((fsTask) => fsTask.text === localTask.text)
							)
						];
						tasks = mergedTasks;
						// Save merged tasks back to Firestore and localStorage
						await setDoc(docRef, { items: mergedTasks }, { merge: true });
						localStorage.setItem('todos', JSON.stringify(mergedTasks));
					} else {
						// If no tasks in Firestore, use localStorage tasks
						tasks = localTasks;
						await setDoc(docRef, { items: localTasks }, { merge: true });
					}
				} else {
					// If no user is logged in, use localStorage
					const savedTasks = localStorage.getItem('todos');
					tasks = savedTasks ? JSON.parse(savedTasks) : [];
				}
				user.set(firebaseUser);
			});
			return () => unsubscribe();
		}
	});

	$: if (browser) {
		localStorage.setItem('todos', JSON.stringify(tasks));
	}

	async function login() {
		const provider = new GoogleAuthProvider();
		try {
			await signInWithPopup(auth, provider);
		} catch (err) {
			console.error('Login error:', err);
			alert('An error occurred during login. Please try again.');
		}
	}

	async function logout() {
		try {
			if (auth.currentUser) {
				const firebaseUser = auth.currentUser;
				const docRef = doc(db, 'todos', firebaseUser.uid);
				await setDoc(docRef, { items: tasks });
			}
			localStorage.setItem('todos', JSON.stringify(tasks));
			await signOut(auth);
			tasks = [];
		} catch (err) {
			console.error('Logout error:', err);
			alert('An error occurred during logout. Please try again.');
		}
	}

	type Task = {
		text: string;
		done: boolean;
		date: string;
	};

	let newTask = '';
	let newTaskDate = new Date().toISOString().split('T')[0];

	$: today = new Date().toISOString().split('T')[0];
	$: tomorrow = (() => {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return d.toISOString().split('T')[0];
	})();

	function addTask() {
		if (newTask.trim() && newTaskDate) {
			tasks = [...tasks, { text: newTask, done: false, date: newTaskDate }];
			newTask = '';
			if (auth.currentUser) {
				const firebaseUser = auth.currentUser;
				const docRef = doc(db, 'todos', firebaseUser.uid);
				setDoc(docRef, { items: tasks });
			}
		}
	}

	async function toggleTask(index: number) {
		tasks = tasks.map((task, i) => (i === index ? { ...task, done: !task.done } : task));
		if (auth.currentUser) {
			const firebaseUser = auth.currentUser;
			const docRef = doc(db, 'todos', firebaseUser.uid);
			await setDoc(docRef, { items: tasks });
		} else {
			localStorage.setItem('todos', JSON.stringify(tasks));
		}
	}

	async function deleteTask(index: number) {
		tasks = tasks.filter((_, i) => i !== index);
		if (auth.currentUser) {
			const firebaseUser = auth.currentUser;
			const docRef = doc(db, 'todos', firebaseUser.uid);
			await setDoc(docRef, { items: tasks });
		} else {
			localStorage.setItem('todos', JSON.stringify(tasks));
		}
	}

	function getTasksByDate(date: string) {
		return tasks.filter((t) => t.date === date);
	}

	function getFutureTasks() {
		return tasks.filter((t) => t.date > tomorrow);
	}

	function getPastTasks() {
		return tasks.filter((t) => t.date < today);
	}

	function sortTasks(tasks: Task[]) {
		return [...tasks].sort((a, b) => a.text.localeCompare(b.text));
	}

	async function handleDrop(e: DragEvent, newDate: string) {
		const data = e.dataTransfer?.getData('application/json');
		if (!data) return;

		const droppedTask = JSON.parse(data);
		const index = tasks.findIndex(
			(t) => t.text === droppedTask.text && t.date === droppedTask.date
		);
		if (index === -1) return;

		tasks[index].date = newDate;
		tasks = [...tasks];

		if (auth.currentUser) {
			const firebaseUser = auth.currentUser;
			const docRef = doc(db, 'todos', firebaseUser.uid);
			await setDoc(docRef, { items: tasks });
		} else {
			localStorage.setItem('todos', JSON.stringify(tasks));
		}
	}

	function getPastDate() {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		return d.toISOString().split('T')[0];
	}

	function getUpcomingDate() {
		const d = new Date();
		d.setDate(d.getDate() + 2);
		return d.toISOString().split('T')[0];
	}

	function formatDateWithDayName(dateString: string): string {
		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		};
		const date = new Date(dateString);
		const formatter = new Intl.DateTimeFormat('en-GB', options);
		return formatter.format(date);
	}
</script>

<div class="m-4 flex flex-col items-center justify-center p-4">
	<h1 class="mb-4 text-2xl font-bold">📝 My To-Do App</h1>
	{#if $user}
		<div class="mb-4 flex w-full items-center justify-between px-4">
			<p class="text-md text-gray-700">Hi, {$user.displayName || 'User'}</p>
			<button on:click={logout} class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
				>Logout</button
			>
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
		<button on:click={addTask} class="rounded-md bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
			>Add</button
		>
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
			{#each sortTasks(getPastTasks()).map( (t, i) => ({ ...t, _originalIndex: tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
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
			{#each sortTasks(getTasksByDate(today)).map( (t, i) => ({ ...t, _originalIndex: tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
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
			{#each sortTasks(getTasksByDate(tomorrow)).map( (t, i) => ({ ...t, _originalIndex: tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
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
			{#each sortTasks(getFutureTasks()).map( (t, i) => ({ ...t, _originalIndex: tasks.findIndex((task) => task.text === t.text && task.date === t.date) }) ) as task}
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

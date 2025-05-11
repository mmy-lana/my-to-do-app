<!-- src\routes\+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { auth, onAuthStateChanged, db, doc, getDoc, setDoc } from '$lib/firebase';
	import { user } from '$lib/stores/user';

	export let children;

	// Auth + Todo sync
	onMount(() => {
		if (!browser) return;

		// Sync task updates with Firestore and localStorage

		const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			user.set(firebaseUser);

			if (firebaseUser) {
				const docRef = doc(db, 'todos', firebaseUser.uid);
				const docSnap = await getDoc(docRef);
				const localTodos = JSON.parse(localStorage.getItem('todos') || '[]');
				let firestoreTodos = docSnap.exists() ? docSnap.data().items || [] : [];

				const mergedTodos = [
					...firestoreTodos,
					...localTodos.filter(
						(localTask: { text: any }) =>
							!firestoreTodos.some((fsTask: { text: any }) => fsTask.text === localTask.text)
					)
				];

				await setDoc(docRef, { items: mergedTodos });
				localStorage.setItem('todos', JSON.stringify(mergedTodos));
			} else {
				const localTodos = localStorage.getItem('todos');
			}
		});

		return () => {
			authUnsubscribe();
		};
	});
</script>

{@render children()}

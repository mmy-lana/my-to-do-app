<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { auth, onAuthStateChanged, db, doc, getDoc, setDoc } from '$lib/firebase';
	import { user, todos } from '$lib/stores/user';

	export let children;

	// Auth + Todo sync
	onMount(() => {
		if (!browser) return;

		// Sync task updates with Firestore and localStorage
		const unsubscribe = todos.subscribe((val) => {
			if (!auth.currentUser) {
				localStorage.setItem('todos', JSON.stringify(val));
			} else {
				const firebaseUser = auth.currentUser;
				const docRef = doc(db, 'todos', firebaseUser.uid);
				setDoc(docRef, { items: val });
			}
		});

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

				todos.set(mergedTodos); // Use store's set method to update tasks
				await setDoc(docRef, { items: mergedTodos });
				localStorage.setItem('todos', JSON.stringify(mergedTodos));
			} else {
				const localTodos = localStorage.getItem('todos');
				todos.set(localTodos ? JSON.parse(localTodos) : []); // Use store's set method
			}
		});

		return () => {
			unsubscribe();
			authUnsubscribe();
		};
	});
</script>

{@render children()}

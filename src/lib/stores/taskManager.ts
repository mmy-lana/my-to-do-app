// src/lib/stores/taskManager.ts
import { writable } from 'svelte/store';
import { auth, db, doc, getDoc, setDoc } from '$lib/firebase';
import type { Task } from '$lib/types';
import { browser } from '$app/environment';

const tasks = writable<Task[]>([]);

function saveToLocal(tasksList: Task[]) {
  if (browser) localStorage.setItem('todos', JSON.stringify(tasksList));
}

function loadFromLocal(): Task[] {
  if (!browser) return [];
  const local = localStorage.getItem('todos');
  return local ? JSON.parse(local) : [];
}

async function syncWithFirestore(userId: string, currentTasks: Task[]) {
  const docRef = doc(db, 'todos', userId);
  await setDoc(docRef, { items: currentTasks });
}

async function fetchTasks() {
  if (!browser) return;

  const user = auth.currentUser;
  const localTasks = loadFromLocal();

  if (user) {
    const docRef = doc(db, 'todos', user.uid);
    const snap = await getDoc(docRef);
    const remoteTasks: Task[] = snap.exists() ? snap.data().items || [] : [];

    const merged = [
      ...remoteTasks,
      ...localTasks.filter(
        (local) => !remoteTasks.some((remote) => remote.text === local.text && remote.date === local.date)
      )
    ];

    tasks.set(merged);
    await syncWithFirestore(user.uid, merged);
    saveToLocal(merged);
  } else {
    await updateTasks(localTasks);
  }
}

async function updateTasks(newTasks: Task[]) {
  tasks.set(newTasks);
  const user = auth.currentUser;
  if (user) {
    await syncWithFirestore(user.uid, newTasks);
  }
  saveToLocal(newTasks);
}

export { tasks, fetchTasks, updateTasks };

// src/lib/stores/user.ts
import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';

export const user = writable<User | null>(null);
export const todos = writable<string[]>([]);

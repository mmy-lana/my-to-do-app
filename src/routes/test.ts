// src/routes/test.ts
import { json } from '@sveltejs/kit';

export function GET() {
  return json({ message: 'Test route works!' });
}

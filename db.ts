import { openDB } from 'idb'
import type { Question } from './questions'

const DB_NAME = 'fire-equipment-4-study'
const DB_VERSION = 1

export type Attempt = {
  id: string
  questionId: string
  selected: number | string
  correct: boolean
  answeredAt: string
  mode: 'practice' | 'mock' | 'review'
}
export type Bookmark = { questionId: string; createdAt: string }

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('questions')) db.createObjectStore('questions', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('attempts')) {
      const store = db.createObjectStore('attempts', { keyPath: 'id' })
      store.createIndex('questionId', 'questionId')
      store.createIndex('answeredAt', 'answeredAt')
    }
    if (!db.objectStoreNames.contains('bookmarks')) db.createObjectStore('bookmarks', { keyPath: 'questionId' })
    if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' })
  }
})

export async function seedQuestions(questions: Question[]) {
  const db = await dbPromise
  const tx = db.transaction('questions', 'readwrite')
  for (const q of questions) {
    const existing = await tx.store.get(q.id)
    if (!existing) await tx.store.put(q)
  }
  await tx.done
}
export async function getQuestions(): Promise<Question[]> {
  return (await dbPromise).getAll('questions')
}
export async function importQuestions(questions: Question[]) {
  const db = await dbPromise
  const tx = db.transaction('questions', 'readwrite')
  for (const q of questions) await tx.store.put(q)
  await tx.done
}
export async function addAttempt(attempt: Attempt) { await (await dbPromise).put('attempts', attempt) }
export async function getAttempts(): Promise<Attempt[]> { return (await dbPromise).getAll('attempts') }
export async function getBookmarks(): Promise<Bookmark[]> { return (await dbPromise).getAll('bookmarks') }
export async function toggleBookmark(questionId: string) {
  const db = await dbPromise
  const old = await db.get('bookmarks', questionId)
  if (old) await db.delete('bookmarks', questionId)
  else await db.put('bookmarks', { questionId, createdAt: new Date().toISOString() })
  return !old
}
export async function exportBackup() {
  const db = await dbPromise
  return {
    format: 'fire-equipment-4-study-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    questions: await db.getAll('questions'),
    attempts: await db.getAll('attempts'),
    bookmarks: await db.getAll('bookmarks')
  }
}
export async function importBackup(data: any) {
  if (data?.format !== 'fire-equipment-4-study-backup' || data?.version !== 1 ||
      !Array.isArray(data.questions) || !Array.isArray(data.attempts) || !Array.isArray(data.bookmarks)) {
    throw new Error('バックアップ形式が正しくありません。')
  }
  const db = await dbPromise
  const tx = db.transaction(['questions', 'attempts', 'bookmarks'], 'readwrite')
  for (const q of data.questions) await tx.objectStore('questions').put(q)
  for (const a of data.attempts) await tx.objectStore('attempts').put(a)
  for (const b of data.bookmarks) await tx.objectStore('bookmarks').put(b)
  await tx.done
}

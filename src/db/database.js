// src/db/database.js
import initSqlJs from 'sql.js';
import sqliteWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { createTables } from './schema';
import { seedDatabase } from './seed';

const DB_NAME = 'spendsense_db';
const STORE_NAME = 'sqlite_snapshot';
const DB_KEY = 'spendsense_snapshot_v3';

// Open IndexedDB connection
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Load SQLite binary snapshot from IndexedDB
export async function loadDbFromIndexedDB() {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(DB_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load DB from IndexedDB:", error);
    return null;
  }
}

// Save SQLite database snapshot to IndexedDB
export async function saveDbToIndexedDB(db) {
  try {
    console.log("Saving SQLite database snapshot to IndexedDB...");
    const binary = db.export(); // Export DB as Uint8Array
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(binary, DB_KEY);
      tx.oncomplete = () => {
        console.log("Database successfully saved to IndexedDB.");
        resolve();
      };
      tx.onerror = () => {
        console.error("IndexedDB transaction error:", tx.error);
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("Failed to save DB to IndexedDB:", error);
  }
}

// Main database initialization function
export async function initializeDb() {
  console.log("Initializing sql.js WASM SQLite engine...");
  // Loads WASM from /sql-wasm.wasm served statically from public/
  const SQL = await initSqlJs({
    locateFile: () => sqliteWasmUrl
  });

  const savedData = await loadDbFromIndexedDB();

  if (savedData && savedData.byteLength > 0) {
    console.log("Found existing SQLite database. Restoring from snapshot...");
    try {
      return new SQL.Database(savedData);
    } catch (e) {
      console.error("Error loading saved database snapshot. Resetting database...", e);
    }
  }

  console.log("No database snapshot found. Creating a fresh, seeded SQLite database...");
  const db = new SQL.Database();
  createTables(db);
  seedDatabase(db);
  await saveDbToIndexedDB(db);
  return db;
}

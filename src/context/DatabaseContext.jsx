// src/context/DatabaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDb, saveDbToIndexedDB } from '../db/database';

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Numeric trigger to force components to re-run SQL queries when DB mutates
  const [mutateCount, setMutateCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const database = await initializeDb();
        if (isMounted) {
          setDb(database);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Database initialization failed:", err);
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      // Note: We leave the database open for the app lifecycle.
    };
  }, []);

  // Helper to execute writes/deletes and auto-persist to IndexedDB
  const runMutation = async (mutationFn) => {
    if (!db) {
      console.warn("Attempted to mutate database before it was initialized.");
      return;
    }

    try {
      // Execute the query or script
      mutationFn(db);
      
      // Auto-save to IndexedDB (asynchronous snapshot export)
      await saveDbToIndexedDB(db);
      
      // Increment counter to notify listeners to re-query the SQLite database
      setMutateCount(prev => prev + 1);
    } catch (err) {
      console.error("Mutation failed: ", err);
      throw err;
    }
  };

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error, mutateCount, runMutation }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

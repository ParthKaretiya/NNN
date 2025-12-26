// src/services/historyService.ts

// Helper to generate a unique storage key for each user
const getKey = (userId: string) => `sentinai_history_${userId}`;

export const saveScan = (userId: string, result: any, fileName: string) => {
    if (!userId) return [];

    const key = getKey(userId);
    const history = getHistory(userId);

    const newEntry = {
        ...result,
        id: `SEC-${Math.floor(Math.random() * 10000)}`, // Generate ID like SEC-4021
        timestamp: new Date().toISOString(),
        fileName: fileName || 'manual_entry.ts'
    };

    // Keep the last 10 scans per user to prevent storage overflow
    const updatedHistory = [newEntry, ...history].slice(0, 10);

    localStorage.setItem(key, JSON.stringify(updatedHistory));
    return updatedHistory;
};

export const getHistory = (userId: string): any[] => {
    if (!userId) return [];

    const key = getKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

export const clearHistory = (userId: string) => {
    if (!userId) return [];
    localStorage.removeItem(getKey(userId));
    return [];
};
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/lib/ai/chatTypes';

const STORAGE_KEY_PREFIX = 'salesvista_chat_history_v1';

/**
 * Returns the local machine date formatted as YYYY-MM-DD string.
 * Uses local machine timezone date methods (getFullYear, getMonth, getDate).
 */
export function getMachineLocalDateString(dateObj = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface PersistedChatData {
  date: string; // Machine local date string YYYY-MM-DD
  messages: ChatMessage[];
  lastUpdated: number; // Unix timestamp in ms
}

/**
 * Custom React Hook to manage chat messages with 1-day local machine time persistence.
 *
 * Rules:
 * 1. User messages and LLM responses are saved to localStorage with current machine local date.
 * 2. On load/mount, if stored date matches machine local date, messages are restored.
 * 3. If stored date is from a previous calendar day (or missing), chat automatically refreshes for the new day.
 * 4. Checks periodically and on window focus for midnight rollover according to local machine time.
 */
export function usePersistedChat(storageKeySuffix: string = 'main') {
  const storageKey = `${STORAGE_KEY_PREFIX}_${storageKeySuffix}`;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const currentDateRef = useRef<string>(getMachineLocalDateString());

  // Helper to load and validate stored chat against machine local date
  const loadChatFromStorage = useCallback((): ChatMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
      const todayStr = getMachineLocalDateString();
      currentDateRef.current = todayStr;

      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];

      const parsed: PersistedChatData = JSON.parse(raw);

      // Verify if stored messages belong to today's local machine date
      if (parsed && parsed.date === todayStr && Array.isArray(parsed.messages)) {
        return parsed.messages;
      } else {
        // Expired (from previous calendar day according to machine time): refresh for next day
        console.log(
          `[usePersistedChat] Stored chat date (${parsed?.date}) differs from machine date (${todayStr}). Refreshing chat for the new day.`
        );
        localStorage.removeItem(storageKey);
        return [];
      }
    } catch (err) {
      console.warn('[usePersistedChat] Failed to parse chat from localStorage:', err);
      localStorage.removeItem(storageKey);
      return [];
    }
  }, [storageKey]);

  // Load from localStorage on client mount
  useEffect(() => {
    const initialMessages = loadChatFromStorage();
    setMessages(initialMessages);
    setIsHydrated(true);
  }, [loadChatFromStorage]);

  // Save to localStorage whenever messages change (after hydration)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    const todayStr = getMachineLocalDateString();
    try {
      if (messages.length > 0) {
        const payload: PersistedChatData = {
          date: todayStr,
          messages,
          lastUpdated: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.warn('[usePersistedChat] Error writing chat to localStorage:', err);
    }
  }, [messages, isHydrated, storageKey]);

  // Check for machine local date rollover (e.g. overnight or tab reactivation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDateRollover = () => {
      const todayStr = getMachineLocalDateString();
      if (todayStr !== currentDateRef.current) {
        console.log(
          `[usePersistedChat] Machine day changed from ${currentDateRef.current} to ${todayStr}. Refreshing chat for the new day.`
        );
        currentDateRef.current = todayStr;
        localStorage.removeItem(storageKey);
        setMessages([]);
      }
    };

    const onFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDateRollover();
      }
    };

    window.addEventListener('focus', onFocusOrVisibility);
    document.addEventListener('visibilitychange', onFocusOrVisibility);

    // Poll every 30 seconds to catch midnight transition while tab is open
    const intervalId = setInterval(checkDateRollover, 30000);

    return () => {
      window.removeEventListener('focus', onFocusOrVisibility);
      document.removeEventListener('visibilitychange', onFocusOrVisibility);
      clearInterval(intervalId);
    };
  }, [storageKey]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    messages,
    setMessages,
    clearMessages,
    isHydrated,
    todayDate: currentDateRef.current,
  };
}

"use client";

import { useEffect, useState } from "react";

type ToastItem = { id: number; type: "success" | "error"; message: string };

const listeners = new Set<(t: ToastItem) => void>();
let nextId = 0;

export function toast(type: ToastItem["type"], message: string) {
  const item = { id: nextId++, type, message };
  listeners.forEach((fn) => fn(item));
}

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== t.id)), 3500);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col gap-2"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className={`rounded-2xl px-5 py-3 text-sm shadow-lg ${
            t.type === "error"
              ? "bg-rose-500 text-white"
              : "bg-stone-900 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

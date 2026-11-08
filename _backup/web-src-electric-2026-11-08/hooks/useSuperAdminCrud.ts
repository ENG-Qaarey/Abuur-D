"use client";

import { useCallback, useState } from "react";

export type WithId = { id: number };

export function useSuperAdminCrud<T extends WithId>(initialItems: T[]) {
    const [items, setItems] = useState<T[]>(initialItems);
    const [viewing, setViewing] = useState<T | null>(null);
    const [editing, setEditing] = useState<T | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<T | null>(null);

    const remove = useCallback((id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const update = useCallback((id: number, patch: Partial<T>) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);

    const add = useCallback((item: T) => {
        setItems((prev) => [item, ...prev]);
    }, []);

    const nextId = useCallback(() => {
        return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    }, [items]);

    return {
        items,
        setItems,
        viewing,
        setViewing,
        editing,
        setEditing,
        creating,
        setCreating,
        deleting,
        setDeleting,
        remove,
        update,
        add,
        nextId,
        closeModals: () => {
            setViewing(null);
            setEditing(null);
            setCreating(false);
            setDeleting(null);
        },
    };
}

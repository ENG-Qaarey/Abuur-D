"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Threshold for OS display scaling (125%–150% on Windows is typically 1.25–1.5 DPR).
 * Values at or above this enable compact UI density.
 */
export const DISPLAY_SCALE_DPR_THRESHOLD = 1.25;

const COMPACT_ROOT_CLASS = "display-compact";

let compact = false;
let listening = false;
const subscribers = new Set<() => void>();

function readCompactDisplay(): boolean {
    const dpr = window.devicePixelRatio ?? 1;
    const mq = window.matchMedia(`(min-resolution: ${DISPLAY_SCALE_DPR_THRESHOLD}dppx)`);
    const viewportScale = window.visualViewport?.scale ?? 1;
    return dpr >= DISPLAY_SCALE_DPR_THRESHOLD || mq.matches || viewportScale >= DISPLAY_SCALE_DPR_THRESHOLD;
}

function applyCompact(next: boolean) {
    if (compact === next) return;
    compact = next;
    document.documentElement.classList.toggle(COMPACT_ROOT_CLASS, compact);
    subscribers.forEach((notify) => notify());
}

function syncCompact() {
    applyCompact(readCompactDisplay());
}

function startListening() {
    if (listening) return;
    listening = true;

    const mq = window.matchMedia(`(min-resolution: ${DISPLAY_SCALE_DPR_THRESHOLD}dppx)`);
    syncCompact();
    mq.addEventListener("change", syncCompact);
    window.addEventListener("resize", syncCompact);
    const vp = window.visualViewport;
    vp?.addEventListener("resize", syncCompact);
    vp?.addEventListener("scroll", syncCompact);
}

function subscribe(notify: () => void) {
    startListening();
    subscribers.add(notify);
    return () => subscribers.delete(notify);
}

function getSnapshot() {
    return compact;
}

function getServerSnapshot() {
    return false;
}

export function useCompactDisplay() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

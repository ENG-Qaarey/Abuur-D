import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export interface BrandSettings {
    brandName: string;
    brandTagline: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    logoLight: string;
    logoDark: string;
    /** @deprecated use primaryColor — kept for persisted stores */
    accentColor: string;
    primaryColor: string;
    secondaryColor: string;
    sidebarDepthColor: string;
}

interface BrandState {
    branding: BrandSettings;
    setBranding: (patch: Partial<BrandSettings>) => void;
    resetBranding: () => void;
}

const defaultBranding: BrandSettings = {
    brandName: APP_NAME,
    brandTagline: APP_DESCRIPTION,
    supportEmail: "support@saomali-electric.so",
    supportPhone: "+252 61 XXX XXXX",
    address: "Mogadishu, Somalia",
    logoLight: "/iconLight.png",
    logoDark: "/iconDark.png",
    accentColor: "#059669",
    primaryColor: "#059669",
    secondaryColor: "#0891b2",
    sidebarDepthColor: "#0f172a",
};

export const useBrandSettings = create<BrandState>()(
    persist(
        (set) => ({
            branding: defaultBranding,
            setBranding: (patch) =>
                set((state) => ({
                    branding: { ...state.branding, ...patch },
                })),
            resetBranding: () => set({ branding: defaultBranding }),
        }),
        {
            name: "sea-brand-settings",
            merge: (persisted, current) => {
                const p = persisted as Partial<BrandState> | undefined;
                if (!p?.branding) return current;
                const b = p.branding;
                return {
                    ...current,
                    branding: {
                        ...defaultBranding,
                        ...b,
                        primaryColor: b.primaryColor || b.accentColor || defaultBranding.primaryColor,
                        secondaryColor: b.secondaryColor || defaultBranding.secondaryColor,
                        sidebarDepthColor: b.sidebarDepthColor || defaultBranding.sidebarDepthColor,
                        accentColor: b.accentColor || b.primaryColor || defaultBranding.accentColor,
                    },
                };
            },
        }
    )
);
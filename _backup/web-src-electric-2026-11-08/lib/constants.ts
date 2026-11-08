export const APP_NAME = "Somali Electric App";
export const APP_DESCRIPTION = "Enterprise Electricity Management Platform for Somalia";

export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    COMPANY_OWNER: "COMPANY_OWNER",
    COMPANY_ADMIN: "COMPANY_ADMIN",
    CUSTOMER: "CUSTOMER",
    METER_READER: "METER_READER",
} as const;

export type UserRole = keyof typeof ROLES;

export const ROUTES = {
    HOME: "/",
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        FORGOT_PASSWORD: "/auth/forgot-password",
        VERIFY_OTP: "/auth/verify-otp",
    },
    DASHBOARD: {
        SUPER_ADMIN: "/super-admin/dashboard",
        COMPANY_OWNER: "/company-owner/dashboard",
        COMPANY_ADMIN: "/company-admin/dashboard",
        CUSTOMER: "/customer/dashboard",
        METER_READER: "/meter-reader/dashboard",
    },
};

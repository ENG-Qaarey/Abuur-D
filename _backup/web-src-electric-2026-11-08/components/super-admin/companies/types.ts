export type Company = {
    id: number;
    name: string;
    domain: string;
    region: string;
    customers: number;
    meters: number;
    revenue: number;
    plan: string;
    status: string;
    joined: string;
    logo: string;
    logoColor: string;
    // Optional fields that mirror backend columns
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    ownerId?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type SortKey = "id" | "name" | "customers" | "meters" | "revenue" | "joined";
export type SortDir = "asc" | "desc";

export type CompanyFormState = {
    name: string;
    domain: string;
    region: string;
    customers: string;
    meters: string;
    revenue: string;
    plan: string;
    status: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    ownerId?: string;
};

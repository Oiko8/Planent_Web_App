export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED";

export type EventItem = {
    id: string;
    title: string;
    category: string[];
    type: string;
    city: string;
    venue: string;
    date: string;
    priceFrom: number;
    description: string;
    status: EventStatus;
};
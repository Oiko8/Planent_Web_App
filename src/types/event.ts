export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED";

export type EventCategory = "Music" | "Workshop" | "Sports" | "Theater" | "Festival" | "Live Performance" | "Technology" | "Culture" | "Other";

export type EventItem = {
    id: string;
    title: string;
    category: EventCategory[];   
    type: string;
    city: string;
    venue: string;
    date: string;
    priceFrom: number;
    description: string;
    status: EventStatus;
};
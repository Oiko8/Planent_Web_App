export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED";

export type CategoryResponse = {
    categoryId: number;
    categoryName: string;
};

export type TicketTypeResponse = {
    ticketTypeId: number;
    name: string;
    price: number;
    quantity: number;
    available: number;
};

export type EventItem = {
    eventId: number;
    title: string;
    eventType: string;
    venue: string;
    country: string;
    city: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    startDatetime: string;
    endDatetime: string;
    capacity: number;
    status: EventStatus;
    description: string;
    categories: CategoryResponse[];
    ticketTypes: TicketTypeResponse[];
};
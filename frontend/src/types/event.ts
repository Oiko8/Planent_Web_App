export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

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
    organizerId: number;
    canDelete: boolean
    categories: CategoryResponse[];
    ticketTypes: TicketTypeResponse[];
};


export type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    last: boolean;
    first: boolean;
}
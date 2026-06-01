export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

export type CategoryResponse = {
    categoryId: number;
    categoryName: string;
};

export type TicketTypeResponse = {
    ticketTypeId: number;
    eventId: number;
    name: string;
    price: number;
    quantity: number;
    available: number;
};

export type MediaResponse = {
    mediaId: number;
    photoUrl: string;
};

export type EventSummary = {
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
    descriptionSummary: string;       
    organizerId: number;
    mainMedia: MediaResponse | null;  // nullable
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
    canDelete: boolean;
    media: MediaResponse[] | null;
    categories: CategoryResponse[];
    ticketTypes: TicketTypeResponse[];
};

export type PageResponse<T> = {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
};
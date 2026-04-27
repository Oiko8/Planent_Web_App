export type TicketTypeForm = {
    name: string;
    price: number ;
    quantity: number ;
};

export type CreateEventForm = {
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
    description: string;
    categoryIds: number[];
    ticketTypes: TicketTypeForm[];
    mediaUrls?: string[];
};
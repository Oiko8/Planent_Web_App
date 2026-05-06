export type TicketTypeUpdate = {
    name: string;
    price: number;
    quantity: number;
};

export type UpdateEventForm = {
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
    ticketTypes: TicketTypeUpdate[];
};
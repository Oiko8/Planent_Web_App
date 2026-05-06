export type BookingStatus = "CONFIRMED" | "CANCELLED";

export type BookingItem = {
    bookingId: number;
    eventId: number;    
    eventTitle: string;     
    attendeeUsername: string;
    ticketType: {
        ticketTypeId: number;
        name: string;
        price: number;
        quantity: number;
        available: number;
    };
    numberOfTickets: number;
    totalCost: number;
    bookingTime: string;
    bookingStatus: BookingStatus;
};
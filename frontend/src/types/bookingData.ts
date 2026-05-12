import { UserPublicInfo } from "./message";

export type BookingStatus = "CONFIRMED" | "CANCELLED";

export type BookingItem = {
    bookingId: number;
    eventId: number;    
    eventTitle: string;     
    attendee: UserPublicInfo;
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
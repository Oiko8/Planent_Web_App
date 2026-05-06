export type UserPublicInfo = {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    city: string;
};

export type MessagePreview = {
    messageId: number;
    eventId: number | null;
    eventTitle: string | null;
    otherUser: UserPublicInfo;
    bodyPreview: string;
    isRead: boolean;
};

export type MessageFull = {
    messageId: number;
    eventId: number | null;
    eventTitle: string | null;
    otherUser: UserPublicInfo;
    body: string;
};
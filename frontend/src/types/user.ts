// The User type used in AuthContext (from /users/me)
export type User = {
    userId: number;
    username: string;
    isAdmin: boolean;
    isApproved: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    zipcode: string;
    latitude: number | null;
    longitude: number | null;
    afm: string;
};
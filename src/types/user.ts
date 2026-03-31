export type UserRole = "USER" | "ADMIN";

export type ApprovalStatus = "PENDING" | "APPROVED";

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  address: string;
  zipCode: string;
  afm: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
};
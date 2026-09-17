export type Role = "admin" | "manager";

export type VisitType = "full-days" | "arrival-departure" | "mixed";

export type VisitCategory = "Personal" | "Omar Maroun" | "Syria Trip";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Visit {
  _id: string;
  name: string;
  hotel: string;
  car: string;
  type: VisitType;
  category: VisitCategory | "";
  dateFrom?: string;
  dateTo?: string;
  pricePerDay?: number;
  totalDays?: number;
  arrivalPrice?: number;
  departurePrice?: number;
  fullPricePackages?: number;
  totalCost?: number;
  isPaid?: boolean;
  arrivalEventLink?: string;
  departureEventLink?: string;
}

export interface VisitFormData {
  name: string;
  hotel: string;
  car: string;
  type: VisitType | "";
  category: VisitCategory | "";
  dateFrom: string;
  dateTo: string;
  pricePerDay: string;
  totalDays: string;
  arrivalPrice: string;
  departurePrice: string;
  fullPricePackages: string;
}

export interface JwtPayload {
  id: string;
  role?: Role;
  [key: string]: unknown;
}

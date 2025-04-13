import { Review } from "./review.model";

export interface Tutor {
    email: string;
    role: string;
    uid: string;
    name: string;
    subject: string;
    reviews?: Review[];
    verified:boolean;
  }
  
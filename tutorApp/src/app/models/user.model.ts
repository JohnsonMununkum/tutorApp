import { Observable } from "rxjs";
import { Review } from "./review.model";

export interface User {
    email: string;
    role: string;
    uid: string;
    name: string;
    subject: string;
    reviews?: Observable<Review[]>;
  }
  
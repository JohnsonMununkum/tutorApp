//interface that allows users to give a tutor a review 
export interface Review {
    text: string;
    rating: number;
    reviewerUid: string;
    reviewer: string
  }
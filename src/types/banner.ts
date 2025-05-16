import { ObjectId } from "mongodb";

export interface Banner {
  _id?: ObjectId;
  imageUrl: string;
  title: string;
  order: number;
  createdAt: Date;
} 
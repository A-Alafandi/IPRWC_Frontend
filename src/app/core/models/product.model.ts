export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

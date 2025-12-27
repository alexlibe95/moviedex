import { Movie } from './movie.model';

export interface Collection {
  id: string;
  name: string;
  movies: Movie[];
  createdAt: string;
  updatedAt: string;
}


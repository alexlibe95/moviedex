export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    vote_average: number;
    release_date: string;
  }
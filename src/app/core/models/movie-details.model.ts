export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  budget: number;
  release_date: string;
  revenue: number;
  vote_average: number;
  vote_count: number;
  spoken_languages: SpokenLanguage[];
}

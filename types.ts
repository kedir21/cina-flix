export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie';
}

export interface TvShow {
  id: number;
  name: string;
  original_name?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'tv';
}

export type ContentItem = Movie | TvShow;

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: {
    results: Video[];
  };
  // TV specific fields might be present if we reuse this or creating a union
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
}

export interface TvDetails extends TvShow {
  genres: { id: number; name: string }[];
  tagline: string;
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: {
    results: Video[];
  };
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Season[];
  episode_run_time: number[];
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface SeasonDetails {
  _id: string;
  air_date: string;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Genre {
  id: number;
  name: string;
}

export enum NavigationDirection {
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  ENTER = 'Enter',
  BACK = 'Backspace',
  ESCAPE = 'Escape'
}
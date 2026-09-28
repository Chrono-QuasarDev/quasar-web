// ─── Domain types mirroring the music-streaming-api Sequelize models ───

export type Role = "listener" | "artist" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  created_at?: string;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  bio: string;
  profilePictureUrl: string;
  createdAt: string;
  // Includes from API (accept either casing — modules differ)
  User?: Pick<User, "username" | "id" | "email">;
  user?: Pick<User, "username" | "id" | "email">;
  Songs?: Song[];
  songs?: Song[];
  followersCount?: number;
  isFollowing?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  // Absent on playlist-detail songs, so optional everywhere for safety.
  albumName?: string;
  trackNumber?: number;
  durationMs: number;
  genre: string;
  releaseDate: string;
  filePath?: string;
  createdAt?: string;
  // Includes from API
  ArtistProfile?: ArtistProfile;
  artistName?: string;
}

export interface Playlist {
  id: string;
  // List rows carry userId; the detail endpoint returns neither userId nor
  // createdAt, so both stay optional.
  userId?: string;
  name: string;
  createdAt?: string;
  // Includes from API (playlist module uses lowercase `songs`)
  songs?: Song[];
  Songs?: Song[];
  songCount?: number;
  User?: Pick<User, "username" | "id">;
  user?: Pick<User, "username" | "id">;
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  createdAt?: string;
  Song?: Song;
}

export interface SharePayload {
  id: string;
  title: string;
  albumName: string;
  ArtistProfile?: ArtistProfile & { User?: Pick<User, "username"> };
}

// ─── API envelope types ───

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
  meta?: PageMeta;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface LoginData {
  user: User;
  accessToken: string;
  expiresIn?: string;
}

export interface Paginated<T> {
  rows: T[];
  meta: PageMeta;
}

export type SortField = "title" | "albumName" | "genre" | "releaseDate";
export type SortOrder = "asc" | "desc";

export interface SongListParams {
  page?: number;
  size?: number;
  sortBy?: SortField;
  orderBy?: SortOrder;
  q?: string;
  title?: string;
  album?: string;
  genre?: string;
}

import { PaginationMeta } from './academics';

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  category?: 'workshop' | 'conference' | 'social' | 'sports' | 'career' | 'other' | string;
  date?: string;
  location?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  capacity?: number | null;
  registered_count?: number | null;
  is_paid?: boolean;
  price?: number | null;
  registration_deadline?: string | null;
  status?: 'draft' | 'published' | 'cancelled';
  is_registered?: boolean;
  isRegistered?: boolean;
  registration_id?: string | null;
  my_registration?: EventRegistration | null;
  created_at?: string;
  updated_at?: string;
}

export interface EventPayload {
  title: string;
  description?: string | null;
  category?: string;
  date?: string;
  location?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  capacity?: number | null;
  is_paid?: boolean;
  price?: number | null;
  registration_deadline?: string | null;
  status?: 'draft' | 'published' | 'cancelled';
}

export interface EventListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: 'title' | 'start_time' | 'created_at';
  sort_order?: 'ASC' | 'DESC' | 'asc' | 'desc';
  status?: string;
}

export interface EventListResult {
  events: Event[];
  pagination: PaginationMeta;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id?: string;
  status?: 'registered' | 'cancelled' | 'checked_in' | 'waitlisted';
  registered_at?: string | null;
  checked_in_at?: string | null;
  qr_code?: string | null;
  event?: Event | null;
  user?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
}

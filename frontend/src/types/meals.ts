export interface Cafeteria {
  id: string;
  name: string;
  location?: string | null;
  capacity?: number | null;
  open_hours?: string | null;
  description?: string | null;
}

export interface MealMenuItem {
  id?: string;
  name: string;
  description?: string | null;
  calories?: number | null;
  allergens?: string[] | string | null;
}

export interface MealMenu {
  id: string;
  cafeteria_id?: string;
  cafeteria?: Cafeteria;
  title?: string;
  name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  price?: number | null;
  items?: MealMenuItem[];
  description?: string | null;
  is_available?: boolean;
  status?: string;
}

export interface MealMenuListQuery {
  page?: number;
  limit?: number;
  cafeteria_id?: string;
  date?: string;
  search?: string;
}

export interface MealMenuListResult {
  menus: MealMenu[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MealReservation {
  id: string;
  menu_id?: string;
  menu?: MealMenu;
  status?: string;
  reserved_at?: string;
  used_at?: string | null;
  qr_code?: string | null;
  cafeteria?: Cafeteria;
}

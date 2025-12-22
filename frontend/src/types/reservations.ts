export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export type Reservation = {
  id: string;
  classroom_id: string;
  student_id?: string;
  start_time: string;
  end_time: string;
  purpose?: string | null;
  status: ReservationStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  classroom?: {
    id: string;
    building?: string;
    room_number?: string;
    capacity?: number;
  };
  student?: {
    id: string;
    user?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
  approver?: {
    id: string;
    user?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
};

export type ReservationCreatePayload = {
  classroom_id: string;
  start_time: string;
  end_time: string;
  purpose?: string;
};

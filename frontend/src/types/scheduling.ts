export interface ScheduleEntry {
  id?: string;
  course_code?: string;
  course_name?: string;
  section_number?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  classroom?: string;
  instructor?: string;
}

export interface Schedule {
  id: string;
  title?: string;
  semester?: string;
  year?: number;
  generated_at?: string;
  entries?: ScheduleEntry[];
}

export interface GenerateSchedulePayload {
  semester: string;
  year: number;
  notes?: string;
}

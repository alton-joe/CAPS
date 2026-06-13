-- Optional Supabase schema for enterprise-style extension
-- Keep Google Sheets as primary backend to satisfy assignment brief.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  roll_number text not null unique,
  section text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  record_type text not null check (record_type in ('attendance', 'grade')),
  record_date date not null,
  attendance_status text check (attendance_status in ('present', 'absent', 'late')),
  grade_value numeric(5,2) check (grade_value >= 0 and grade_value <= 100),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_or_grade_required check (
    (record_type = 'attendance' and attendance_status is not null)
    or (record_type = 'grade' and grade_value is not null)
  )
);

create index if not exists idx_student_records_student_id on public.student_records(student_id);
create index if not exists idx_student_records_record_date on public.student_records(record_date);
create index if not exists idx_student_records_record_type on public.student_records(record_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_student_records_updated_at on public.student_records;
create trigger trg_student_records_updated_at
before update on public.student_records
for each row execute procedure public.set_updated_at();

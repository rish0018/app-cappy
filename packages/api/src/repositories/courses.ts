/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to database tables directly. All reads/writes
 * for courses/units go through this repository so the persistence layer
 * can change without touching app code.
 */
import type { Course, Unit } from "@cappy/types";
import { createSupabaseClient } from "../client";

interface CourseRow {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface UnitRow {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  description: string;
}

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    orderIndex: row.order_index,
  };
}

function mapUnit(row: UnitRow): Unit {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    orderIndex: row.order_index,
    description: row.description,
  };
}

export async function getCourses(): Promise<Course[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data as CourseRow[]).map(mapCourse);
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCourse(data as CourseRow) : null;
}

export async function getUnitsForCourse(courseId: string): Promise<Unit[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data as UnitRow[]).map(mapUnit);
}

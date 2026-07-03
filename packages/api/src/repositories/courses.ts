/**
 * Data-access rule (docs/PROJECT_BIBLE.md §197, "Import Rules"): apps never
 * talk to database tables directly. All reads/writes for courses/units go
 * through this repository so the persistence layer can change without
 * touching app code.
 */
import type { Course, Unit } from "@cappy/types";

export async function getCourses(): Promise<Course[]> {
  throw new Error("not implemented");
}

export async function getCourseById(_courseId: string): Promise<Course | null> {
  throw new Error("not implemented");
}

export async function getUnitsForCourse(_courseId: string): Promise<Unit[]> {
  throw new Error("not implemented");
}

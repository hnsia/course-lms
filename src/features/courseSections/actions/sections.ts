"use server";

import z from "zod";
import { getCurrentUser } from "@/services/clerk";
import { sectionSchema } from "../schemas/courses";
import {
  canCreateCourseSections,
  canDeleteCourseSections,
  canUpdateCourseSections,
} from "../permissions/sections";
import {
  getNextCourseSectionOrder,
  insertSection,
  updateSection as updateSectionDb,
  deleteSection as deleteSectionDb,
} from "../db/sections";

export async function createSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canCreateCourseSections(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your section" };
  }

  const order = await getNextCourseSectionOrder(courseId);

  await insertSection({ ...data, courseId, order });

  return { error: false, message: "Successfully created your section" };
}

export async function updateSection(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canUpdateCourseSections(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your section" };
  }

  await updateSectionDb(id, data);

  return { error: false, message: "Successfuly updated your section" };
}

export async function deleteSection(id: string) {
  if (!canDeleteCourseSections(await getCurrentUser())) {
    return { error: true, message: "Error deleting your section" };
  }

  await deleteSectionDb(id);

  return { error: false, message: "Successfuly deleted your section" };
}

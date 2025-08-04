import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(getCourseIdTag(id));
}

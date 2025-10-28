"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useParams } from "next/navigation";

export function CoursePageClient({
  course,
}: {
  course: {
    id: string;
    courseSections: {
      id: string;
      name: string;
      lessons: {
        id: string;
        name: string;
        isComplete: boolean;
      }[];
    }[];
  };
}) {
  const { lessonId } = useParams();
  const defaultValue =
    typeof lessonId === "string"
      ? course.courseSections.find((section) =>
          section.lessons.find((lesson) => lesson.id === lessonId)
        )
      : course.courseSections[0];

  return (
    <Accordion type="multiple">
      {course.courseSections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="text-lg">
            {section.name}
          </AccordionTrigger>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

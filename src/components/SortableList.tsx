"use client";

import { ReactNode, useOptimistic } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVerticalIcon } from "lucide-react";

export function SortableList<T extends { id: string }>({
  items,
  onOrderChange,
  children,
}: {
  items: T[];
  onOrderChange: (
    newOrder: string[]
  ) => Promise<{ error: boolean; message: string }>;
  children: (items: T[]) => ReactNode;
}) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);

  function handleDragEnd() {}

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext
        items={optimisticItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col">{children(optimisticItems)}</div>
      </SortableContext>
    </DndContext>
  );
}

export function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const {
    setNodeRef,
    transform,
    transition,
    activeIndex,
    index,
    attributes,
    listeners,
  } = useSortable({ id });
  const isActive = activeIndex === index;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      className={cn(
        "flex gap-1 items-center bg-background rounded-lg p-2",
        isActive && "z-10 border shadow-md"
      )}
    >
      <GripVerticalIcon
        className="text-muted-foreground size-6 p-1"
        {...attributes}
        {...listeners}
      />
      <div className={cn("flex-grow", className)}>{children}</div>
    </div>
  );
}

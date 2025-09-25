import { buttonVariants } from "./ui/button";

export function SkeletonButton() {
  return (
    <div
      className={buttonVariants({
        variant: "secondary",
        className: "pointer-events-none animate-pulse w-24",
      })}
    />
  );
}

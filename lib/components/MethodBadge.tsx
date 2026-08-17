import { HttpMethod } from "@/lib/operations";

type MethodBadgeProps = {
  method: HttpMethod | string;
  // Shortens the method to 3 letters, useful in narrow containers like the navbar
  short?: boolean;
  className?: string;
};

// Displays an HTTP method as a colored badge, colors are defined in index.css
export function MethodBadge({ method, short, className }: MethodBadgeProps) {
  return (
    <span
      className={`httpmethod-${method.toLowerCase()} rd-method-badge${className ? ` ${className}` : ""}`}
    >
      {short ? method.slice(0, 3) : method}
    </span>
  );
}

import { Toaster as Sonner } from "sonner";

export function Toaster({ ...props }) {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      richColors
      closeButton
      {...props}
    />
  );
}

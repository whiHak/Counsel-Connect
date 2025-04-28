import { type ClassValue, clsx } from "clsx"
import { format, isToday, isTomorrow } from "date-fns";
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

export default function formatDate(dateString: string){
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  return format(date, "MMMM d, yyyy"); // Example: April 26, 2025
}

export const disablePastDates = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};
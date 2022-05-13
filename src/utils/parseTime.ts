import { format, parseISO } from "date-fns";

/**
 *
 * @param {string} time
 * @returns string
 */
export function parseTime(time = "", today = false) {
  try {
    const date = today ? Date.now() : parseISO(time);
    return format(date, "dd MMM yyyy");
  } catch (error) {
    return "";
  }
}

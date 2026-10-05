/** Locale date-time for review timestamps, or an em dash when absent. */
export const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

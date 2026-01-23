import * as z from 'zod';

export default class AppUtils {
  static formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return date.toLocaleDateString(undefined, options);
  }

  static generateRandomId(length: number = 8): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static formatZodError(error: z.ZodError) {
    return error.issues.map((issue) => ({
      field: issue.path.join('.'),
      errorMessage: issue.message,
    }));
  }
}

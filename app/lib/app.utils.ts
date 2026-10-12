
import { DATE_FORMAT_OPTIONS, RANDOM_ID_CHARACTERS } from "@/lib/constants";
import * as z from 'zod';

export default class AppUtils {
  static formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, DATE_FORMAT_OPTIONS);
  }

  static generateRandomId(length: number = 8): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += RANDOM_ID_CHARACTERS.charAt(Math.floor(Math.random() * RANDOM_ID_CHARACTERS.length));
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

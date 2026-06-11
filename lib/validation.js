import { z } from 'zod';

// Phone: allows digits, +, -, spaces, and parentheses only. No letters.
const phoneRegex = /^[+\d\s\-(). ]+$/;

export const phoneSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || phoneRegex.test(val), {
    message: 'Phone number can only contain digits, spaces, +, -, and parentheses.',
  })
  .optional();

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'Please enter a valid email address.' })
  .optional()
  .or(z.literal(''));

export const customerSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'Name is required.' }),
    phone: z
      .string()
      .trim()
      .refine((val) => val === '' || phoneRegex.test(val), {
        message: 'Phone number can only contain digits, spaces, +, -, and parentheses.',
      })
      .optional()
      .default(''),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => val === '' || z.string().email().safeParse(val).success, {
        message: 'Please enter a valid email address.',
      })
      .optional()
      .default(''),
    assignedAgent: z.string().optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPhone = data.phone && data.phone.trim() !== '';
    const hasEmail = data.email && data.email.trim() !== '';
    if (!hasPhone && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either Phone Number or Email Address is required.',
        path: ['phone'],
      });
    }
  });

/**
 * Parse Zod errors into a flat object: { fieldName: 'error message' }
 */
export function parseZodErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] || '_root';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Title is required.' }),
    description: z.string().trim().optional(),
    dueDate: z.string().min(1, { message: 'Due date is required.' }),
    reminderDate: z.string().optional().nullable(),
    status: z.enum(['pending', 'completed']).optional().default('pending'),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    assignedTo: z.string().min(1, { message: 'Assigned To is required.' }),
    customer: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.reminderDate && data.dueDate) {
      if (new Date(data.reminderDate) > new Date(data.dueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Reminder date cannot be after due date.',
          path: ['reminderDate'],
        });
      }
    }
  });

export const taskNoteSchema = z.object({
  text: z.string().trim().min(1, { message: 'Note text is required.' }),
});

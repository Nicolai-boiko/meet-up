import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Некорректный email'),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: 'Пароли не совпадают',
    path: ['newPasswordConfirm'],
  })

export const profileSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(6, 'Новый пароль должен быть не менее 6 символов'),
})

export const meetupSchema = z
  .object({
    title: z.string().min(1, 'Название обязательно'),
    description: z.string().optional().nullable(),
    startTime: z.string().min(1, 'Время начала обязательно'),
    endTime: z.string().min(1, 'Время окончания обязательно'),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: 'Окончание должно быть позже начала',
    path: ['endTime'],
  })

export const contentSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  type: z.enum(['text', 'video', 'link', 'file'], { message: 'Выберите тип' }),
  body: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
})

export const roomSchema = z.object({
  slug: z
    .string()
    .min(1, 'Название комнаты обязательно')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Только латиница, цифры, - и _'),
  password: z.string().optional(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ProfileForm = z.infer<typeof profileSchema>
export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>
export type MeetupForm = z.infer<typeof meetupSchema>
export type ContentForm = z.infer<typeof contentSchema>
export type RoomForm = z.infer<typeof roomSchema>

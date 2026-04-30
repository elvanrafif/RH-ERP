import { z } from 'zod'

export const surveySchema = z.object({
  client: z.string().min(1, 'Client is required'),
  surveyor: z.string().min(1, 'Surveyor is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  status: z.enum(['pending', 'done']),
  notes: z.string().max(500).optional(),
})

export type SurveyFormValues = z.infer<typeof surveySchema>

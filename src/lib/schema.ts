import { z } from 'zod';

export const jobFormSchema = z.object({
  // Job Info
  jobNumber: z.string().min(1, 'Job number is required'),
  jobDate: z.string().min(1, 'Job date is required'),
  scheduledStartTime: z.string().min(1, 'Scheduled start time is required'),
  isRemoteProceeding: z.boolean(),
  actualStartTime: z.string().min(1, 'Actual start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  reportWaitTime: z.string().optional(),

  // Resource Info
  reporter: z.string().min(1, 'Reporter name is required'),
  reporterEmail: z.string().email('Invalid email address'),
  reporterCell: z.string().min(1, 'Cell number is required'),
  videographerQuality: z.boolean().optional(),

  // Case Info
  courtNumber: z.string().min(1, 'Court number is required'),
  countyDistrict: z.string().min(1, 'County/District is required'),
  trialDate: z.string().min(1, 'Trial date is required'),
  causeNumber: z.string().min(1, 'Cause number is required'),
  style: z.string().min(1, 'Style is required'),

  // Witness Info
  witnessName: z.string().min(1, 'Witness name is required'),
  witnessEmail: z.string().email('Invalid email address'),
  witnessType: z.enum(['Party', 'Fact', 'Expert']),
  isNoShow: z.boolean(),
  isCNA: z.boolean(),
  hasAttorney: z.boolean(),
  isAttorneyPresent: z.boolean(),
  requiresReadAndSign: z.boolean(),
  witnessAttorneyEmail: z.string().email('Invalid email address').optional(),

  // Original Transcript Info
  isRush: z.boolean(),
  dueDate: z.string().min(1, 'Due date is required'),
  totalPages: z.string().min(1, 'Total pages is required'),
  testimonyTypes: z.object({
    regular: z.boolean(),
    technical: z.boolean(),
    video: z.boolean(),
    interpreter: z.boolean(),
    realtime: z.boolean(),
    roughDraft: z.boolean(),
    recordingTranscription: z.boolean(),
  }),
  transcriptionListeningHours: z.string().optional(),

  // Original Exhibits Info
  exhibitsMarked: z.string().optional(),
  exhibitsThrough: z.string().optional(),
  totalExhibits: z.string().optional(),
  receivedVia: z.enum(['Paper', 'Electronic']).optional(),
  attachToTranscript: z.boolean(),
  returnTo: z.string().optional(),

  // Expense Reimbursement
  expenses: z.object({
    parking: z.string().optional(),
    travel: z.string().optional(),
    mileage: z.string().optional(),
    shipping: z.string().optional(),
    other: z.string().optional(),
  }),

  // Other Instructions
  specialInstructions: z.string().optional(),
});

export type JobFormData = z.infer<typeof jobFormSchema>; 
import { z } from 'zod';

export const registerCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(8)
  })
});

export const companyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const submitKycSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    doc_type: z.string().min(1),
    storage_url: z.string().url()
  })
});

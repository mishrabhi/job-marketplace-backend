import { z } from 'zod';

export const generateOfferSchema = z.object({
  application_id: z.string().uuid({ message: "Valid Application identifier UUID required" }),
  student_id: z.string().uuid({ message: "Valid Student identifier UUID required" }),
  company_name: z.string().min(1, { message: "Company name cannot be blank" }),
  ctc_paise: z.number().positive({ message: "CTC must be represented in positive Paise denominations" }),
  role_title: z.string().min(1, { message: "Role description field required" }),
  valid_until: z.string().datetime({ message: "Expiration window must reflect strict ISO 8601 timestamps" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const chooseEsignSchema = z.object({
  offer_id: z.string().uuid({ message: "Valid Target Offer Identifier UUID required" }),
  provider_selected: z.enum(['aadhaar_digital_io', 'docusign', 'custom_crypto_keys'], {
    errorMap: () => ({ message: "Must match standard compliance provider integrations" })
  })
});
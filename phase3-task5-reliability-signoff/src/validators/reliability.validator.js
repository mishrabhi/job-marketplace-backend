import { z } from 'zod';

export const executeConcurrencyTestSchema = z.object({
  test_suite_token: z.string().min(1, { message: "Unique test run identifier token required" }),
  application_id: z.string().uuid({ message: "Valid target application UUID required" }),
  concurrent_requests: z.number().int().min(2, { message: "Concurrency assertion requires at least 2 parallel requests" }),
  idempotency_key: z.string().min(1, { message: "Shared idempotency key required to test deduplication" })
});

export const commitSignoffSchema = z.object({
  signed_off_by: z.string().uuid({ message: "Valid signing engineer/lead identifier UUID required" }),
  regression_tests_passed: z.boolean().refine(val => val === true, {
    message: "Regression testing suite must pass completely prior to scale sign-off"[cite: 21]
  }),
  concurrency_proof_meta: z.object({
    max_concurrent_burst: z.number().int().positive(),
    zero_double_charge_verified: z.boolean()
  }),
  evidence_notes: z.string().min(10, { message: "Detailed verification notes must be at least 10 characters" }),
  idempotency_key: z.string().min(1, { message: "Idempotency validation token required" })
});
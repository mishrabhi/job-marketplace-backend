import * as partnerService from '../services/partner.service.js';
import { registerPartnerSchema, triggerWebhookSchema, verifySignatureSchema } from '../validators/partner.validator.js';

export const handleRegisterPartner = async (req, res, next) => {
  try {
    const validatedBody = registerPartnerSchema.parse(req.body);
    const result = await partnerService.createPartnerCredentials(validatedBody);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleTriggerWebhook = async (req, res, next) => {
  try {
    const validatedBody = triggerWebhookSchema.parse(req.body);
    const partnerContext = req.partnerContext;
    const dispatchResult = await partnerService.dispatchSignedWebhook(partnerContext, validatedBody);
    return res.status(200).json({ success: true, data: dispatchResult });
  } catch (err) {
    next(err);
  }
};

export const handleVerifySignature = async (req, res, next) => {
  try {
    const validatedBody = verifySignatureSchema.parse(req.body);
    const isValid = partnerService.verifyWebhookSignature(
      validatedBody.raw_payload,
      validatedBody.signature_header,
      validatedBody.webhook_secret
    );
    return res.status(200).json({ success: true, is_valid_signature: isValid });
  } catch (err) {
    next(err);
  }
};
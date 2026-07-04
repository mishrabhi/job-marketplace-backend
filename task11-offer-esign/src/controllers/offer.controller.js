import * as offerService from '../services/offer.service.js';
import { generateOfferSchema, chooseEsignSchema } from '../validators/offer.validator.js';

export const executeGenerationPipeline = async (req, res, next) => {
  try {
    const validatedData = generateOfferSchema.parse(req.body);
    const offerDetails = await offerService.createOfferRecord(validatedData);
    return res.status(201).json({ success: true, data: offerDetails });
  } catch (err) {
    next(err);
  }
};

export const lockSignApproach = async (req, res, next) => {
  try {
    const validatedPayload = chooseEsignSchema.parse(req.body);
    const configuredMeta = await offerService.configureEsignApproach(
      validatedPayload.offer_id,
      validatedPayload.provider_selected
    );
    return res.status(200).json({ success: true, data: configuredMeta });
  } catch (err) {
    next(err);
  }
};
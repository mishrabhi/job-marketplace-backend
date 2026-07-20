import * as outboxService from '../services/outbox.service.js';
import { emitEventSchema, replayEventsSchema } from '../validators/outbox.validator.js';

export const stageEventEmission = async (req, res, next) => {
  try {
    const validatedBody = emitEventSchema.parse(req.body);
    const resultRecord = await outboxService.publishToOutbox(validatedBody);
    return res.status(201).json({ success: true, data: resultRecord });
  } catch (err) {
    next(err);
  }
};

export const triggerOutboxWorker = async (req, res, next) => {
  try {
    const dispatchReport = await outboxService.processPendingOutboxQueue();
    return res.status(200).json({ success: true, data: dispatchReport });
  } catch (err) {
    next(err);
  }
};

export const executeStreamReplay = async (req, res, next) => {
  try {
    const validatedQueries = replayEventsSchema.parse(req.query);
    const replayReport = await outboxService.replayEventsFromSequence(validatedQueries.from_sequence_number);
    return res.status(200).json({ success: true, data: replayReport });
  } catch (err) {
    next(err);
  }
};
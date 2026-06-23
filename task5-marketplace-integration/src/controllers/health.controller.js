import IntegrationService from '../services/integration.service.js';

export default class HealthController {
  static async health(req, res) {
    const health = await IntegrationService.getHealth();
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json({ success: health.status === 'ok', data: health });
  }

  static async ready(req, res) {
    const ready = await IntegrationService.getReadiness();
    const statusCode = ready.status === 'ready' ? 200 : 503;
    res.status(statusCode).json({ success: ready.status === 'ready', data: ready });
  }
}

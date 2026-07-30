import express from 'express';
const router = express.Router();
import * as rbacController from '../controllers/rbac.controller.js';
import { enforceRBAC } from '../middlewares/rbacAuth.js';

// Dossiers protected by tenant boundary + granular RBAC permission check[cite: 18]
router.post('/dossiers', enforceRBAC('DOSSIERS_WRITE'), rbacController.handleCreateDossier);
router.get('/dossiers', enforceRBAC('DOSSIERS_READ'), rbacController.handleGetDossiers);

// Cross-tenant isolation attack simulation endpoint[cite: 18]
router.get('/dossiers/attack-test', enforceRBAC('DOSSIERS_READ'), rbacController.handleSimulateAttack);

// Assign role membership endpoint[cite: 18]
router.post('/roles/assign', rbacController.handleAssignRole);

export default router;
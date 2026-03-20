import express from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { StatsController } from './stats.controller';

const router = express.Router();

router.get(
	'/',
	checkAuth(Role.ADMIN, Role.PROVIDER, Role.USER),
	StatsController.getDashboardStats,
);


export const statsRoute = router;
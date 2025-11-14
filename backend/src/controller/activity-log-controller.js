import ActivityLogService from "../service/activity-log-service.js";

export default class ActivityLogController {
    constructor() {
        this.activityLogService = new ActivityLogService();
    }

    async getActivityLogs(req, res, next) {
        try {
            const userId = req.user.id;
            const { limit } = req.query;

            const result = await this.activityLogService.getActivityLogs(
                userId,
                limit ? parseInt(limit) : 50
            );

            res.status(200).json({
                success: true,
                logs: result
            });
        } catch (error) {
            next(error);
        }
    }
}



const logger = require("app/lib/logger");
const PLAN_STATUS = require('../const').PLAN_STATUS;
const StakingPlans = require("app/model").erc20_staking_plans;

async function getAllPlans(req, res, next) {
    try {
        var status = req.query.status || PLAN_STATUS.all;
        var staking_platform_id = req.query.staking_platform_id;

        var filter = { order: ['created_at'] };
        var where = {};

        if (status == PLAN_STATUS.active) {
            where['status'] = 1;
        } else if (status == PLAN_STATUS.deactive) {
            where['status'] = 0;
        }

        if (staking_platform_id) {
            where['staking_platform_id'] = staking_platform_id;
        }

        filter['where'] = where;
        filter['attributes'] = [
            "id",
            "name",
            "duration",
            "duration_type",
            "reward_percentage",
            "status",
            "reward_diff_token_flg",
            "erc20_staking_payout_id",
            "diff_token_rate",
            "tx_id",
            "wait_blockchain_confirm_status_flg",
            "staking_platform_id",
            "created_at"
        ];

        var plans = await StakingPlans.findAll(filter, { raw: true })
        res.ok(plans)
    } catch (err) {
        logger.error(err);
        next(err);
    }
}

async function insertPlan(req, res, next) {
    throw "NOT IMPLEMENT"
}
async function updatePlan(req, res, next) {
    throw "NOT IMPLEMENT"
}
module.exports = {
    getAllPlans: getAllPlans,
    insertPlan: insertPlan,
    updatePlan: updatePlan
}
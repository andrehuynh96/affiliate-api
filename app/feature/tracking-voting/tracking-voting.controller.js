const logger = require("app/lib/logger");
const config = require("app/config");
const TrackingVote = require("app/model").tracking_votes;
const PartnerMeno = require("app/model").partner_tx_memos;

module.exports = async (req, res, next) => {
  try {
    let memo = await PartnerMeno.findOne({
      where: {
        memo: req.body.memo,
        partner_id: req.user.client_id
      }
    });

    if (!memo) {
      return res.badRequest(res.__("NOT_FOUND_MEMO"), "NOT_FOUND_MEMO");
    }

    let old = await TrackingVote.findOne({
      where: {
        tx_id: req.body.tx_id,
        platform: memo.platform
      }
    });
    if (old) {
      return res.badRequest(res.__("TX_REGISTERED_ALREADY"), "TX_REGISTERED_ALREADY");
    }

    let result = await TrackingVote.create({
      tx_id: req.body.tx_id,
      voter_address: req.body.voter_address,
      platform: memo.platform,
      partner_id: req.user.client_id,
      memo: req.body.memo,
      type: req.body.type,
    });
    if (result) {
      return res.ok(true);
    }

    return res.serverInternalError();
  }
  catch (err) {
    logger.error("tracking voting fail:", err);
    next(err);
  }
}
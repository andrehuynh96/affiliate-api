const db = require("app/model").sequelize;

async function getDeposit(where, offset, limit) {
    var q = `
        SELECT 
            extract(epoch from d.block_time) as block_time,
            d.block_number,
            d.block_hash,
            d.transaction_index,
            d.transaction_hash,
            d.deposit_id,
            d.token_addr,
            d.depositor,
            d.token_amount,
            d.pool_id,
            d.plan_id,
            d.partner_id,
            d.log_index,
            extract(epoch from w.block_time) as "withdrawData_block_time",
            w.block_number as "withdrawData_block_number",
            w.block_hash as "withdrawData_blockHash",
            w.transaction_index as "withdrawData_transactionIndex",
            w.transaction_hash as "withdrawData_transactionHash",
            w.log_index as "withdrawData_logIndex",
            w.deposit_id as "withdrawData_depositId",
            w.token_addr as "withdrawData_token_addr",
            w.depositor_addr as "withdrawData_depositor_addr",
            w.recipient_addr as "withdrawData_recipient_addr",
            w."amount" as "withdrawData_amount"               
        FROM erc20_deposits as d
        LEFT JOIN erc20_withdraws as w
            ON d.deposit_id = w.deposit_id
        WHERE 1=1 ${where}
        ORDER BY d.block_number DESC,
                d.transaction_index DESC,
                d.log_index DESC
        OFFSET ${offset}
        LIMIT ${limit}
    `;
    var rs = await db.query(q, { type: db.QueryTypes.SELECT });
    if (rs) {

        rs = _formatWithdrawData(rs);
    }
    return rs;
}

function _formatWithdrawData(data) {
    var prefix = 'withdrawData_'
    var transformed = data.map((row) => {
        var withdraw = {}
        for (var k in row) {
            if (k.startsWith("withdrawData_")) {
                withdraw[k.substr(prefix.length)] = row[k];
                delete row[k];
            }
        }
        row.withdraw = withdraw;
        if (!row.withdraw.block_number) {
            row.withdraw = null
        }
        return row;
    });

    return transformed;
}

async function getHistoryOfAddress(where, withdrawWhere, offset, limit) {
    //TODO: UNION query's performance is not good with a large data
    var q = `
        SELECT * FROM (
            SELECT extract(epoch from block_time) as block_time, block_number, block_hash, transaction_hash, transaction_index, log_index, deposit_id, token_addr, depositor_addr, recipient_addr, amount, 'withdraw' AS type FROM erc20_withdraws WHERE ${withdrawWhere}
            UNION
            SELECT extract(epoch from block_time) as block_time, block_number, block_hash, transaction_hash, transaction_index, log_index, deposit_id, token_addr, depositor as depositor_addr, '' as recipient_addr, token_amount as amount, 'deposit' AS type FROM erc20_deposits WHERE ${where}
        ) AS d
        ORDER BY d.block_number DESC,
                d.transaction_index DESC,
                d.log_index DESC
        OFFSET ${offset}
        LIMIT ${limit}
    `;
    var rs = await db.query(q, { type: db.QueryTypes.SELECT });
    return rs;
}

// Get aggregation info of an address
async function getAggregationInfoOfAddr(depositorAddr, tokenAddr) {
    var where = '';
    if (tokenAddr) {
        where = `WHERE t.token_addr = '${tokenAddr}'`;
    }
    var q = `
        SELECT t.token_addr, sum(t.deposit_amount) as total_deposit, sum(t.withdraw_amount) as total_withdraw, sum(t.reward) as total_reward
        FROM (

            SELECT  d.token_addr, d.token_amount as deposit_amount, w.amount as withdraw_amount, d.token_amount*p.reward_percentage/100 * rc.commission/100 as reward
            FROM erc20_deposits d
            LEFT JOIN erc20_withdraws w
            ON d.deposit_id = w.deposit_id
            JOIN erc20_staking_plans p
            ON d.plan_id=p.id
            JOIN staking_reward_cfgs rc
            ON p.staking_platform_id = rc.staking_platform_id
            WHERE d.depositor = '${depositorAddr}'
            
        ) t
        ${where}
        GROUP BY t.token_addr
    `;
    var rs = await db.query(q, { type: db.QueryTypes.SELECT });
    return rs;
}

module.exports = {
    getHistoryOfAddress: getHistoryOfAddress,
    getDeposit: getDeposit,
    getAggregationInfoOfAddr: getAggregationInfoOfAddr
}
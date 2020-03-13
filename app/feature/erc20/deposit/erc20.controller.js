
const db = require('../db');

async function getDeposit(req, res, next) {
    var depositor_address = req.query.depositor_address;
    var deposit_id = req.query.deposit_id;
    var token_address = req.query.token_address;
    var offset = req.query.offset;
    var limit = req.query.limit;
    var where = '';
    if (depositor_address) {
        where += ` AND d.depositor = '${depositor_address}'`;
    }
    if (token_address) {
        where += ` AND d.token_addr = '${token_address}'`;
    }
    if (deposit_id >= 0) {
        where += ` AND d.deposit_id = ${deposit_id}`;
    }

    try {
        var deposit = await db.getDeposit(where, offset, limit);
        res.ok(deposit);
    } catch (err) {
        next(err);
    }
}

async function getHistoryOfAddress(req, res, next) {
    var depositor_address = req.query.depositor_address;
    var token_address = req.query.token_address;
    var offset = req.query.offset;
    var limit = req.query.limit;
    var where = '1=1';
    var withdrawWhere = '1=1'; 
    if (depositor_address) {
        where += ` AND depositor = '${depositor_address}'`;
        withdrawWhere += ` AND depositor_addr = '${depositor_address}'`;
    }
    if (token_address) {
        where += ` AND token_addr = '${token_address}'`;
        withdrawWhere += ` AND token_addr = '${token_address}'`;
    }

    try {
        var history = await db.getHistoryOfAddress(where, withdrawWhere, offset, limit);
        res.ok(history);
    } catch (err) {
        next(err);
    }
}

async function getAggregationInfoOfAddr(req, res, next) {
    var depositor_address = req.query.depositor_address;
    var token_address = req.query.token_address;
    
    try {
        var history = await db.getAggregationInfoOfAddr(depositor_address, token_address);
        res.ok(history);
    } catch (err) {
        next(err);
    }
}


module.exports = {
    getDeposit: getDeposit,
    getHistoryOfAddress: getHistoryOfAddress,
    getAggregationInfoOfAddr: getAggregationInfoOfAddr
}
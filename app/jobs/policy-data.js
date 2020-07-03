class PolicyData {

  constructor({
    stakerId,
    amount,
    affiliateRequestDetails,
    referrerList,
    policy,
    affiliateTypeId,
    currencySymbol,
  }) {

    this.stakerId = stakerId;
    this.amount = amount;
    this.affiliateRequestDetails = affiliateRequestDetails;
    this.referrerList = referrerList;
    this.policy = policy;
    this.affiliateTypeId = affiliateTypeId;
    this.currencySymbol = currencySymbol;
    this.rewards = [];
  }
}

module.exports = PolicyData;

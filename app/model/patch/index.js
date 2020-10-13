const updateMembershipTreeChartPatch = require('app/model/patch/update-membership-tree-chart');
const syncClientForMembershipNetworkPatch = require('app/model/patch/sync-client-for-membership-network');

module.exports = async () => {
  // await syncClientForMembershipNetworkPatch();

  setTimeout(async () => {
    await updateMembershipTreeChartPatch();
  }, 5 * 1000);
};
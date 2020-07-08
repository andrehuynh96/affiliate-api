const _ = require('lodash');
const { Container, Service } = require('typedi');
const { ORG_UNIT } = require('app/constants');
const mapper = require('app/response-schema/client.response-schema');
const inviteeMapper = require('app/response-schema/invitee.response-schema');

const clientHelper = {
  buildTree(clientAffiliate, descendants) {
    const allItems = descendants.concat(clientAffiliate).map(x => {
      return {
        ...inviteeMapper(x),
        referrer_client_affiliate_id: x.referrer_client_affiliate_id,
        ext_client_id: x.extClientId,
        client_id: x.client_id,
        level: x.level,
        id: x.id,
      };
    });

    const cache = _.reduce(allItems, (val, item) => {
      val[item.id] = item;
      item.children = [];

      return val;
    }, {});

    allItems.forEach((item) => {
      item.parent = item.referrer_client_affiliate_id ? cache[item.referrer_client_affiliate_id] : null;

      if (item.parent) {
        item.parent.children.push(item);
      }
    });

    allItems.forEach((item) => {
      item.parent = null;
    });

    const roootNode = allItems.find(x => x.id === clientAffiliate.id);

    return roootNode;
  },
  treeToList(node, nodes, ignoredId) {
    if (node.id === ignoredId) {
      return;
    }

    nodes.push(node);

    if (node.children.length > 0) {
      node.children = _.sortBy(node.children, x => x.name);

      node.children.forEach(childNode => clientHelper.treeToList(childNode, nodes, ignoredId));
    }

    node.children = null;
  },
  getAllNodes(node, nodes) {
    nodes.push(node);

    if (node.children.length > 0) {
      node.children.forEach(childNode => clientHelper.getAllNodes(childNode, nodes));
    }
  },
  getRootOrgUnitListHasSystemAdminOU(orgUnitList) {
    const idCache = _.keyBy(orgUnitList, 'id');
    const systemAdminOrgUnitList = orgUnitList.filter(x => x.actived_flg && x.name === ORG_UNIT.SystemAdmin);
    const rootOrgUnitList = [];

    orgUnitList.forEach((item) => {
      item.parent = item.referrer_client_affiliate_id ? idCache[item.referrer_client_affiliate_id] : null;
    });

    systemAdminOrgUnitList.forEach((systemAdminOrgUnit) => {
      let parentOU = null;
      do {
        parentOU = systemAdminOrgUnit.parent;
        if (!parentOU || !parentOU.actived_flg) {
          break;
        }

        if (parentOU.level === 1) {
          rootOrgUnitList.push(parentOU);

          break;
        }

      } while (parentOU);
    });

    return rootOrgUnitList;
  },

};

module.exports = clientHelper;

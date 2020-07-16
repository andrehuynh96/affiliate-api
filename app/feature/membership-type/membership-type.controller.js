const typedi = require('typedi');
const _ = require('lodash');
const config = require('app/config');
const {
    MembershipTypeService
} = require('app/services');
const Container = typedi.Container;

module.exports = {
    updateMembershipType: async (req, res, next) => {
        const logger = Container.get('logger');

        try {
            logger.info('updateMembershipTypes');
            const { body } = req;
            const membershipTypesService = Container.get(MembershipTypeService);
            const membershipTypes = body.membershipTypes;
            const membershipTypeIds = membershipTypes.map(item => item.id);
            const membershipTypesAlready = await MembershipTypeService.findAll({
                id: membershipTypeIds
            });
            const availableMembershipTypes = [];
            const unavailableMembershipTypes = [];
            if (membershipTypesAlready.length > 0) {
                membershipTypesAlready.forEach(item => {
                    const availableMembershipType = membershipTypes.find(x => x.id === item.id);
                    if (availableMembershipType) {
                        availableMembershipTypes.push(availableMembershipType);
                    }
                });

                membershipTypes.forEach(item => {
                    const isUnavailableMembershipType = membershipTypesAlready.every(x => x.id !== item.id);
                    if (isUnavailableMembershipType) {
                        unavailableMembershipTypes.push(item);
                    }
                });

                const membershipTypesUpdateData = await _pushDataMembershipType(availableMembershipTypes);
                const membershipTypesInsertData = await _pushDataMembershipType(unavailableMembershipTypes);

                const availableIds = membershipTypesUpdateData.map(item => item.id);
                const unavailableIds = membershipTypesInsertData.map(item => item.id);
                return res.ok(availableIds,unavailableIds);
            }
            else {
               const membershipTypesInsertData = await _pushDataMembershipType(membershipTypes);
               const unavailableIds = membershipTypesInsertData.map(item => item.id);
                return res.ok(unavailableIds);
            }
            // return res.ok(true);
        }
        catch (error) {
            logger.error(error);
            next(error);
        }
    }
};
async function _pushDataMembershipType(membershipTypes){
    const membershipTypesPreData = [];
    membershipTypes.forEach(item => {
        membershipTypesPreData.push({
            name: item.name,
            price: item.price,
            currency_symbol: item.currency_symbol,
            type: item.type,
            display_order: item.display_order,
            is_enabled: item.is_enabled,
            deleted_flg: item.deleted_flg
        });
    });
    return membershipTypesPreData;
}

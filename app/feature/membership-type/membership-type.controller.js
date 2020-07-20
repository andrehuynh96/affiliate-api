const typedi = require('typedi');
const _ = require('lodash');
const config = require('app/config');
const db = require('app/model');
const {
    MembershipTypeService
} = require('app/services');
const Container = typedi.Container;

module.exports = {
    updateMembershipTypeConfig: async (req, res, next) => {
        const logger = Container.get('logger');

        try {
            logger.info('updateMembershipTypes');
            const { body } = req;
            const membershipTypesService = Container.get(MembershipTypeService);
            const membershipTypes = body.membershipTypes;
            const membershipTypesAlready = await membershipTypesService.findAll({});
            const membershipTypesUpdateData = [];
            let membershipTypesInsertData = [];
            if (membershipTypesAlready.length > 0) {

                membershipTypes.forEach(item => {
                    const isUnavailableMembershipType = membershipTypesAlready.every(x => x.id !== item.id);
                    if (isUnavailableMembershipType) {
                        membershipTypesInsertData.push(item);
                    }
                });

                membershipTypesAlready.forEach(item => {
                    const availableMembershipType = membershipTypes.find(x => x.id === item.id);
                    if (availableMembershipType) {
                        membershipTypesUpdateData.push(availableMembershipType);
                    }
                });
            }
            else {
                membershipTypesInsertData = membershipTypes;
            }
            const transaction = await db.sequelize.transaction();
            try {
                if (membershipTypesInsertData.length > 0) {
                    await membershipTypesService.bulkCreate(membershipTypesInsertData, { transaction });
                }
                if (membershipTypesUpdateData.length > 0) {
                    for (const item of membershipTypesUpdateData) {
                      const cond = {
                            id: item.id
                        };
                        delete item.id;
                        await membershipTypesService.updateWhere(cond, item, { transaction });
                    }
                }
                await transaction.commit();
                return res.ok(true);

            } catch (error) {
                await transaction.rollback();
                logger.error(error);
                throw error;
            }
        }
        catch (error) {
            logger.error(error);

            next(error);
        }
    }
};

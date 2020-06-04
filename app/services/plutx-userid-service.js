const _ = require('lodash');
const { Container, Service } = require('typedi');
const config = require('app/config');
const axios = require('axios');
const logger = require('app/lib/logger');

const API_URL = config.plutxUserID.apiUrl;

class _PluTXUserIDService {

  constructor() {
    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');

    this.rootOrgUnitId = null;
  }

  async init() { }

  async importUser({ email, password, createdAt, updatedAt, emailConfirmed, isActived }) {
    try {
      const accessToken = await this.getToken();
      const result = await axios.post(`${API_URL}/api/v1/users/import`,
        {
          email,
          password,
          created_at: createdAt,
          updated_at: updatedAt,
          email_confirmed_flg: !!emailConfirmed,
          actived_flg: !!isActived,
          org_units: [
            {
              name: 'Member',
              is_belong: true
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        });

      return { httpCode: 200, data: result.data.data };
    }
    catch (err) {
      logger.error('Register client fail:', err);

      return { httpCode: err.response.status, data: err.response.data };
    }
  }

  async register({ email, password, createdAt, emailConfirmed, isActived }) {
    try {
      const accessToken = await this.getToken();
      const result = await axios.post(`${API_URL}/api/v1/users/register`,
        {
          email,
          password,
          created_at: createdAt,
          email_confirmed_flg: !!emailConfirmed,
          actived_flg: !!isActived,
          org_units: [
            {
              name: 'Member',
              is_belong: true
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        });

      return { httpCode: 200, data: result.data.data };
    }
    catch (err) {
      logger.error('Register client fail:', err);

      return { httpCode: err.response.status, data: err.response.data };
    }
  }

  async activeNewUser(userId) {
    try {
      const accessToken = await this.getToken();
      const result = await axios.put(`${API_URL}/api/v1/users/${userId}/active-new-user`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        });

      return { httpCode: 200, data: result.data.data };
    }
    catch (err) {
      logger.error('Register client fail:', err);

      return { httpCode: err.response.status, data: err.response.data };
    }
  }

  async login(email, password) {
    try {
      const accessToken = await this.getToken();
      const result = await axios.post(`${API_URL}/api/v1/auth/token`,
        {
          grant_type: 'password',
          email,
          password,
          api_key: config.plutxUserID.apiKey,
          secret_key: config.plutxUserID.secretKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        });

      return { httpCode: 200, data: result.data.data };
    }
    catch (err) {
      logger.error('Login fail:', err);

      return { httpCode: err.response.status, data: err.response.data };
    }
  }

  async setNewPassword(userId, password) {
    try {
      const accessToken = await this.getToken();
      const result = await axios.put(`${API_URL}/api/v1/users/${userId}/set-new-password`,
        {
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        });

      return { httpCode: 200, data: result.data.data };
    }
    catch (err) {
      logger.error('Set new password fail:', err);

      return { httpCode: err.response.status, data: err.response.data };
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const accessToken = await this.getToken();
      const result = await axios.put(`${API_URL}/api/v1/users/${userId}/change-password`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          }
        });

      return { httpCode: 200, data: result.data.data };
    }
    catch (err) {
      logger.error('Change password fail:', err);

      return { httpCode: err.response.status, data: err.response.data };
    }
  }

  async getToken() {
    const key = this.redisCacherService.getCacheKey('PluTX-UserID-Token', {});
    let accessToken = await this.redisCacherService.get(key);
    if (accessToken) {
      return accessToken;
    }

    const result = await axios.post(
      `${API_URL}/api/v1/auth/token`,
      {
        api_key: config.plutxUserID.apiKey,
        secret_key: config.plutxUserID.secretKey,
        grant_type: 'client_credentials'
      }
    );
    const data = result.data.data;
    this.rootOrgUnitId = data.root_org_unit_id;
    accessToken = data.access_token;

    await this.redisCacherService(key, accessToken, Math.max(data.expires_in - 2, 1));

    return accessToken;
  }

}

const PluTXUserIDService = Service([], () => {
  const service = new _PluTXUserIDService();

  return service;
});


module.exports = PluTXUserIDService;

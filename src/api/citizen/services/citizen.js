'use strict';

/**
 * citizen service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::citizen.citizen');

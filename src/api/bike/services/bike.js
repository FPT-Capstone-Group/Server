'use strict';

/**
 * bike service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bike.bike');

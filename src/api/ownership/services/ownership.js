'use strict';

/**
 * ownership service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ownership.ownership');

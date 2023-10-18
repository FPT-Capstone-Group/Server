'use strict';

/**
 * package-fee service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::package-fee.package-fee');

'use strict';

/**
 * parking-session service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::parking-session.parking-session');

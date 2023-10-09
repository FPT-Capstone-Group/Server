'use strict';

/**
 * bike controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bike.bike');

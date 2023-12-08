const Joi = require("joi");

export const getOtherUserProfile = {
  body: {
    userId: Joi.number().required(),
  },
};

export const changePassword = {
  body: {
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  },
};

export const register = {
  body: {
    username: Joi.string()
      .regex(/^(08|09|03|02|07)\d{8}$/) // joi doesn't support regex for phone number
      .required(),
    password: Joi.string().required(),
  },
};

export const login = {
  body: {
    username: Joi.string()
      .regex(/^(08|09|03)\d{8}$/) // joi doesn't support regex for phone number
      .required(),
    password: Joi.string().required(),
  },
};

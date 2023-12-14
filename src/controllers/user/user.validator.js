const Joi = require("joi");

const getOtherUserProfile = {
    body: {
        userId: Joi.number().required(),
    },
};

const changePassword = {
    body: {
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
    },
};

const register = {
    body: {
        username: Joi.string()
            .regex(/^(08|09|03|02|07)\d{8}$/) // joi doesn't support regex for phone number
            .required(),
        password: Joi.string().required(),
    },
};

const login = {
    body: {
        username: Joi.string()
            .regex(/^(08|09|03)\d{8}$/) // joi doesn't support regex for phone number
            .required(),
        password: Joi.string().required(),
    },
};
module.exports = {
    getOtherUserProfile,
    changePassword,
    register,
    login
}

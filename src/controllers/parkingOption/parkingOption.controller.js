// parkingOption.controller.js
const {ParkingOption} = require("../../models");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");
const {Op} = require("sequelize");
// Sub function
const formatParkingOption = (parkingOption) => {
    return {
        ...parkingOption.toJSON(),
        createdAt: formatToMoment(parkingOption.createdAt),
        updatedAt: formatToMoment(parkingOption.updatedAt),
    };
};

const mandatoryOptions = ['maximumOwnerLimit', 'daysBeforeExpired'];

const getAllParkingOptions = async (req, res) => {
    try {
        const parkingOptions = await ParkingOption.findAll();
        // const formattedParkingOptions = parkingOptions.map((parkingOption) => formatParkingOption(parkingOption));

        return successResponse(req, res, parkingOptions, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
}

const createParkingOption = async (req, res) => {
    try {
        const {parkingOptionKey, parkingOptionValue, notes} = req.body;

        const existingParkingOption = await ParkingOption.findByPk(parkingOptionKey);
        if (existingParkingOption) {
            return errorResponse(req, res, "Parking option already exists", 400);
        }

        const newParkingOption = await ParkingOption.create({
            parkingOptionKey,
            parkingOptionValue,
            notes,
        });

        return successResponse(
            req,
            res,
            newParkingOption,
            201
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
}

const updateParkingOption = async (req, res) => {
    try {
        const {parkingOptionKey, parkingOptionValue, notes} = req.body;

        const existingParkingOption = await ParkingOption.findByPk(parkingOptionKey);
        if (!existingParkingOption) {
            return errorResponse(req, res, "Parking option not found", 400);
        }

        const updatedParkingOption = await ParkingOption.update({
            parkingOptionValue,
            notes,
        }, {
            where: {
                parkingOptionKey,
            }
        });

        // const formattedParkingOption = formatParkingOption(updatedParkingOption);
        return successResponse(
            req,
            res,
            updatedParkingOption,
            201
        );

    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
}


module.exports = {
    getAllParkingOptions,
    createParkingOption,
    updateParkingOption,
};

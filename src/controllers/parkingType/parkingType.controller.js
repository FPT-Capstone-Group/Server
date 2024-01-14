// controllers/parkingTypeController.js
const {ParkingType, ParkingSession, Card} = require("../../models");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");
const {Op} = require("sequelize");

// Sub function
const formatParkingType = (parkingType) => {
    const formattedParkingType = {
        ...parkingType.toJSON(),
        createdAt: formatToMoment(parkingType.createdAt),
        updatedAt: formatToMoment(parkingType.updatedAt),
    };
    return formattedParkingType;
};

// Main functions
const createParkingType = async (req, res) => {
    try {
        const {parkingTypeName, parkingTypeGroup, parkingTypeFee, description} = req.body;

        const existingActiveParkingType = await ParkingType.findOne({
            where: {
                parkingTypeName,
                parkingTypeStatus: 'active'
            },
        });
        if (existingActiveParkingType) {
            return errorResponse(req, res, "Parking type already exists and active", 400);
        }

        const newParkingType = await ParkingType.create({
            parkingTypeName,
            parkingTypeGroup,
            parkingTypeFee,
            description,
        });

        const formattedParkingType = formatParkingType(newParkingType);

        return successResponse(
            req,
            res,
            {parkingType: formattedParkingType},
            201
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getAllParkingTypes = async (req, res) => {
    try {
        const parkingTypes = await ParkingType.findAll();

        if (!parkingTypes || parkingTypes.length === 0) {
            return successResponse(req, res, "No parking types available");
        }

        const formattedParkingTypes = parkingTypes.map((parkingType) =>
            formatParkingType(parkingType)
        );

        return successResponse(
            req,
            res,
            {parkingTypes: formattedParkingTypes},
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getNonGuestParkingTypes = async (req, res) => {
    try {
        const parkingTypes = await ParkingType.findAll(
            {
                where: {
                    parkingTypeGroup: {
                        [Op.ne]: 'guest'
                    }
                }
            }
        );

        if (!parkingTypes || parkingTypes.length === 0) {
            return successResponse(req, res, "No parking types available");
        }

        const formattedParkingTypes = parkingTypes.map((parkingType) =>
            formatParkingType(parkingType)
        );

        return successResponse(
            req,
            res,
            {parkingTypes: formattedParkingTypes},
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getParkingTypeById = async (req, res) => {
    try {
        const {parkingTypeId} = req.params;

        const parkingType = await ParkingType.findByPk(parkingTypeId);

        if (!parkingType) {
            return errorResponse(req, res, "Parking type not found", 404);
        }

        const formattedParkingType = formatParkingType(parkingType);

        return successResponse(
            req,
            res,
            {parkingType: formattedParkingType},
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const updateParkingTypeById = async (req, res) => {
    try {
        const t = await sequelize.transaction();

        const {parkingTypeId, parkingTypeName, parkingTypeGroup, parkingTypeFee, description} = req.body;

        const parkingType = await ParkingType.findByPk(parkingTypeId);

        if (!parkingType) {
            return errorResponse(req, res, "Parking type not found", 404);
        }

        const newParkingType = await ParkingType.create({
                parkingTypeName,
                parkingTypeStatus: 'active',
                parkingTypeGroup,
                parkingTypeFee,
                description,
            },
            {transaction: t});

        // Update old parkingType status attributes
        parkingType.parkingTypeStatus = 'inactive';
        await parkingType.save({transaction: t});

        await t.commit();
        const formattedParkingType = formatParkingType(newParkingType);

        return successResponse(
            req,
            res,
            {parkingType: formattedParkingType},
            200
        );
    } catch (error) {
        console.error(error);
        t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};
const deleteParkingTypeById = async (req, res) => {
    try {
        const {parkingTypeId} = req.params;

        const parkingType = await ParkingType.findByPk(parkingTypeId);

        if (!parkingType) {
            return errorResponse(req, res, "Parking type not found", 404);
        }

        // Check if there are associated ParkingSessions or Cards
        const associatedParkingSessions = await ParkingSession.findOne({
            where: {parkingTypeId},
        });
        const associatedCards = await Card.findOne({where: {parkingTypeId}});

        if (associatedParkingSessions || associatedCards) {
            return errorResponse(
                req,
                res,
                "Cannot delete parking type with associated sessions or cards",
                400
            );
        }

        await parkingType.destroy();

        return successResponse(req, res, "Parking type deleted successfully", 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

module.exports = {
    createParkingType,
    getAllParkingTypes,
    getParkingTypeById,
    updateParkingTypeById,
    deleteParkingTypeById,
    getNonGuestParkingTypes
};

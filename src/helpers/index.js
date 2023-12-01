require ('./fee_calculate')
const {calculateParkingFee} = require("./fee_calculate");
const successResponse = (req, res, data, code = 200) =>
  res.send({
    code,
    data,
    success: true,
  });

const errorResponse = (
  req,
  res,
  errorMessage = "Something went wrong",
  code = 500,
  error = {}
) =>
  res.status(500).json({
    code,
    errorMessage,
    error,
    data: {},
    success: false,
  });
const validateUsername = (username) => {
  const re = /^(08|09|03)\d{8}$/;
  return re.test(username);
};

const validateFields = (object, fields) => {
  const errors = [];
  fields.forEach((f) => {
    if (!(object && object[f])) {
      errors.push(f);
    }
  });
  return errors.length ? `${errors.join(", ")} are required fields.` : "";
};

const uniqueId = (length = 13) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


module.exports = {
  successResponse,
  errorResponse,
  validateUsername,
  validateFields,
  uniqueId,
    calculateParkingFee,
};

"use strict";
//  Remove approvedBy field in Application and make email not required in User
module.exports = {
  async up(queryInterface) {
    // Modify the User table to make the email field not required
    await queryInterface.changeColumn("User", "email", {
      type: "string", // Modify the data type if necessary
      allowNull: true, // Set allowNull to true to make it not required
    });
  },

  async down(queryInterface) {
    // In the down function, you can revert the changes if needed
    // For example, to make the email field required again:
    await queryInterface.changeColumn("User", "email", {
      type: "string",
      allowNull: false, // Set allowNull to false to make it required
    });
  },
};

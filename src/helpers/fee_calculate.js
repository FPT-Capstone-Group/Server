const calculateParkingFee = (checkinTime, checkoutTime, dayFee, nightFee) =>
{
    // Convert input strings to Date objects
    const checkinDate = new Date(checkinTime);
    const checkoutDate = new Date(checkoutTime);

    // Calculate the date diff
    const dateDiff = checkoutDate.getDate() - checkinDate.getDate();

    // Define time milestones
    const nightStartTime = new Date(checkinDate);
    nightStartTime.setHours(21, 0, 0, 0); // 21:00

    const dayStartTime = new Date(checkinDate);
    dayStartTime.setHours(6, 0, 0, 0); // 6:00

    // Initialize fee variables
    let dayFeeCalculation = 0;
    let nightFeeCalculation = 0;

    // Calculate night fee if checkout is after 21:00 on the same day
    if (checkoutDate > nightStartTime) {
        nightFeeCalculation = nightFee;
    }

    // Calculate night fee if checkin is before 6:00 on the same day
    if (checkinDate < dayStartTime) {
        nightFeeCalculation = nightFee;
    }

    if (checkinDate < nightStartTime) {
        dayFeeCalculation = dayFee;
    }

    // Calculate day fee if checkout is after 6:00 on the next day
    if (checkoutDate > dayStartTime) {
        dayFeeCalculation = dayFee;
    }

    // Calculate the total fee
    let totalFee = dayFeeCalculation + nightFeeCalculation;

    if (dateDiff < 1 && totalFee > dayFee){
        totalFee = totalFee - dayFee;
    }
    if (dateDiff > 1){
        totalFee = totalFee * dateDiff;
    }

    return totalFee;
}

module.exports = {
    calculateParkingFee
};
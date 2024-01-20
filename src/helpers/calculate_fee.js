function addHours(date, hours) {
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    return date;
}

const calculateParkingFee = (checkinTime, checkoutTime, dayFee, nightFee) =>
{
    // Convert input strings to Date objects
    const checkinDate = new Date(checkinTime);
    const checkoutDate = new Date(checkoutTime);


    console.log(`Checkin date locale: ${checkinDate}`)
    console.log(`Checkout date locale: ${checkoutDate}`)
    // Calculate the date diff
    const dateDiff = checkoutDate.getDate() - checkinDate.getDate();
    console.log(`dateDiff: ${dateDiff}`)

    // Define time milestones
    const nightStartTime = new Date(checkinDate);
    nightStartTime.setHours(21, 0, 0, 0); // 21:00
    console.log(`nightStartTime: ${nightStartTime}`)
    const dayStartTime = new Date(checkinDate);
    dayStartTime.setHours(6, 0, 0, 0); // 6:00
    console.log(`dayStartTime: ${dayStartTime}`)
    // Initialize fee variables
    let dayFeeCalculation = 0;
    let nightFeeCalculation = 0;

    // Calculate night fee if checkout is after 21:00 on the same day
    if (checkoutDate > nightStartTime) {
        nightFeeCalculation = nightFee;
        console.log(`Night checkout - nightFeeCalculation: ${nightFeeCalculation}`)
    }

    // Calculate night fee if checkin is before 6:00 on the same day
    if (checkinDate < dayStartTime) {
        nightFeeCalculation = nightFee;
        console.log(`Night checkin - nightFeeCalculation: ${nightFeeCalculation}`)
    }

    if (checkinDate < nightStartTime) {
        dayFeeCalculation = dayFee;
        console.log(`Day checkin - dayFeeCalculation: ${dayFeeCalculation}`)

    }

    // Calculate day fee if checkout is after 6:00 on the next day
    if (checkoutDate > dayStartTime) {
        dayFeeCalculation = dayFee;
        console.log(`Day checkout - dayFeeCalculation: ${dayFeeCalculation}`)

    }
    console.log(`Final dayFeeCalculation: ${dayFeeCalculation}`)
    console.log(`Final nightFeeCalculation: ${nightFeeCalculation}`)

    // Calculate the total fee
    let totalFee = dayFeeCalculation + nightFeeCalculation;
    console.log(`Total fee: ${totalFee}`)
    if (dateDiff < 1 && totalFee > dayFee){
        totalFee = totalFee - dayFee;
        console.log(`Total fee when parked <1 day: ${totalFee}`)
    }
    if (dateDiff > 1){
        totalFee = totalFee * dateDiff;
        console.log(`Total fee when parked >1 day: ${totalFee}`)
    }

    return totalFee;
}

module.exports = {
    calculateParkingFee
};

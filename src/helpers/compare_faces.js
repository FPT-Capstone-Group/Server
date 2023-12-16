const {RekognitionClient, CompareFacesCommand} = require("@aws-sdk/client-rekognition");
const region = process.env.AWS_REGION;
const credentials = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
};
const rekognitionClient = new RekognitionClient({region, credentials});

const compareFaces = async (candidateFaceImage, targetFaceImage) => {
    const params = {
        SimilarityThreshold: 90, // Adjust this threshold based on your needs
        SourceImage: {
            Bytes: Buffer.from(candidateFaceImage, 'base64'),
        },
        TargetImage: {
            Bytes: Buffer.from(targetFaceImage, 'base64'),
        },
    };

    try {
        const compareFacesCommand = new CompareFacesCommand(params);
        const result = await rekognitionClient.send(compareFacesCommand);
        // Check if faces are similar
        return result.FaceMatches.length > 0;
    } catch (err) {
        console.error('Error:', err);
    }

}
module.exports = {
    compareFaces
};
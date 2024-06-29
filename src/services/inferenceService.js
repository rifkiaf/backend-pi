const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try { 
        let tensor = tf.node
            .decodeImage(Buffer.from(image, 'base64'))
            .resizeNearestNeighbor([416, 416])
            .expandDims()
            .toFloat()

        tensor = tensor.div(tf.scalar(255));
        
        const prediction = model.predict(tensor);
        const probabilities = await prediction.data();

        class_list = ['Apel', 'Jeruk', 'Mangga', 'Pisang', 'Strawberry'];
        
        let maxIndex = 0;
        let maxProbability = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxProbability) {
                maxProbability = probabilities[i];
                maxIndex = i;
            }
        }

        const label = class_list[maxIndex];
        const confidenceScore = Math.max(...probabilities) * 100;
        
        const manfaatList = {
            'Apel': "Apel, dengan kandungan serat dan antioksidannya yang tinggi, membantu menjaga kesehatan pencernaan dan meningkatkan daya tahan tubuh.",
            'Jeruk': "Jeruk, kaya vitamin C dan antioksidan, membantu meningkatkan kekebalan tubuh, menjaga kesehatan kulit, dan melancarkan pencernaan.",
            'Mangga': "Mangga, kaya vitamin A, C, dan serat, membantu meningkatkan kesehatan mata, kekebalan tubuh, pencernaan, dan menjaga kesehatan kulit.",
            'Pisang': "Pisang, kaya akan potasium dan serat, membantu menjaga kesehatan jantung, melancarkan pencernaan, dan memberi energi instan.",
            'Strawberry': "Strawberry, kaya akan vitamin C, antioksidan, dan serat, membantu meningkatkan kesehatan jantung, kekebalan tubuh, pencernaan, dan menjaga kesehatan kulit.",
        };

        const manfaat = manfaatList[label];

        return { label, confidenceScore, manfaat };
    } catch (error) {
        throw new InputError(`Terjadi kesalahan input: ${error.message}`)
    }
}

module.exports = { predictClassification };
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

const getResultHandler = async (_request, h) => {
    try {
        const histories = [];
        const snapshot = await firestore.collection('result').get();
        
        snapshot.forEach(doc => {
            histories.push(doc.data());
        });
        
        const formattedHistories = histories.map(history => ({
            id: history.id,
            history: {
                result: history.result,
                createdAt: history.createdAt,
                id: history.id
            }
        }));

        return h.response({
            status: 'success',
            data: formattedHistories
        }).code(200);
    } catch (error) {
        return h.response({
            status: 'fail',
            message: error.message
        }).code(500);
    }
};

module.exports = getResultHandler;
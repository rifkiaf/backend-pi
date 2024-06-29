const { predictClassification, getWikipedia } = require('../services/inferenceService');
const storeData = require('../services/storeData');
const crypto = require('crypto');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
 
  const { label, confidenceScore, manfaat } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date();

  const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formattedDate = createdAt.toLocaleDateString('en-GB', options);
  const formattedDateTime = `${formattedDate}`;
 
  const data = {
    "id": id,
    "result": label,
    "benefit": manfaat,
    "createdAt": formattedDateTime,
  }

  const response = h.response({
    status: 'success',
    message: confidenceScore > 99.50 ? 'Model is predicted successfully' : 'Model is predicted successfully but under threshold',
    data
  })
  response.code(201);
  await storeData(id, data);
  return response;
}
 
module.exports = postPredictHandler;
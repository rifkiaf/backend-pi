const { predictClassification } = require('../services/inferenceService');
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
    id,
    result: label,
    benefit: manfaat,
    createdAt: formattedDateTime,
  };

  let response;

  if (confidenceScore > 40.50) {
    // Jika confidence score lebih dari 50.50, tampilkan data
    response = h.response({
      status: 'success',
      message: 'Image successfully predicted',
      data,
    });
    await storeData(id, data);
  } else {
    // Jika confidence score kurang dari 60.50, jangan tampilkan data
    response = h.response({
      status: 'fail',
      message: 'Image does not match',
    });
  }

  response.code(201);
  return response;
}
 
module.exports = postPredictHandler;

const MessageClassification = require('../models/MessageClassification');

/**
 * Get classification for a specific message
 */
const getClassification = async (req, res) => {
  try {
    const { message_id } = req.params;

    const classification = await MessageClassification.findOne({
      messageId: message_id
    });

    if (!classification) {
      return res.status(404).json({
        success: false,
        message: 'Classification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message_id: classification.messageId,
        category: classification.category,
        confidence_score: classification.confidenceScore,
        classified_at: classification.classifiedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getClassification
};

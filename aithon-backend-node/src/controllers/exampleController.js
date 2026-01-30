/**
 * Example Controller
 * Contains sample controller methods
 */

const getExample = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Example endpoint working',
    data: {
      timestamp: new Date().toISOString()
    }
  });
};

const createExample = (req, res) => {
  const data = req.body;
  res.status(201).json({
    success: true,
    message: 'Resource created successfully',
    data: data
  });
};

module.exports = {
  getExample,
  createExample
};

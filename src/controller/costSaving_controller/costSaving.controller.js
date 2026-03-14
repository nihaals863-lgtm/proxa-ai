const db = require('../../../config/config');
const CostSaving = db.costSaving;
// Create a new Cost Saving entry
exports.createCostSaving = async (req, res) => {
  try {
    const {
      supplierName,
      depreciationScheduleYears,
      group,
      category,
      reportingYear,
      currency,
      benefitStartMonth,
      benefitEndMonth,
      typeOfCostSaving,
      historicalUnitPrice,
      negotiatedUnitPrice,
      reductionPerUnit,
      currentPrice,
      proposedPrice,
      notesDescription,
      forecastVolumes,
      forecastVolumesMultiYear,
      historicalUnitPrices,
      additionalColumns,
      sourcingBenefits,
      intakeRequest
    } = req.body;
 
    const userId = req.user.id; // Corrected: get from req.user set by authenticate middleware
 
    const newEntry = await CostSaving.create({
      supplierName,
      depreciationScheduleYears,
      group: "N/A", // Hardcoded default to bypass DB notNull constraint since field is removed from UI
      category,
      reportingYear,
      currency,
      benefitStartMonth,
      benefitEndMonth,
      typeOfCostSaving,
      historicalUnitPrice,
      negotiatedUnitPrice,
      reductionPerUnit,
      currentPrice,
      proposedPrice,
      notesDescription,
      forecastVolumes,
      forecastVolumesMultiYear,
      historicalUnitPrices,
      additionalColumns,
      sourcingBenefits,
      intakeRequest,
      userId
    });

    return res.status(201).json({ message: 'Cost Saving created successfully', data: newEntry ,status:true});
  } catch (error) {
    console.error('Create Error:', error);
    return res.status(500).json({ message: 'Failed to create cost saving', error , status:false });
  }
};

// Get all cost saving entries
exports.getAllCostSavings = async (req, res) => {
  try {
    const { userType, id: userId } = req.user; // Corrected: get from req.user set by authenticate middleware
    let query = {};

    if (userType === 'admin') {
      query.where = { userId: userId };
    }

    const entries = await CostSaving.findAll(query);
    return res.status(200).json(entries);
  } catch (error) {
    console.error('Fetch All Error:', error);
    return res.status(500).json({ message: 'Failed to fetch entries', error });
  }
};

// Get a single cost saving by ID
exports.getCostSavingById = async (req, res) => {
  try {
    const entry = await CostSaving.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost Saving not found' });
    }
    return res.status(200).json(entry);
  } catch (error) {
    console.error('Fetch By ID Error:', error);
    return res.status(500).json({ message: 'Failed to fetch entry', error });
  }
};

// Update cost saving by ID
exports.updateCostSaving = async (req, res) => {
  try {
    const entry = await CostSaving.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost Saving not found' });
    }

    await entry.update(req.body);

    return res.status(200).json({ message: 'Cost Saving updated', data: entry });
  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({ message: 'Failed to update entry', error });
  }
};

// Delete cost saving by ID
exports.deleteCostSaving = async (req, res) => {
  try {
    const entry = await CostSaving.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost Saving not found' });
    }

    await entry.destroy();
    return res.status(200).json({ message: 'Cost Saving deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ message: 'Failed to delete entry', error });
  }
};

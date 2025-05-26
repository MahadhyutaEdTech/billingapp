import { getReports } from "../models/reports.js";

export const fetchReports = async (req, res) => {
  try {
    const { type } = req.query;
    const data = await getReports(type);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

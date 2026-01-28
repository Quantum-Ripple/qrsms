import api from "./axios";

/**
 * Fetch simulations filtered by subject and class level
 *
 * @param {String} subject - "PHY" | "CHEM" | "BIO"
 * @param {String} classLevel - e.g. "Grade 7"
 */
export const getSimulations = async (subject, classLevel) => {
  try {
    const response = await api.get("/simulations/", {
      params: {
        subject,
        class_levels: classLevel,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching simulations:", error);
    throw error;
  }
};

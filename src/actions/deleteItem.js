import { httpsRequest } from "../utils/httpsRequest";

export const deleteItem = async (list, ID) => {
  return await httpsRequest("DELETE", list, `(${ID})`);
};

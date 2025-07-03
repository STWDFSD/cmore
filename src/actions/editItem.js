import { httpsRequest } from "../utils/httpsRequest";

export const editItem = async (list, ID, data) => {
  data.__metadata = { type: "SP.Data." + list + "ListItem" };

  return await httpsRequest("MERGE", list, `(${ID})`, data);
};

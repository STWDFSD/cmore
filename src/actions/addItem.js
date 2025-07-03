import { httpsRequest } from "../utils/httpsRequest";

export const addItem = async (list, data) => {
  data.__metadata = { type: "SP.Data." + list + "ListItem" };

  return await httpsRequest("POST", list, null, data);
};

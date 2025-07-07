import { httpsRequest } from "../utils/httpsRequest";

export const getItems = async (list, keys, details) => {
  let items = await httpsRequest("GET", list, details);

  items = items.map((it) => {
    const temp = {};
    keys.map((key) => (temp[key] = it[key]));
    return temp;
  });

  return items;
};

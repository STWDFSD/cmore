import store from "@/store";

/**
 * Handles value changes for form fields and commits them to the Vuex store.
 * @param {Event} e - The input or blur event.
 * @param {string} type - 's' for string, 'n' for number.
 * @param {string} list - The store list to update.
 * @param {string} field - The field name to update.
 * @param {any} ID - The identifier for the item to update.
 */
const onChangeValue = (e, type, list, field, ID) => {
  let value = e.target.value || e.target.innerText;
  value = value.trim();
  if (type == "n") value = parseFloat(0 + value.replace(/,/g, ""));

  store.commit("changeValue", { list, field, ID, value });
};

export default onChangeValue;

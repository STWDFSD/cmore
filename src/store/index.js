import { toRaw } from "vue";
import { createStore } from "vuex";
import { addItem } from "@/actions/addItem";
import evaluate from "@/utils/evaluate";
import { editItem } from "@/actions/editItem";
import formulaToCFIDs from "@/utils/formulaToCFIDs";

export default createStore({
  state: {
    hideConfigButton: false,
    isPinned: false,
    showConfig: false,
    sidebarType: "bg-white",
    isRTL: false,
    mcolor: "",
    darkMode: false,
    isNavFixed: false,
    isAbsolute: false,
    showNavs: true,
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    layout: "default",

    user: null,
    siteUsers: [],

    project: null,
    criterias: null,
    alternatives: null,
    criteriaValues: null,
    costFields: [],
  },
  mutations: {
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    sidebarMinimize(state) {
      let sidenav_show = document.querySelector("#app");
      if (state.isPinned) {
        sidenav_show.classList.add("g-sidenav-hidden");
        sidenav_show.classList.remove("g-sidenav-pinned");
        state.isPinned = false;
      } else {
        sidenav_show.classList.add("g-sidenav-pinned");
        sidenav_show.classList.remove("g-sidenav-hidden");
        state.isPinned = true;
      }
    },
    sidebarType(state, payload) {
      state.sidebarType = payload;
    },
    navbarFixed(state) {
      if (state.isNavFixed === false) {
        state.isNavFixed = true;
      } else {
        state.isNavFixed = false;
      }
    },

    setUser(state, payload) {
      state.user = payload;
    },
    setSiteUsers(state, payload) {
      state.siteUsers = payload;
    },
    setProject(state, payload) {
      state.project = toRaw(payload);
    },
    setCriterias(state, payload) {
      state.criterias = payload;
      updateCriteriasWeight(state);
    },
    setCriteriaValues(state, payload) {
      state.criteriaValues = payload;
      updateCriteriaValues_Value(state);
    },
    setAlternatives(state, payload) {
      state.alternatives = payload;
      updateMoeScore(state);
    },
    setCostFields(state, payload) {
      state.costFields = payload;
    },
    setCosts(state, payload) {
      state.costs = payload;
      updateTotalCost(state);
    },

    addAlternative(state, payload) {
      state.alternatives.push(payload);
      updateMoeScore(state);
      updateTotalCost(state);
    },
    addCriteria(state, payload) {
      state.criterias.push(payload);
      updateCriteriasWeight(state);
    },
    addCostField(state, payload) {
      state.costFields.push(payload);
    },

    deleteCriteria(state, payload) {
      state.criterias = state.criterias.filter((it) => it.ID != payload);
    },
    deleteAlternative(state, payload) {
      state.alternatives = state.alternatives.filter((it) => it.ID != payload);
    },
    deleteCostField(state, payload) {
      state.costFields = state.costFields.filter((it) => it.ID != payload);
    },

    changeValue(state, { list, field, ID, value }) {
      if (!state[list]) return;

      if (list == "criteriaValues" && field == "Value") {
        const index = state[list].findIndex(
          (it) => it.AlternativeID == ID.AID && it.CriteriaID == ID.CID
        );
        if (index == -1 || state[list][index].ID == 0) {
          const newItem = {
            ProjectID: state.project.ID,
            AlternativeID: ID.AID,
            CriteriaID: ID.CID,
            Value: value,
          };

          addItem("CriteriaValues", newItem).then((res) => {
            if (index != -1) state[list].splice(index, 1);
            newItem.ID = res.ID;
            state[list].push(newItem);
            updateCriteriaValues_Value(state);
          });
          return;
        }
        state[list][index][field] = value;
        updateCriteriaValues_Value(state);

        editItem("CriteriaValues", state[list][index].ID, { [field]: value });
        return;
      }

      if (list == "costs" && field == "Value") {
        const index = state[list].findIndex(
          (it) => it.AlternativeID == ID.AID && it.CostFieldID == ID.CFID
        );
        if (index == -1) {
          const newItem = {
            ProjectID: state.project.ID,
            AlternativeID: ID.AID,
            CostFieldID: ID.CFID,
            Value: value,
          };

          addItem("Costs", newItem).then((res) => {
            newItem.ID = res.ID;
            state[list].push(newItem);
            updateTotalCost(state);
          });
          return;
        }
        state[list][index][field] = value;
        updateTotalCost(state);

        editItem("Costs", state[list][index].ID, { [field]: value });
        return;
      }

      const index = state[list].findIndex((it) => it.ID == ID);
      if (index == -1) return;
      state[list][index][field] = value;

      // Update
      if (list == "criterias") {
        editItem("Criterias", ID, { [field]: value });

        switch (field) {
          case "Point":
            updateCriteriasWeight(state);
            break;
          case "DesiredType":
          case "LowStandard":
          case "HighStandard":
            updateCriteriaValues_Value(state);
            break;
        }
      }
      if (list == "alternatives") {
        editItem("Alternatives", ID, { [field]: value });
      }
      if (list == "costFields") {
        editItem("CostFields", ID, { [field]: value });
        if (field != "Title") updateTotalCost(state);
      }
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
  },
  getters: {},
});

function updateCriteriasWeight(state) {
  if (state.criterias == null) return;

  const ParentIDs = [...new Set(state.criterias.map((it) => it.ParentID))];

  for (let i = 0; i < ParentIDs.length; i++) {
    const filteredCriterias = state.criterias.filter(
      (it) => it.ParentID == ParentIDs[i]
    );

    const sumPoint = filteredCriterias
      .map(({ Point }) => Point)
      .reduce((acc, cur) => acc + cur, 0);

    for (let j = 0; j < filteredCriterias.length; j++) {
      filteredCriterias[j].Weight =
        sumPoint == 0 ? 0 : filteredCriterias[j].Point / sumPoint;
    }
  }

  updateMoeScore(state);
}

function updateCriteriaValues_Value(state) {
  if (state.criteriaValues == null) return;

  for (let i = 0; i < state.criteriaValues.length; i++) {
    const criteria = state.criterias.find(
      (it) => it.ID == state.criteriaValues[i].CriteriaID
    );

    if (!criteria) continue;

    state.criteriaValues[i]._Value = evaluate(
      state.criteriaValues[i].Value,
      criteria.DesiredType,
      criteria.LowStandard,
      criteria.HighStandard
    );
  }

  updateMoeScore(state);
}

function updateMoeScore(state) {
  if (
    state.alternatives == null ||
    state.criteriaValues == null ||
    state.criterias == null
  )
    return;

  for (let i = 0; i < state.alternatives.length; i++) {
    const AID = state.alternatives[i].ID;
    state.alternatives[i].MoeScore =
      100 * calculateMoeScoreDeeply(state, AID, 0);
  }
}

function calculateMoeScoreDeeply(state, AID, ParentID) {
  const filteredCriterias = state.criterias.filter(
    (it) => it.ParentID == ParentID
  );

  let score = 0;

  for (let i = 0; i < filteredCriterias.length; i++) {
    let Value = 0;
    let _Value = 0;

    const criteria = filteredCriterias[i];
    const child = state.criterias.find((it) => it.ParentID == criteria.ID);

    const { ID: CID, Weight } = criteria;

    if (child) {
      Value = calculateMoeScoreDeeply(state, AID, child.ParentID);
      _Value = evaluate(
        Value,
        criteria.DesiredType,
        criteria.LowStandard,
        criteria.HighStandard
      );

      const idx = state.criteriaValues.findIndex(
        (it) => it.AlternativeID == AID && it.CriteriaID == CID
      );
      if (idx == -1) {
        state.criteriaValues.push({
          ID: 0,
          AlternativeID: AID,
          CriteriaID: CID,
          Value,
          _Value,
        });
      } else {
        state.criteriaValues[idx].Value = Value;
        state.criteriaValues[idx]._Value = _Value;
      }
    } else {
      const cValue = state.criteriaValues.find(
        (it) => it.AlternativeID == AID && it.CriteriaID == CID
      );
      if (cValue) {
        Value = cValue.Value;
        _Value = cValue._Value;
      }
    }

    score += _Value * Weight;
  }

  return score;
}

function updateTotalCost(state) {
  if (
    state.alternatives == null ||
    state.costFields == null ||
    state.costs == null
  )
    return;

  const costField = state.costFields.find((it) => it.Title == "Total Cost");

  const AIDs = state.alternatives.map((it) => it.ID);

  const costs = getCostValue(state, costField, AIDs);

  for (let i = 0; i < AIDs.length; i++) {
    const index = state.alternatives.findIndex((it) => it.ID == AIDs[i]);
    state.alternatives[index].TotalCost = costs[i];
  }
}

function getCostValue(state, parentCF, [...AIDs]) {
  if (parentCF == null) return [...AIDs].fill(0);

  let costs = [...AIDs].fill(parentCF.Formula);
  const formulaCFIDs = formulaToCFIDs(parentCF.Formula);
  const childFields = state.costFields.filter(
    (it) => it.ParentID == parentCF.ID
  );

  for (let i = 0; i < formulaCFIDs.length; i++) {
    const costField = childFields.find((it) => it.ID == formulaCFIDs[i]);
    const pattern = new RegExp(`\\{${formulaCFIDs[i]}\\}`, "g");

    if (costField == null) {
      for (let j = 0; j < AIDs.length; j++) {
        costs[j] = costs[j].replace(pattern, "0");
      }
    } else {
      if (costField.Formula == "this") {
        for (let j = 0; j < AIDs.length; j++) {
          let cost = state.costs.find(
            (it) =>
              it.CostFieldID == formulaCFIDs[i] && it.AlternativeID == AIDs[j]
          );
          costs[j] = costs[j].replace(pattern, cost ? cost.Value : "0");
        }
      } else {
        const _costs = getCostValue(state, costField, AIDs);
        for (let j = 0; j < AIDs.length; j++) {
          costs[j] = costs[j].replace(pattern, _costs[j]);
        }
      }
    }
  }

  for (let i = 0; i < AIDs.length; i++) {
    costs[i] = eval(costs[i]);
  }

  for (let i = 0; i < AIDs.length; i++) {
    const index = state.alternatives.findIndex((it) => it.ID == AIDs[i]);
    state.alternatives[index].costValues[parentCF.ID] = costs[i];
  }

  return costs;
}

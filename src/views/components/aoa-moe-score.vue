<script setup>
// --- Imports ---
import { computed, ref } from "vue";
import { useStore } from "vuex";
import aoaMoeScoreChart from "./aoa-moe-score-chart.vue";
import formatWithSpaces from "@/utils/formatWithSpaces";
import onChangeValue from "@/utils/onChangeValue";

// --- Store and State ---
const store = useStore();
const project = computed(() => store.state.project);
const criterias = computed(() => store.state.criterias || []);
const alternatives = computed(() => store.state.alternatives || []);
const criteriaValues = computed(() => store.state.criteriaValues || []);

// --- UI State for Table Fields ---
const showField = ref({ weight: false, value: false });
const toggleShowField = (key) => {
  showField.value[key] = !showField.value[key];
};

// --- Helper: Get Criteria Value for Alternative ---
const getCriteriaValue = (AID, CID) => {
  const criteriaValue = criteriaValues.value.find(
    (it) => it.AlternativeID == AID && it.CriteriaID == CID
  );
  if (criteriaValue == null) return { ID: 0, Value: 0, _Value: 0 };
  return criteriaValue;
};
</script>

<template>
  <!-- MOE Score content -->
  <div id="moe-score">
    <div class="mb-4">
      <div class="p-3 pt-2">
        <i class="fa-solid fa-file-circle-check fa-2x me-2"></i>
        <b class="text-lg">{{ project.Title }}</b>
      </div>
    </div>
    <div class="pt-0">
      <!-- Chart for alternatives -->
      <div class="text-center mb-3" v-if="alternatives.length">
        <aoa-moe-score-chart />
      </div>
      <!-- Toggle switches for table fields -->
      <div class="d-flex justify-content-end mb-3">
        <div class="form-check form-switch">
          <input
            id="aoa-moe-score-show-weight"
            class="form-check-input"
            type="checkbox"
            :checked="showField.weight"
            @click="toggleShowField('weight')"
          />
          <label class="form-check-label mt-1" for="aoa-moe-score-show-weight">
            Show/hide Weight
          </label>
        </div>
        <div class="form-check form-switch ms-4">
          <input
            id="aoa-moe-score-show-value"
            class="form-check-input"
            type="checkbox"
            :checked="showField.value"
            @click="toggleShowField('value')"
          />
          <label class="form-check-label mt-1" for="aoa-moe-score-show-value">
            Show/hide Value
          </label>
        </div>
      </div>
      <!-- Alternatives and criteria table -->
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-items-center mb-0">
          <thead>
            <tr class="text-secondary text-xs" style="background: #f8f9fa">
              <th class="opacity-7" :rowspan="showField.weight ? 2 : 1">
                Alternative
              </th>
              <!-- Criteria columns -->
              <template
                v-for="{
                  ID,
                  Title,
                  DesiredType,
                  LowStandard,
                  HighStandard,
                } in criterias"
                :key="ID"
              >
                <th class="text-center px-2 opacity-7">
                  <u class="text-dark" :title="Title">
                    {{ Title.length > 10 ? Title.slice(0, 10) + "..." : Title }}
                  </u>
                  <br />
                  <small>
                    {{
                      DesiredType +
                      " , " +
                      (DesiredType == "Yes"
                        ? "No"
                        : DesiredType == "No"
                          ? "Yes"
                          : LowStandard) +
                      "-" +
                      (DesiredType == "Yes"
                        ? "Yes"
                        : DesiredType == "No"
                          ? "No"
                          : HighStandard)
                    }}
                  </small>
                </th>
                <th v-if="showField.value" class="text-center px-1 opacity-7">
                  Value
                </th>
              </template>
              <th
                class="text-center opacity-7"
                :rowspan="showField.weight ? 2 : 1"
              >
                MOE Score
              </th>
            </tr>
            <!-- Weight row if enabled -->
            <tr v-if="showField.weight" class="text-danger text-xs">
              <template v-for="{ ID, Weight } in criterias" :key="ID">
                <td
                  class="p-1"
                  :colspan="showField.value ? 2 : 1"
                  style="text-align: right"
                >
                  {{ formatWithSpaces(100 * Weight) }}
                  <small>%</small>
                </td>
              </template>
            </tr>
          </thead>
          <tbody v-if="alternatives == null">
            <tr>
              <td colspan="6">
                <div class="text-center py-2">
                  <i class="fa fa-spin fa-ring"></i>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <!-- Alternatives rows -->
            <template
              v-for="{ ID: AID, Title, Description, MoeScore } in alternatives"
              :key="AID"
            >
              <tr>
                <td
                  class="px-3"
                  :title="Description"
                  :rowspan="showField.weight ? 2 : 1"
                >
                  <b>{{ Title }}</b>
                </td>
                <!-- Criteria value cells -->
                <template
                  v-for="{ ID: CID, DesiredType } in criterias"
                  :key="CID"
                >
                  <td class="text-center">
                    <span v-if="criterias.some((it) => it.ParentID == CID)">
                      {{ formatWithSpaces(getCriteriaValue(AID, CID).Value) }}
                    </span>
                    <select
                      v-else-if="DesiredType == 'Yes' || DesiredType == 'No'"
                      :value="getCriteriaValue(AID, CID).Value ? 1 : 0"
                      @change="
                        onChangeValue($event, 'n', 'criteriaValues', 'Value', {
                          AID,
                          CID,
                        })
                      "
                    >
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                    <span
                      v-else
                      contenteditable
                      @blur="
                        onChangeValue($event, 'n', 'criteriaValues', 'Value', {
                          AID,
                          CID,
                        })
                      "
                    >
                      {{ formatWithSpaces(getCriteriaValue(AID, CID).Value) }}
                    </span>
                  </td>
                  <td
                    v-if="showField.value"
                    class="text-center"
                    style="background: #fdfdfd"
                  >
                    {{ formatWithSpaces(getCriteriaValue(AID, CID)._Value) }}
                  </td>
                </template>
                <td
                  class="text-center"
                  :rowspan="showField.weight ? 2 : 1"
                  style="background: #f8f9fa"
                >
                  {{ formatWithSpaces(MoeScore) }}
                  <small>%</small>
                </td>
              </tr>
              <tr v-if="showField.weight">
                <template v-for="{ ID: CID, Weight } in criterias" :key="CID">
                  <td
                    class="p-1 text-danger text-xs"
                    style="background: #f8f9fa; text-align: right"
                    :colspan="showField.value ? 2 : 1"
                  >
                    {{
                      formatWithSpaces(
                        100 * getCriteriaValue(AID, CID)._Value * Weight
                      )
                    }}
                    <small>%</small>
                  </td>
                </template>
              </tr>
            </template>
            <tr>
              <td class="text-xs">
                {{ alternatives.length || "No" }} alternatives found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  CFID: Number,
  addCostField: Function,
});

import { ref, computed } from "vue";
import { useStore } from "vuex";

import ArgonButton from "@/components/ArgonButton.vue";
import FormulaParser from "@/components/FormulaParser.vue";
import formatWithSpaces from "@/utils/formatWithSpaces";
import onChangeValue from "@/utils/onChangeValue";
import simplifyFormula from "@/utils/simplifyFormula";
import { deleteItem } from "@/actions/deleteItem";

import { useRoute } from "vue-router";

const store = useStore();

const route = useRoute();

const alternatives = computed(() => store.state.alternatives || []);

const mainField = computed(() =>
  (store.state.costFields || []).find((it) => it.ID == props.CFID)
);
const childFields = computed(() =>
  (store.state.costFields || []).filter((it) => it.ParentID == props.CFID)
);

const showModal = ref(false);

function openModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function getCostValue(AID, ID) {
  const cost = (store.state.costs || []).find(
    (it) => it.AlternativeID == AID && it.CostFieldID == ID
  );
  return cost ? cost.Value : 0;
}

function deleteCostField(ID) {
  if (confirm("Are you sure?")) {
    store.commit("deleteCostField", ID);
    deleteItem("CostFields", ID);
  }
}
</script>

<template>
  <!-- fields ID that are linked to this table -->
  <div
    v-for="it in childFields.filter((it) => it.Formula == 'this')"
    :key="it.ID"
    :id="`aoa-cost-table-${it.ID}`"
  ></div>

  <div class="mb-5" :id="`aoa-cost-table-${CFID}`">
    <div class="pb-3">
      <argon-button
        color="success"
        variant="gradient"
        size="sm"
        @click="openModal"
      >
        {{ mainField.Title }}
        <span class="ms-1 text-light">
          <i class="fa-solid fa-gear"></i>
        </span>
      </argon-button>
      <span class="mx-2">=</span>
      <formula-parser :CFID="CFID" :formula="mainField.Formula" />
    </div>

    <div class="table-responsive">
      <table class="table table-bordered align-items-center mb-0">
        <thead>
          <tr class="text-secondary text-xs">
            <th class="opacity-7">Alternative</th>
            <th class="text-center opacity-7 bg-light">
              {{ mainField.Title }}
            </th>
            <th
              class="text-center opacity-7"
              v-for="{ ID, Title, Formula } in childFields"
              :key="ID"
            >
              <span v-if="Formula == 'this'">{{ Title }}</span>
              <a :href="`#aoa-cost-table-${ID}`" v-else>
                <i class="fa fa-eye me-1"></i>
                {{ Title }}
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ ID: AID, Title: ATitle, costValues } in alternatives"
            :key="AID"
          >
            <td class="px-3">
              <b>{{ ATitle }}</b>
            </td>
            <td
              class="text-center prefix-dollor"
              :unit="mainField.Unit"
              style="background: #fefffa"
              :style="{
                background:
                  route.hash == `#aoa-cost-table-${mainField.ID}`
                    ? '#ffff80'
                    : '',
              }"
            >
              {{
                formatWithSpaces(
                  mainField.Formula == "this"
                    ? getCostValue(AID, mainField.ID)
                    : costValues[mainField.ID]
                )
              }}
            </td>

            <td
              v-for="{ ID, Unit, Formula } in childFields"
              :key="ID"
              class="text-center prefix-dollor"
              :unit="Unit"
              :style="{
                background:
                  route.hash == `#aoa-cost-table-${ID}` ? '#ffff80' : '',
              }"
            >
              <span
                v-if="Formula == 'this'"
                contenteditable
                @blur="
                  onChangeValue($event, 'n', 'costs', 'Value', {
                    AID,
                    CFID: ID,
                  })
                "
              >
                {{ formatWithSpaces(getCostValue(AID, ID)) }}
              </span>
              <span v-else>
                {{ formatWithSpaces(costValues[ID]) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="text-xs">
              {{ alternatives.length || "No" }} alternatives found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <transition name="slide-modal">
      <div v-if="showModal" class="custom-modal-backdrop">
        <div class="custom-modal">
          <div class="custom-modal-header bg-gradient-success">
            <span>Table Settings; "{{ mainField.Title }}"</span>
          </div>
          <div class="custom-modal-body">
            <div class="form-group mb-2">
              <div class="d-flex justify-content-between">
                <label class="form-label">Formula</label>
                <span class="text-secondary">
                  {1} * 2 + {2} * {3} / 12 + 70
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                :value="mainField.Formula"
                @input="
                  mainField.Formula = simplifyFormula($event.target.value)
                "
                @blur="
                  onChangeValue(
                    $event,
                    's',
                    'costFields',
                    'Formula',
                    mainField.ID
                  )
                "
              />
            </div>
            <div class="mb-1">
              <div class="d-flex align-items-center flex-wrap">
                <formula-parser
                  :CFID="mainField.ID"
                  :formula="mainField.Formula"
                />
              </div>
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Fields</label>
              <div class="table-responsive">
                <table class="table table-bordered align-items-center mb-0">
                  <thead>
                    <tr class="text-secondary text-xs">
                      <th class="opacity-7">Title</th>
                      <th class="text-center opacity-7 bg-light">ID</th>
                      <th class="text-center opacity-7">Unit</th>
                      <th class="text-center opacity-7">Value</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="{ ID, Title, Unit, Formula } in childFields"
                      :key="ID"
                    >
                      <td class="px-3">
                        <b
                          contenteditable
                          @blur="
                            onChangeValue(
                              $event,
                              's',
                              'costFields',
                              'Title',
                              ID
                            )
                          "
                        >
                          {{ Title }}
                        </b>
                      </td>
                      <td class="text-center" style="background: #fefffa">
                        {{ ID }}
                      </td>
                      <td class="text-center">
                        <span
                          contenteditable
                          @blur="
                            onChangeValue($event, 's', 'costFields', 'Unit', ID)
                          "
                        >
                          {{ Unit }}
                        </span>
                      </td>
                      <td class="text-center">
                        <small v-if="Formula == 'this'">
                          <a
                            href="javascript:;"
                            :title="`Click to create a new table named '${Title}'`"
                            @click="
                              onChangeValue(
                                { target: { value: '0' } },
                                's',
                                'costFields',
                                'Formula',
                                ID
                              )
                            "
                          >
                            this
                          </a>
                        </small>
                        <span v-else class="fa fa-link text-success"></span>
                      </td>
                      <td class="text-center">
                        <a
                          href="javascript:;"
                          class="text-xs"
                          @click="deleteCostField(ID)"
                        >
                          <i class="fa fa-trash"></i>
                        </a>
                      </td>
                    </tr>
                    <tr class="text-xs">
                      <td colspan="3">
                        {{ childFields.length || "No" }} fields found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-2">
                <argon-button
                  color="success"
                  variant="gradient"
                  size="sm"
                  @click="addCostField('New Field', mainField.ID)"
                >
                  <span class="me-1 text-light">
                    <i class="fa-solid fa-plus"></i>
                  </span>
                  Add New Field
                </argon-button>
              </div>
            </div>
            <div class="d-flex justify-content-end">
              <button class="btn btn-light" @click="closeModal">Close</button>
              <button
                v-if="mainField.Title != 'Total Cost'"
                class="btn btn-danger ms-2"
                @click="
                  onChangeValue(
                    { target: { value: 'this' } },
                    's',
                    'costFields',
                    'Formula',
                    mainField.ID
                  )
                "
              >
                Delete Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
const store = useStore();

const layout = computed(() => store.state.layout);
</script>

<template>
  <div v-show="layout !== 'landing'" class="card card-plain" id="sidenavCard">
    <div class="p-3 card-body text-center pt-0">
      <img
        class="w-50 mx-auto rounded-circle"
        src="@/assets/img/avatar.jpg"
        alt="sidebar_illustration"
      />
      <h6 class="mt-1 mb-0 text-dark up">
        {{ store.state.user?.Title || "Please wait..." }}
      </h6>
      <p class="text-xs ellipsis">
        {{ store.state.user?.Email || "Loading..." }}
      </p>
      <a
        href="https://login.microsoftonline.com/logout"
        class="btn btn-danger btn-sm w-100"
      >
        Logout
      </a>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
const store = useStore();
</script>
<template>
  <footer class="py-3 footer">
    <div class="container-fluid">
      <div class="row align-items-center justify-content-lg-between">
        <div class="mb-4 col-lg-6 mb-lg-0">
          <div
            class="text-sm text-center copyright text-muted"
            :class="store.state.isRTL ? 'text-lg-end' : 'text-lg-start'"
          >
            ©
            {{ new Date().getFullYear() }} | CMORE
          </div>
        </div>
        <div class="col-lg-6">
          <ul
            class="nav nav-footer justify-content-center justify-content-lg-end"
          >
            <li class="nav-item">
              <a href="javascript:;" class="text-secondary me-xl-4 me-4">
                <span class="text-lg fab fa-dribbble"></span>
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:;" class="text-secondary me-xl-4 me-4">
                <span class="text-lg fab fa-twitter"></span>
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:;" class="text-secondary me-xl-4 me-4">
                <span class="text-lg fab fa-instagram"></span>
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:;" class="text-secondary me-xl-4 me-4">
                <span class="text-lg fab fa-pinterest"></span>
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:;" class="text-secondary me-xl-4 me-4">
                <span class="text-lg fab fa-github"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

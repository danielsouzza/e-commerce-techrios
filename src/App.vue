<script setup>
import Setup from "./layouts/Setup.vue";
import {onMounted, ref} from "vue";

const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
});

</script>

<template>
  <Setup>
    <v-overlay
        v-model="isLoading"
        persistent
        contained
        color="white"

        class="align-center tw-bg-white justify-center"
    >
      <v-progress-circular
          width="2"
          color="white"
          size="90"
          indeterminate
      ></v-progress-circular>
    </v-overlay>
    <main class="tw-flex-1 tw-min-h-[70vh]">
      <router-view ></router-view>
    </main>
  </Setup>
</template>

<style scoped>

</style>

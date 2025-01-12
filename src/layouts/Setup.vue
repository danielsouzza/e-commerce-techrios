<script setup>
import Footer from "./Footer.vue";
import Header from "./Header.vue";



</script>

<template>
  <div class="lp-wraper tw-bg-gray-50">
    <Header class="mb-auto border-t-lg  !tw-border-secondary" />
    <slot/>
    <Footer class="mt-auto"/>
  </div>

</template>

<style scoped>
.v-app-bar.v-toolbar{
  top:0 !important;
  border-radius: 0 !important;
  max-width: 100% !important;
}
</style>
<script setup>
import Footer from "./Footer.vue";
import Header from "./Header.vue";



</script>

<template>
  <v-app min-height="100vh" class="tw-flex tw-flex-col">
    <Header class="mb-auto border-t-lg !tw-border-secondary" />
    <v-main>
      <slot/>
    </v-main>
    <Footer class="mt-auto"/>
  </v-app>
</template>

<style scoped>

</style>
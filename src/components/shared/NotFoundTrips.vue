<script setup>

import {Icon} from "@iconify/vue";
</script>

<template>
  <div  class="tw-w-full tw-flex-1  my-auto tw-text-center tw-flex tw-flex-col tw-items-center tw-justify-center">
    <Icon icon="ix:anomaly-found" width="60" class=" tw-text-xl tw-text-p"/>
    <p class="tw-text-p mt-1">Nenhuma viagem encontrada</p>
    <RouterLink :to="{name:'home'}">
      <v-btn  variant="tonal" color="secondary" class="mt-3">Voltar para home</v-btn>
    </RouterLink>
  </div>
</template>

<style scoped>

</style>
<script setup>

import {Icon} from "@iconify/vue";
defineProps({
  rounded:{
    type: String,
    default: "tw-rounded-lg"
  }
})
</script>

<template>
  <v-card flat variant="outlined" class="tw-bg-white   tw-w-fit " :class="rounded" color="secondary">
    <div class="tw-flex tw-items-center tw-p-1">
      <div >
        <Icon icon="mingcute:sale-fill" class="mx-1 tw-text-[20px] tw-text-primary"/>
      </div>
      <div class="tw-bg-secondary tw-rounded-[3px]   tw-p-[3px]  tw-text-primary   tw-uppercase tw-text-[12px] tw-flex" style="line-height: 14px">
        <span class="tw-font-semibold ">Super</span> &nbsp;<span class="tw-font-extrabold">oferta</span>
      </div>
    </div>
  </v-card>
</template>

<style scoped>

</style>
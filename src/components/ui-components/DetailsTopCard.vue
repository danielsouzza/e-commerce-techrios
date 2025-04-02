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
  <div class="tw-bg-white   tw-w-fit tw-p-1" :class="rounded" >
    <div class="tw-flex tw-items-center tw-p-[0.5px]">
      <div >
        <Icon icon="mingcute:sale-fill" class="mx-1 tw-text-[28px] tw-text-primary"/>
      </div>
      <div class="tw-bg-secondary tw-rounded-md tw-px-2 tw-text-left  tw-text-primary  tw-text-lg tw-uppercase " style="line-height: 14px">
        <span class="tw-font-semibold tw-text-sm">Super</span><br> <span class="tw-font-extrabold tw-text-[15px]">oferta</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
<script setup>

import SuperOfferStamp from "../ui-components/SuperOfferStamp.vue";
</script>

<template>
  <div class="tw-relative tw-w-[343px] lg:tw-w-full tw-h-full tw-rounded-xl tw-overflow-hidden tw-shadow-lg">
    <div
        class="tw-w-full tw-h-64 lg:tw-h-[405px] !tw-rounded-xl tw-bg-cover tw-bg-center "
        style="background-image: url('./src/_mockData/banners/banner-primary-1.png');">
    </div>

    <div class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-bg-gradient-to-t tw-from-black/100 tw-via-black/50 tw-to-transparent"></div>

    <div class="tw-absolute tw-bottom-0 tw-p-4 tw-w-full tw-text-white">
      <SuperOfferStamp class=""/>

      <div class="tw-flex tw-justify-between tw-mb-5 tw-items-end">
        <div class="tw-font-extrabold">
          <p class="tw-mt-2 tw-text-gray-200 tw-text-sm ">Santa Cruz, PA</p>
          <p class="tw-text-gray-200 tw-text-sm ">Santarém, PA</p>
        </div>
        <div>
          <div class="tw-flex tw-items-baseline tw-mt-2">
            <span class="tw-text-3xl tw-font-black tw-text-secondary">R$90,00</span>
            <span class="tw-text-gray-300 tw-text-sm tw-ml-2">no PIX</span>
          </div>
          <p class="tw-text-gray-300 tw-text-xs">
            ou a partir de <span class="tw-font-bold">R$93,60</span> no cartão
          </p>
        </div>
        </div>
      </div>
  </div>


</template>

<style scoped>


</style>
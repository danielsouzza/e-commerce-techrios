<script setup>

</script>

<template>
  <v-container class="lg:tw-flex tw-w-full   px-0">
    <img  src="/assets/images/boat-front.svg" class=" tw-mx-auto  tw-object-cover lg:tw-hidden" alt=""/>
    <img  src="/assets/images/boat-front-lg.svg" class=" !tw-my-auto tw-object-cover tw-hidden lg:tw-block" alt=""/>
    <div class="tw-border-x-[2px]   lg:tw-border-y-[2px] lg:tw-border-x-0  tw-border-[#D9D9D9] tw-px-4 tw-py-0   lg:tw-py-4   tw-w-full md:tw-w-auto   tw-overflow-auto ">
      <div class=" tw-flex tw-items-center  tw-h-full tw-justify-center tw-w-full ">
        <div class="tw-w-full "><slot></slot></div>
      </div>
    </div>
    <img src="/assets/images/boat-back.svg "  class=" tw-mx-auto  tw-object-cover lg:tw-hidden "  alt=""/>
    <img src="/assets/images/boat-back-lg.svg "  class=" tw-my-auto  tw-object-cover tw-hidden lg:tw-block"  alt=""/>
  </v-container>
</template>

<style scoped>

</style>
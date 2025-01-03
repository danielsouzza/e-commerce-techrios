<script setup>

import {Icon} from "@iconify/vue";
import IconsBoat from "../ui-components/IconsBoat.vue";
import SuperOfferStamp from "../ui-components/SuperOfferStamp.vue";

defineProps({
  active: Boolean,
})

</script>

<template>
  <v-card  :color="active ? 'secondary':''" flat class="!tw-rounded-xl !tw-w-[250px]  lg:!tw-w-[270px] " :class="active ? '!tw-border-2' : '' " >
    <v-img
        cover
        class="bg-grey-lighten-2"
        height="200"
        src="https://picsum.photos/350/165?random"
    ></v-img>
    <SuperOfferStamp class="tw-absolute tw-top-[39.5%] tw-right-[50%] " rounded="!tw-rounded-t-lg"/>
    <v-card-title class="tw-bg-white">
      <div class="tw-mb-2">
        <p class="tw-text-p tw-font-bold tw-flex tw-items-center">
          <Icon icon="material-symbols-light:arrow-circle-right" class="mr-2  tw-text-[25px]"/>
          Monte Alegre, PA
        </p>
        <p class="tw-text-p tw-font-bold tw-flex tw-items-center">
          <Icon icon="material-symbols-light:arrow-circle-left" class="mr-2 tw-text-[25px]"/>
          Santarém, PA
        </p>
      </div>
      <div class="tw-flex tw-items-center tw-gap-3 tw-text-p tw-text-sm">
        <IconsBoat/><span> 23/04/2024 • 14h00</span>
      </div>
      <div class="tw-mt-4 tw-text-left">
        <p class="tw-text-sm tw-text-gray-500 ">De <span class="tw-line-through">R$ 83,00</span> por</p>
        <div><span class="tw-text-3xl tw-text-primary tw-font-[900]">R$60,00</span><span class="tw-text-p tw-text-sm"> no PIX</span></div>
        <p class="tw-text-sm tw-text-gray-500">ou a partir de R$ 62,40 no cartão</p>
      </div>
    </v-card-title>
  </v-card>
</template>

<style scoped>

</style>
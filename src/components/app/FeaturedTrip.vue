<script setup>

import {Icon} from "@iconify/vue";
import CardTicket from "../shared/CardTrip.vue";
import {Carousel, Pagination, Slide} from "vue3-carousel";
import CardTripFull from "../shared/CardTripFull.vue";
'vue3-carousel/dist/carousel.css'

const config = {
  itemsToShow: 1,
  gap:5,
  wrapAround: true,
};

</script>

<template>
  <div class=" tw-flex tw-flex-col tw-items-center tw-justify-center !tw-my-5">
    <div class=" tw-text-[25px] tw-font-extrabold tw-text-center tw-text-primary " style="line-height: 28px">
      Viagens em destaques
    </div>
    <v-btn color="secondary" class="my-5" variant="outlined" rounded>
      <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS VIAGENS
        <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
      </div>
    </v-btn>
    <div>

      <Carousel v-bind="config" class="tw-w-[100vw] tw-mb-4 my-carrousel my-carrousel">
        <Slide v-for="n in 4" :key="n" >
          <CardTripFull/>
        </Slide>
        <template #addons>
          <Pagination class=" "/>
        </template>
      </Carousel>
    </div>
  </div>

</template>

<style scoped>
.my-carrousel::v-deep(.carousel__pagination-button){
  padding: 2px !important;
}
.my-carrousel::v-deep(.carousel__pagination-button::after){
  height: 8px !important;
  width: 8px !important;
  border-radius: 50% !important;
  @apply tw-bg-gray-400 !important;
}
.my-carrousel::v-deep(.carousel__pagination-button--active::after){
  @apply tw-bg-secondary !important;
}
</style>
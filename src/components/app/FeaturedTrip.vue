<script setup>

import {Icon} from "@iconify/vue";
import CardTicket from "../shared/CardTrip.vue";
import {Carousel, Pagination, Slide} from "vue3-carousel";
import CardTripFull from "../shared/CardTripFull.vue";
import {ref} from "vue";
'vue3-carousel/dist/carousel.css'



const config_1 = {
  itemsToShow: 1,
  gap:5,
  wrapAround: true,
  breakpoints: {
    // 300px and up
    300: {
      itemsToShow: 1,
      snapAlign: 'center',
    },
    // 400px and up
    400: {
      itemsToShow: 1,
      snapAlign: 'start',
    },
    // 500px and up
    500: {
      itemsToShow: 1,
      gap:5,
      snapAlign: 'start',
    },
  },
};

const config_2 = {
  itemsToShow: 1.5,
  gap:5,
  wrapAround: true,
  breakpoints: {
    // 300px and up
    300: {
      itemsToShow: 1.5,
      snapAlign: 'center',
    },
    // 400px and up
    400: {
      itemsToShow: 2,
      snapAlign: 'center',
    },
    // 500px and up
    500: {
      itemsToShow: 2,
      snapAlign: 'start',
      gap:10,
    },
  },
};

const currentSlide = ref(0);

const gallery = [
  {id:1},
  {id:2},
  {id:3},
  {id:4},
]

</script>

<template>
  <div class=" tw-flex tw-flex-col tw-items-center tw-justify-center !tw-my-5">
    <div class="tw-flex tw-flex-col lg:tw-flex-row  tw-items-center tw-justify-center lg:tw-justify-between tw-w-full">
      <div class=" tw-text-[25px] tw-font-extrabold tw-text-center tw-text-primary " style="line-height: 28px">
        Viagens em destaques
      </div>
      <v-btn color="secondary" class="my-5" variant="outlined" rounded>
        <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS VIAGENS
          <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
        </div>
      </v-btn>
    </div>
    <div class="tw-flex tw-flex-col tw-gap-5 lg:tw-flex-row tw-h-full  tw-justify-between !tw-mt-5 tw-w-full">

      <div class="lg:!tw-w-[50%] !tw-w-full !tw-rounded-xl ">
        <Carousel v-bind="config_1" class="tw-w-[100vw] !tw-rounded-xl lg:tw-w-full tw-mb-4 my-carrousel my-carrousel">
          <Slide v-for="n in 4" :key="n"  class="tw-px-5">
            <CardTripFull/>
          </Slide>
          <template #addons>
            <Pagination class=" "/>
          </template>
        </Carousel>
      </div>
      <div class="lg:!tw-w-[50%] tw-h-full tw-hidden lg:tw-block">
        <Carousel v-bind="config_2" v-model="currentSlide" class="tw-w-[100vw] lg:tw-w-full tw-h-full tw-mb-4 my-carrousel">
          <Slide v-for="n in gallery" :key="n.id" >
            <CardTicket :active="currentSlide === n.id -1"/>
          </Slide>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-carrousel::v-deep(.carousel__pagination-button){
  padding: 2px !important;
}
.my-carrousel::v-deep(.carousel__viewport){
  @apply !tw-rounded-xl
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
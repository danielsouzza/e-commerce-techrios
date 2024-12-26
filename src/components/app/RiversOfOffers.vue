<script setup>
import {Icon} from "@iconify/vue";
import 'vue3-carousel/dist/carousel.css'
import CardTicket from "../shared/CardTrip.vue";
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import {ref} from "vue";

const currentSlide = ref(0);


const config = {
  itemsToShow: 1.5,
  gap:5,
  wrapAround: true,
};

const gallery = [
    {id:1},
    {id:2},
    {id:3},
    {id:4},
]

</script>

<template>
  <div class=" tw-flex tw-flex-col tw-items-center tw-justify-center !tw-mt-5">
    <div class=" tw-text-[25px] tw-font-extrabold tw-text-center tw-text-primary " style="line-height: 28px">
      Rios de ofertas para<br>
      você navegar!
    </div>
    <v-btn color="secondary" class="my-5" variant="outlined" rounded>
      <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS OFERTAS
        <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
      </div>
    </v-btn>
    <div>
      <Carousel v-bind="config" v-model="currentSlide" class="tw-w-[100vw] tw-mb-4 my-carrousel">
        <Slide v-for="n in gallery" :key="n.id" >
          <CardTicket :active="currentSlide === n.id -1"/>
        </Slide>
        <template #addons>
          <Pagination class="!tw-bottom-[-30px] "/>
        </template>
      </Carousel>
    </div>
  </div>
</template>

<style scoped>
.my-carrousel::v-deep(.carousel__pagination-button::after){
  height: 10px !important;
  width: 10px !important;
  border-radius: 50% !important;
  @apply tw-bg-gray-400 !important;
}
.my-carrousel::v-deep(.carousel__pagination-button--active::after){
  @apply tw-bg-secondary !important;
}

</style>
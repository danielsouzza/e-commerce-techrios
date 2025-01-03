<script setup>
import {Icon} from "@iconify/vue";
import 'vue3-carousel/dist/carousel.css'
import CardTicket from "../shared/CardTrip.vue";
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import IconsBoat from "../ui-components/IconsBoat.vue";
import {ref} from "vue";

const currentSlide = ref(0);


const config = {
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
      itemsToShow: 3,
      gap:10,
      snapAlign: 'start',
    },
  },
};

const gallery = [
  {id:1},
  {id:2},
  {id:3},
  {id:4},
]

</script>

<template>
  <div class=" tw-flex tw-flex-col  tw-gap-10 lg:tw-flex-row-reverse lg:tw-items-start tw-justify-center !tw-mt-5">
   <div class="tw-flex tw-flex-col tw-items-center lg:tw-flex-col-reverse">
     <div class="tw-flex tw-flex-col tw-w-full tw-items-center lg:tw-items-start">
       <div class=" tw-text-[25px] tw-font-extrabold tw-text-center lg:tw-text-start lg:tw-text-[35px] tw-text-primary " style="line-height: 35px">
         Viagens com preços <br>
         imbatíveis!
       </div>
       <v-btn color="secondary" class="my-5" variant="outlined" rounded>
         <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS OFERTAS
           <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
         </div>
       </v-btn>
     </div>
     <div class="tw-mb-3 ">
       <div class="tw-flex tw-text-p   "><IconsBoat/> <span  class="tw-ml-3 tw-flex tw-flex-wrap">Viagens saindo de &nbsp;<span class="tw-text-primary tw-font-black" > {{'Santarém, PA'}}</span></span></div>
       <v-autocomplete
           flat
           hide-details
           variant="solo"
           placeholder="Alterar ponto de partida"
           class="my-select mt-1"
           :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']">
       </v-autocomplete>
     </div>
   </div>
    <div class="lg:!tw-w-[75%] ">
      <Carousel v-bind="config" v-model="currentSlide" class="tw-w-[100vw] lg:tw-w-full tw-mb-4 my-carrousel">
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
.my-carrousel::v-deep(.carousel__viewport){
  @apply !tw-rounded-xl
}

.my-select::v-deep(.v-field__input) {
  min-height: 42px !important;
  padding-top: 0!important;
  padding-bottom: 0!important;
}

.my-select::v-deep(input) {
  @apply tw-placeholder-black tw-text-center
}

.my-select::v-deep(.v-field--variant-solo) {
  background: transparent !important;
}

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
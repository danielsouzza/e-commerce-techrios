<script setup>

import {Icon} from "@iconify/vue";
import CardTicket from "../shared/CardTrip.vue";
import {Carousel, Pagination, Slide} from "vue3-carousel";
import CardTripFull from "../shared/CardTripFull.vue";
import {computed, onMounted, ref} from "vue";
import {routes} from "../../services/fetch.js";
'vue3-carousel/dist/carousel.css'


const isDragging = ref(false);
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
    300: {
      itemsToShow: 1.5,
      snapAlign: 'center',
    },
    400: {
      itemsToShow: 2,
      snapAlign: 'center',
    },
    500: {
      mouseDrag:false,
      itemsToShow: 2,
      snapAlign: 'start',
      gap:10,
    },
  },
};

const trechosWithTravels = ref([])
const currentSlide = ref(0);


const travels_more_important = computed(()=>{
  return trechosWithTravels.value.data?.trechos?.data.slice(0,3)
})

const travels_les_important = computed(()=>{
  return trechosWithTravels.value.data?.trechos?.data.slice(3,5)
})


function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('quantia', 5)
  params.append('is_destaque', 1)
  params.append('subdomain', window.subdomain || '')
  console.log(window.subdomain)

  routes["trechos-viagem"](params).then(response => {
    trechosWithTravels.value = response.data
  })
}


onMounted(()=>{
  getTrechosWithTravels()
})

</script>

<template>
  <div class=" tw-flex tw-flex-col tw-items-center tw-justify-center !tw-my-5" v-if="trechosWithTravels.data?.trechos?.data.length > 0">
    <div class="tw-flex tw-flex-col lg:tw-flex-row  tw-items-center tw-justify-center lg:tw-justify-between tw-w-full">
      <div class=" tw-text-[25px] tw-font-extrabold tw-text-center tw-text-primary " style="line-height: 28px">
        Viagens em destaques
      </div>
      <RouterLink  :to="{name: 'viagens-em-destaques'}">
        <v-btn color="secondary" class="my-5" variant="outlined" rounded>
          <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS VIAGENS
            <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
          </div>
        </v-btn>
      </RouterLink>

    </div>
    <div class="tw-flex tw-flex-col tw-gap-5 lg:tw-flex-row tw-h-full  tw-justify-between !tw-mt-5 tw-w-full">

      <div class="lg:!tw-w-[50%] !tw-w-full lg:!tw-rounded-xl ">
        <Carousel v-bind="config_1" class="tw-w-[100vw] lg:!tw-rounded-xl lg:tw-w-full tw-mb-4 my-carrousel my-carrousel">
          <Slide v-for="(item,n) in travels_more_important" :key="item.id"  class="tw-px-5 lg:tw-px-0 tw-h-full">
            <CardTripFull :data="item" class="tw-h-full"/>
          </Slide>
          <template #addons>
            <Pagination class=" "/>
          </template>
        </Carousel>
      </div>
      <div class="lg:!tw-w-[50%] tw-h-full tw-hidden lg:tw-block">
        <Carousel @drag="isDragging=true" @slideEnd="isDragging=false" v-bind="config_2" v-model="currentSlide" class="tw-w-[100vw] lg:tw-w-full tw-h-full tw-mb-4 my-carrousel">
          <Slide v-for="(item,n) in travels_les_important" :key="item.id" >
            <CardTicket :dragging="isDragging" :data="item" :active="currentSlide === n -1"/>
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
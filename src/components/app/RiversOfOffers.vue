<script setup>
import {Icon} from "@iconify/vue";
import 'vue3-carousel/dist/carousel.css'
import CardTicket from "../shared/CardTrip.vue";
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import {onMounted, ref} from "vue";
import {routes} from "../../services/fetch.js";

const loading = ref(true);
const currentSlide = ref(0);
const isDragging = ref(false);
const trechosWithTravels = ref([])

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


function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('is_superoferta', 1)
  params.append('quantia', 8)
  params.append('subdomain', window.subdomain || '')

  routes["trechos-viagem"](params).then(response => {
    trechosWithTravels.value = response.data
    setTimeout(() => {
      loading.value = false
    },500)
  })
}

onMounted(()=>{
  getTrechosWithTravels()
})

</script>

<template>
  <div class=" tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-between !tw-mt-5" v-if="trechosWithTravels.data?.trechos?.data.length > 0">
    <v-skeleton-loader
        v-if="loading"
        class="!tw-bg-transparent"
        width="250"
        type="article"
    >
    </v-skeleton-loader>
     <div  v-else class="tw-flex tw-flex-col tw-items-center lg:tw-items-start">
       <div class=" tw-text-[25px] lg:tw-text-[40px] lg:tw-w-[250px] tw-font-extrabold tw-text-center lg:tw-text-start tw-text-primary " >
         Rios de ofertas para<br>
         você navegar!
       </div>
       <RouterLink  :to="{name: 'super-ofertas'}">
         <v-btn color="secondary" class="my-5" variant="outlined" rounded>
           <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS VIAGENS
             <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
           </div>
         </v-btn>
       </RouterLink>

     </div>
    <div class="lg:!tw-w-[75%] ">
     <div  v-if="loading" class="tw-flex tw-gap-3 tw-w-[100vw]">
       <v-skeleton-loader
           v-for="n in 3"
           class="!tw-rounded-xl"
           width="270"
           type="image, article"
       >
       </v-skeleton-loader>
     </div>
      <Carousel v-else @drag="isDragging=true" @slideEnd="isDragging=false" v-bind="config" v-model="currentSlide" class="tw-w-[100vw] lg:tw-w-full tw-mb-4 my-carrousel">
        <Slide v-for="(item, n) in trechosWithTravels.data?.trechos?.data" :key="item.id">
          <CardTicket super-sale :dragging="isDragging" :data="item" :active="currentSlide === n -1"/>
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
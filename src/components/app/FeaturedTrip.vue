<script setup>

import {Icon} from "@iconify/vue";
import CardTicket from "../shared/CardTrip.vue";
import {Carousel, Pagination, Slide} from "vue3-carousel";
import { Navigation as CarouselNavigation } from 'vue3-carousel'
import CardTripFull from "../shared/CardTripFull.vue";
import {computed, onMounted, ref} from "vue";
import {routes} from "../../services/fetch.js";
import 'vue3-carousel/dist/carousel.css'

// Nova prop para alternar layout
const props = defineProps({
  empresa: {
    type: Boolean,
    default: false
  }
});

const filtersSelected = ref({
    quantia:!!window.subdomain ? 14 : 5
})

const isDragging = ref(false);
const config_1 = {
  itemsToShow: 1,
  gap:5,
  wrapAround: true,
  breakpoints: {
    300: { itemsToShow: 1, snapAlign: 'center' },
    400: { itemsToShow: 1, snapAlign: 'start' },
    500: { itemsToShow: 1, gap:5, snapAlign: 'start' },
  },
};

const config_2 = {
  itemsToShow: 1.5,
  gap:5,
  wrapAround: true,
  breakpoints: {
    300: { itemsToShow: 1.5, snapAlign: 'center' },
    400: { itemsToShow: 2, snapAlign: 'center' },
    500: { mouseDrag:false, itemsToShow: 2, snapAlign: 'start', gap:10 },
  },
};

const trechosWithTravels = ref([])
const currentSlide = ref(0);

const travels = computed(()=> trechosWithTravels.value.data?.trechos?.data || [])

const travels_more_important = computed(()=> travels.value.slice(0,3))
const travels_les_important = computed(()=> travels.value.slice(3))

async function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('quantia', filtersSelected.value.quantia )
  params.append('is_destaque', 1)
  params.append('subdomain', window.subdomain || '')

  routes["trechos-viagem"](params).then(response => {
    const trechos = response.data.data?.trechos?.data || []
    trechos.forEach(trecho => {
      const images = trecho.municipio_destino?.images || []
      if (images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length)
        trecho.municipio_destino.random_image = images[randomIndex]
      }
    })
    trechosWithTravels.value = {
      ...response.data,
      data: {
        ...response.data.data,
        trechos: {
          ...response.data.data.trechos,
          data: trechos
        }
      }
    }
  }).catch(error => {
    console.log(error)
  })
}

function showMoreticket(){
    filtersSelected.value.quantia += 4
    getTrechosWithTravels()
}

onMounted(()=>{
  getTrechosWithTravels()
})
</script>

<template>
  <div v-if="travels.length > 0" class="tw-flex tw-flex-col tw-items-center tw-justify-center !tw-my-5">
    <div class="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-center  tw-w-full" :class="props.empresa  ? 'lg:tw-justify-center mb-7' : 'lg:tw-justify-between' ">
      <div class=" tw-font-extrabold tw-text-center tw-text-primary" :class="props.empresa ?'tw-text-[30px]':'tw-text-[25px]'"  style="line-height: 28px">
        Viagens em Destaques
      </div>
      <RouterLink :to="{name: 'viagens-em-destaque'}" v-if="!props.empresa">
        <v-btn color="secondary" class="my-5" variant="outlined" rounded>
          <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs">VER MAIS VIAGENS
            <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
          </div>
        </v-btn>
      </RouterLink>
    </div>

    <!-- Layout para empresa -->
    <template v-if="props.empresa">
      <div class="tw-w-full tw-flex tw-flex-col tw-gap-5 tw-px-5">
         <v-row >
          <v-col cols="12" sm="6"  >
            <Carousel v-bind="config_1" class="tw-w-full lg:!tw-rounded-xl my-carrousel my-carrousel">
              <Slide v-for="item in travels_more_important" :key="item.id">
                <CardTripFull :data="item" />
              </Slide>
              <template #addons>
                <CarouselNavigation />
                <Pagination class="!tw-bottom-[-15px] "/>
              </template>
            </Carousel>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, idx) in travels_les_important" :key="'row-'+idx" class=" tw-h-full ">
            <CardTicket  :data="item" class="tw-mb-5 tw-mx-auto" />
          </v-col>
         </v-row>
          <div class="tw-flex tw-justify-center mb-5" v-if="filtersSelected.quantia <= trechosWithTravels.data?.trechos.total">
              <v-btn @click="showMoreticket"  flat variant="plain" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                  <Icon icon="line-md:arrow-down" class="mr-2 tw-text-xl"/>
                  Mostrar mais
              </v-btn>
          </div>
      </div>
    </template>

    <!-- Layout padrão (carrossel) -->
    <template v-else>
      <div class="tw-flex tw-flex-col tw-gap-5 lg:tw-flex-row tw-h-full tw-justify-between !tw-mt-5 tw-w-full">
        <div class="lg:!tw-w-[50%] !tw-w-full lg:!tw-rounded-xl ">
          <Carousel @drag="isDragging=true" @touchend="isDragging = false" @slideEnd="isDragging=false" v-bind="config_1" class="tw-w-[100vw] lg:!tw-rounded-xl lg:tw-w-full tw-mb-4 my-carrousel my-carrousel">
            <Slide v-for="(item,n) in travels_more_important" :key="item.id" class="tw-px-5 lg:tw-px-0 tw-h-full">
              <CardTripFull :dragging="isDragging" :data="item" class="tw-h-full"/>
            </Slide>
            <template #addons>
              <CarouselNavigation />
              <Pagination class="!tw-bottom-[-30px] "/>
            </template>
          </Carousel>
        </div>
        <div class="lg:!tw-w-[50%] tw-h-full tw-hidden lg:tw-block" v-if="travels_les_important.length > 0">
          <Carousel @drag="isDragging=true" @touchend="isDragging = false" @slideEnd="isDragging=false" v-bind="config_2" v-model="currentSlide" class="tw-w-[100vw] lg:tw-w-full tw-h-full tw-mb-4 my-carrousel">
            <Slide v-for="(item,n) in travels_les_important" :key="item.id" >
              <CardTicket :dragging="isDragging" :data="item" :active="currentSlide === n -1"/>
            </Slide>
            <template #addons>
              <CarouselNavigation />
              <Pagination class="!tw-bottom-[-30px] "/>
            </template>
          </Carousel>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.my-carrousel::v-deep(.carousel__prev){
  left: -4%;
  @apply tw-text-white
}

.my-carrousel::v-deep(.carousel__next){
  right: -4%;
  @apply tw-text-white
}

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

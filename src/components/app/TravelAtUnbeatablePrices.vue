<script setup>
import {Icon} from "@iconify/vue";
import 'vue3-carousel/dist/carousel.css'
import CardTicket from "../shared/CardTrip.vue";
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import { Navigation as CarouselNavigation } from 'vue3-carousel'
import IconsBoat from "../ui-components/IconsBoat.vue";
import {onMounted, ref} from "vue";
import {routes} from "../../services/fetch.js";
import {municipioLabel} from "../../Helper/Ultis.js";

const origem = ref(null)
const municipios = ref([]);
const currentSlide = ref(0);
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
      itemsToShow: 1.75,
      snapAlign: 'center',
    },
    500: {
      itemsToShow: 2,
      snapAlign: 'center',
    },
    600: {
      itemsToShow: 3,
      gap:10,
      mouseDrag:false,
      snapAlign: 'start',
    },
  },
};


function getMunicipios(search=''){
  const params = {
    search:search,
    subdomain:window.subdomain || ''
  }
  routes["filtros"](params).then(response => {
    if(!response.data.data.success){
      municipios.value = response.data.data.municipiosOrigem;
    }
  })
}

async function getTrechosWithTravels() {
  const params = new URLSearchParams()
  // params.append('com_desconto', 1)
  params.append('origem', origem.value?.slug || '')
  params.append('quantia', 3)
  params.append('subdomain', window.subdomain || '')


  routes["trechos-viagem"](params).then(response => {
    const trechos = response.data.data?.trechos?.data || []


    trechos.forEach(trecho => {
      const images = trecho.municipio_destino?.images || []
      trecho.municipio_destino.random_image = []
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
    getMunicipios()
  })
}

onMounted(()=>{
  getTrechosWithTravels()
  getMunicipios()
})

</script>

<template>
  <div class=" tw-flex tw-flex-col  tw-gap-10 lg:tw-flex-row-reverse  lg:tw-items-start tw-justify-center !tw-mt-5" >
   <div class="tw-flex tw-flex-col tw-items-center lg:tw-items-start lg:tw-flex-col-reverse">
     <div class="tw-flex tw-flex-col tw-w-full tw-items-center lg:tw-items-start">
       <div class=" tw-text-[25px] tw-font-extrabold tw-text-center lg:tw-text-start lg:tw-text-[35px] tw-text-primary " style="line-height: 35px">
         Viagens com preços <br>
         imbatíveis!
       </div>
       <RouterLink  :to="{name: 'viagens-imbativeis'}">
         <v-btn color="secondary" class="my-5" variant="outlined" rounded>
           <div class="tw-flex tw-items-center !tw-font-extrabold !tw-text-xs" >VER MAIS OFERTAS
             <Icon icon="material-symbols-light:arrow-right-alt-rounded" class="ml-2 tw-text-3xl"/>
           </div>
         </v-btn>
       </RouterLink>

     </div>
     <div class="tw-mb-3 tw-w-full">
       <div class="tw-flex tw-text-p   "><IconsBoat/> <span  class="tw-ml-3 tw-flex tw-flex-wrap">Viagens saindo de &nbsp;<span class="tw-text-primary tw-font-black" > {{municipioLabel(origem)}}</span></span></div>
       <v-autocomplete
           flat
           hide-details
           variant="solo"
           v-model="origem"
           item-value="codigo"
           clearable
           item-title="nome"
           return-object
           placeholder="Alterar ponto de partida"
           class="my-select mt-1 "
           @update:search="getMunicipios"
           @update:modelValue="getTrechosWithTravels"
           :items="municipios">
       </v-autocomplete>
     </div>
   </div>
    <div class="lg:!tw-w-[75%] ">
      <Carousel v-if="trechosWithTravels.data?.trechos?.data.length > 0"  v-bind="config" v-model="currentSlide" class="tw-w-[100vw] lg:tw-w-full tw-mb-4 my-carrousel">
        <Slide v-for="(item, n) in trechosWithTravels.data?.trechos?.data" :key="item.id">
          <CardTicket :data="item" :active="currentSlide === n -1"/>
        </Slide>
        <template #addons>
          <CarouselNavigation />
          <Pagination class="!tw-bottom-[-30px] "/>
        </template>
      </Carousel>
      <div v-else class="tw-w-full tw-text-center tw-flex tw-flex-col tw-items-center">
        <Icon icon="ix:anomaly-found" width="60" class=" tw-text-xl tw-text-p"/>
        <p class="tw-text-p mt-1"> Opa, parece que o trecho que está procurando não tem nenhuma promoção.</p>
<!--        <v-btn @click="showFormNotification = true" variant="tonal" color="secondary" class="mt-3">Avise-me</v-btn>-->
      </div>
    </div>
  </div>
</template>


<style scoped>


.my-carrousel::v-deep(.carousel__prev){
  left: -4%;
}

.my-carrousel::v-deep(.carousel__next){
  right: -4%;
}

.my-carrousel::v-deep(.carousel__viewport){
  @apply lg:!tw-rounded-xl
}

.my-select::v-deep(.v-field__input) {
  min-height: 42px !important;
  padding-top: 0!important;
  padding-bottom: 0!important;
}
.my-select::v-deep(.v-field__input.v-autocomplete__selection) {
  @apply  !tw-w-full
}

.my-select::v-deep(input) {
  @apply tw-placeholder-black
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
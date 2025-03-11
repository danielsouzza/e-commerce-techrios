<script setup>
import 'vue3-carousel/dist/carousel.css'
import {Carousel, Slide} from "vue3-carousel";
import {routes} from "../../services/fetch.js";
import {computed, onMounted, ref} from "vue";
import {getApiBaseUrl} from "../../services/api.js";


const data = ref([])
const baseurl = getApiBaseUrl().replaceAll('api','')
const config = {
  itemsToShow: 2,
  gap:10,
  wrapAround: true,
  breakpoints: {
    // 300px and up
    300: {
      itemsToShow: 2,
      snapAlign: 'center',
    },
    // 400px and up
    400: {
      itemsToShow: 2,
      snapAlign: 'center',
    },
    // 500px and up
    500: {
      itemsToShow: 6,
      snapAlign: 'start',
    },
  },
};

function getImagaeRandom(imagens){
  const count = imagens.length
  if (count > 1) {
    const randomIndex = Math.floor(Math.random() * count);
    return imagens[randomIndex].path
  }
  return null;
}

function getDestinations(){
  routes["destinos-procurados"]().then(res => {
    data.value = res.data;
  })
}

onMounted(()=>{
  getDestinations();
})

</script>

<template>

  <v-card color="secondary" >
    <div class="maxWidth">
      <v-card-title class="tw-text-center !tw-px-0  lg:tw-text-start !tw-font-black tw-text-primary !tw-text-2xl !tw-py-5">Destinos mais procurados</v-card-title>
      <Carousel v-bind="config" class="tw-w-[100vw] lg:tw-w-full tw-mb-10 my-carrousel">
        <Slide v-for="(item, n) in data" :key="item.id" >
          <v-img
              cover
              gradient="to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 50%"
              class="!tw-rounded-xl !tw-bg-gray-200"
              height="120"
              width="40"
              :src="baseurl + getImagaeRandom(item.municipio.imagens)"
          >
            <div class="d-flex align-center justify-center tw-absolute tw-bottom-0 tw-text-white tw-p-2 tw-w-full">
             {{item.municipio.nome}}
            </div>
            <template v-slot:placeholder>
              <v-row
                  align="center"
                  class="fill-height ma-0"
                  justify="center"
              >

              </v-row>
            </template>
          </v-img>
        </Slide>
      </Carousel>
    </div>

  </v-card>
</template>

<style scoped>
.my-carrousel::v-deep(.carousel__pagination-button::after){
  height: 10px !important;
  width: 10px !important;
  border-radius: 50% !important;
  @apply tw-bg-white tw-opacity-50 !important;
}
.my-carrousel::v-deep(.carousel__pagination-button--active::after){
  @apply tw-bg-primary !important;
}
</style>
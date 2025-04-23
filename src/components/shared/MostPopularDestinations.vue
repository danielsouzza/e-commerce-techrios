<script setup>
import 'vue3-carousel/dist/carousel.css'
import {Carousel, Slide} from "vue3-carousel";
import {routes} from "../../services/fetch.js";
import {computed, onMounted, ref} from "vue";
import {getApiBaseUrl} from "../../services/api.js";
import router from "../../routes/index.js";
import {formatDateToServe} from "../../Helper/Ultis.js";

const isDragging = ref(false);
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
  if (count > 0) {
    const randomIndex = Math.floor(Math.random() * count);
    return imagens[randomIndex].path
  }
  return null;
}

function getDestinations() {
  routes["destinos-procurados"]({subdomain: window.subdomain || ''})
      .then(res => {
        data.value = res.data.map(item => {
          const imagens = item.municipio.imagens || []
          const imagePath = getImagaeRandom(imagens)
          return {
            ...item,
            randomImage: imagePath,
          }
        });
      })
      .catch(err => {
        console.error("Erro ao buscar destinos:", err);
      });
}


function goToMostPopularPage(item){
  if(!isDragging.value){
    router.push({name: "destinos-mais-procurados",query: {
        destino: item.municipio.slug,
      }})
  }

}

onMounted(()=>{
  getDestinations();
})

</script>

<template>

  <v-card color="secondary" >
    <div class="maxWidth">
      <v-card-title class="tw-text-center !tw-px-0  lg:tw-text-start !tw-font-black tw-text-primary !tw-text-2xl !tw-py-5">Destinos mais procurados</v-card-title>
      <Carousel @drag="isDragging=true" @slideEnd="isDragging=false"  v-bind="config" class="tw-w-[100vw] lg:tw-w-full tw-mb-10 my-carrousel">
        <Slide v-for="(item, n) in data" :key="n"  @click="goToMostPopularPage(item)" class="tw-cursor-pointer">
          <v-img
              cover
              gradient="to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 50%"
              class="!tw-rounded-xl !tw-bg-gray-200"
              height="120"
              :key="n"
              width="40"
              :alt="`Imagem de ${item.municipio.nome}`"
              :src="baseurl + item.randomImage"
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
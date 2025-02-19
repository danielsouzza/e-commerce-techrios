<script setup>
import Banner1 from "../components/widgets/banners/Banner1.vue";
import CardFilter from "../components/shared/CardFilter.vue";
import RiversOfOffers from "../components/app/RiversOfOffers.vue";
import Banner2 from "../components/widgets/banners/Banner2.vue";
import FeaturedTrip from "../components/app/FeaturedTrip.vue";
import TravelAtUnbeatablePrices from "../components/app/TravelAtUnbeatablePrices.vue";
import {routes} from "../services/fetch.js";
import {onMounted, ref} from "vue";
import router from "../routes/index.js";
import {formatDateToServe} from "../Helper/Ultis.js";


const filtersData = ref([])
const filtersSelected = ref({
  origem:null,
  destino:null,
  dataIda:new Date(),
  dataVolta:null,
  type:"ida-e-volta"
})
const bannerSecondaryItems = [
  {
    title: "Banner secondary 1",
    link: "#",
    src: "./src/_mockData/banners/banner-secondary-1.png"
  },
  {
    title: "Banner secondary 2",
    link: "#",
    src: "./src/_mockData/banners/banner-secondary-2.png"
  }
]

const slides = ref([])
function getSlides() {
  routes["banners"]({subdomain:window.subdomain,principal:0}).then(res => {
    slides.value = res.data.data;
  })
}

function getFilterItems(){
  routes["filtros"]().then(res => {
    if(!res.data.data.success){
      filtersData.value = res.data.data;
    }
  })
}

function goToSalePage(query){
  filtersSelected.value = query;
  filtersSelected.value.dataIda = formatDateToServe(query.dataIda);
  filtersSelected.value.dataVolta = query.dataVolta ? formatDateToServe(query.dataVolta) : null;
  router.push({name: "sale",params:{tab:'escolher-passagem'},query: filtersSelected.value})
}

onMounted(() => {
  getFilterItems()
  getSlides()
});


</script>

<template>
  <Banner1 />
  <div class="maxWidth tw-flex tw-flex-col ">
    <CardFilter
        v-model="filtersSelected"
        @update:modelValue="goToSalePage"
        :options="filtersData"
        class=" tw-top-[-80px]  !tw-mb-[-30px] lg:tw-top-[-110px] lg:!tw-mb-[-80px] !tw-mx-5 lg:!tw-mx-0"/>

    <RiversOfOffers class="!tw-my-5"/>

    <div class="tw-grid md:tw-grid-cols-2 tw-gap-2  tw-py-2 tw-px-5 lg:tw-px-0">
      <Banner2 v-for="i in slides.slice(0,2)" :key="i" :src="i.image_url"  :link="i.link"/>
    </div>

    <FeaturedTrip/>
    <TravelAtUnbeatablePrices  class="!tw-my-5 !tw-mb-10"/>
  </div>

</template>

<style scoped>

</style>
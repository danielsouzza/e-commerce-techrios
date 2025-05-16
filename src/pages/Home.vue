<script setup>
import Banner1 from "../components/widgets/banners/Banner1.vue";
import CardFilter from "../components/shared/CardFilter.vue";
import {defineAsyncComponent} from 'vue';
import {routes} from "../services/fetch.js";
import {onMounted, ref} from "vue";
import router from "../routes/index.js";
import {formatDateToServe} from "../Helper/Ultis.js";

// Componentes não críticos com lazy loading
const RiversOfOffers = defineAsyncComponent(() => import("../components/app/RiversOfOffers.vue"));
const Banner2 = defineAsyncComponent(() => import("../components/widgets/banners/Banner2.vue"));
const FeaturedTrip = defineAsyncComponent(() => import("../components/app/FeaturedTrip.vue"));
const TravelAtUnbeatablePrices = defineAsyncComponent(() => import("../components/app/TravelAtUnbeatablePrices.vue"));

const is_enterprise = !!window.subdomain
const filtersData = ref([])
const filtersSelected = ref({
  origem:null,
  destino:null,
  dataIda:new Date(),
  dataVolta:null,
  type:"somente-ida"
})

const slides = ref([])
async function getSlides() {
  routes["banners"]({subdomain:window.subdomain,principal:0}).then(res => {
    slides.value = res.data.data;
  })
}


function goToSalePage(query){
  query.dataIda = formatDateToServe(query.dataIda);
  query.dataVolta = query.dataVolta ? formatDateToServe(query.dataVolta) : null;
  router.push({name: "sale",params:{tab:'escolher-passagem'},query: query})
}

onMounted(() => {
  getSlides()
});


</script>

<template>
  <Banner1 />
  <div class="maxWidth tw-flex tw-flex-col  ">
    <CardFilter
        v-model="filtersSelected"
        @update:modelValue="goToSalePage"
        :options="filtersData"
        class=" tw-top-[-80px]  !tw-mb-[-30px] lg:tw-top-[-110px] lg:!tw-mb-[-80px] !tw-mx-5 lg:!tw-mx-0"/>

    <RiversOfOffers v-if="!is_enterprise" class="!tw-my-5"/>

    <div v-if="!is_enterprise" class="tw-flex tw-items-center tw-flex-col md:tw-grid md:tw-grid-cols-2 tw-gap-2  tw-py-2 tw-px-5 lg:tw-px-0">
      <Banner2 v-for="i in slides.slice(0,2)" :key="i" :src="i.image_url"  :link="i.redirect_url"/>
    </div>

    <FeaturedTrip :empresa="is_enterprise" />
    <TravelAtUnbeatablePrices v-if="!is_enterprise" class="!tw-my-5 !tw-mb-10"/>
  </div>

</template>

<style scoped>

</style>
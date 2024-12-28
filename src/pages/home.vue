<script setup>
import Banner1 from "../components/widgets/banners/Banner1.vue";
import CardFilter from "../components/shared/CardFilter.vue";
import RiversOfOffers from "../components/app/RiversOfOffers.vue";
import Banner2 from "../components/widgets/banners/Banner2.vue";
import FeaturedTrip from "../components/app/FeaturedTrip.vue";
import TravelAtUnbeatablePrices from "../components/app/TravelAtUnbeatablePrices.vue";
import MostPopularDestinations from "../components/shared/MostPopularDestinations.vue";
import CardNewLetters from "../components/shared/CardNewLetters.vue";

const bannerPrimaryItems = [
  {
    title: "Banner primary 1",
    link: "#",
    src: "./src/_mockData/banners/banner-primary-1-full.png"
  }
]

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

</script>

<template>
  <Banner1 :slides="bannerPrimaryItems"/>
  <div class="maxWidth">
    <CardFilter class=" tw-top-[-30px]  !tw-mb-[-30px] lg:tw-top-[-70px] lg:!tw-mb-[-70px]"/>
    <RiversOfOffers class="!tw-my-5"/>
    <div class="tw-grid lg:tw-grid-cols-2 tw-gap-2 tw-px-4 tw-py-2">
      <Banner2 v-for="i in bannerSecondaryItems" :key="i" :src="i.src" :title="i.title" :link="i.link"/>
    </div>
    <FeaturedTrip/>
    <TravelAtUnbeatablePrices  class="!tw-my-5 !tw-mb-10"/>
  </div>

</template>

<style scoped>

</style>
<script setup>

import {onMounted, ref} from "vue";
import {routes} from "../../../services/fetch.js";



const slides = ref([])
function getSlides(){
  routes["banners"]().then(res => {
    slides.value = res.data.data;
    console.log(slides.value)
  })
}

const bannerPrimaryItems = [
  {
    title: "Banner primary 1",
    link: "#",
    src: "./src/_mockData/banners/banner-primary-1-full.png"
  }
]

onMounted(()=>{
  getSlides();
})

</script>

<template>
  <v-carousel
      v-if="slides.length > 0"
      cycle
      continuous
      class=" !tw-w-full !tw-h-full my-carousel"
      show-arrows="hover"
      hide-delimiter-background
  >
    <v-carousel-item
        class="my-carousel"
        v-for="(item,i) in slides"
        lazy-src="https://picsum.photos/1920/500"
        :key="i"
        :src="item.image_url"

    >
      <template v-slot:error>
        <v-img
            class="mx-auto"
            src="https://picsum.photos/1920/500"
        ></v-img>
      </template>
    </v-carousel-item>
  </v-carousel>
</template>

<style scoped>
.my-carousel::v-deep(.v-carousel__controls){
  z-index: 0 !important;
}
</style>
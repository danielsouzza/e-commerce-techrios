<script setup>


import {getApiBaseUrl} from "../../services/api.js";
import {computed} from "vue";

const props = defineProps({
  images:Array,
})

const baseurl = getApiBaseUrl().replaceAll('api','')


const imagesRandom = computed(()=>{
  const count = props.images.length
  if (count > 1) {
    const randomIndex = Math.floor(Math.random() * count);
    return [props.images[randomIndex]];
  }
  return null;
})


</script>

<template>
  <v-carousel
      cycle
      :show-arrows="false"
      continuous
      hide-delimiters
      hide-delimiter-background
  >
    <v-carousel-item


        v-for="(item,i) in imagesRandom"
        cover
        :key="i"
        :src="baseurl + item.path"
    >

    </v-carousel-item>

  </v-carousel>
</template>

<style scoped>

</style>
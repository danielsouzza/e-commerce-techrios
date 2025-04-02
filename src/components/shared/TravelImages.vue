<script setup>


import {getApiBaseUrl} from "../../services/api.js";
import {computed} from "vue";

const props = defineProps({
  images:Array,
  alt:{
    type:String,
    default:'Image do município de destino'
  }
})

const baseurl = getApiBaseUrl().replaceAll('api','')


const imagesRandom = computed(()=>{
  const count = props.images.length
  if (count > 0) {
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
        class="tw-cursor-pointer"
        v-for="(item,i) in imagesRandom"
        cover
        :key="i"
        :src="baseurl + item.path"
        :alt="alt"
    >
    </v-carousel-item>

  </v-carousel>
</template>

<style scoped>

</style>
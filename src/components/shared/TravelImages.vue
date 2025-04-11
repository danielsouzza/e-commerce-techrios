<script setup>
import { getApiBaseUrl } from "../../services/api.js";

const props = defineProps({
  images: Array,
  alt: {
    type: String,
    default: "Imagem do município de destino",
  },
});

const baseurl = getApiBaseUrl().replaceAll("api", "");

// Aqui guardamos a imagem escolhida aleatoriamente

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
        v-for="(item, i) in images"
        cover
        :key="i"
        :src="baseurl + item.path"
        :alt="alt"
    />
  </v-carousel>
</template>

<style scoped></style>

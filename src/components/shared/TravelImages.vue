<script setup>
import { getApiBaseUrl } from "../../services/api.js";
import { ref, onMounted } from "vue";

const props = defineProps({
  images: Array,
  alt: {
    type: String,
    default: "Imagem do município de destino",
  },
});

const baseurl = getApiBaseUrl().replaceAll("api", "");

// Aqui guardamos a imagem escolhida aleatoriamente
const imagesRandom = ref([])

onMounted(() => {
  const count = props.images.length;
  if (count > 0) {
    const randomIndex = Math.floor(Math.random() * count);
    imagesRandom.value = [props.images[randomIndex]];
  }
});
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
        v-for="(item, i) in imagesRandom"
        cover
        :key="i"
        :src="baseurl + item.path"
        :alt="alt"
    />
  </v-carousel>
</template>

<style scoped></style>

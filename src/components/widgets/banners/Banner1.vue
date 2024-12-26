<script setup>

const props = defineProps({
  slides: {
    type: Array,
    default: () => []
  }
})

</script>

<template>
  <v-carousel
      cycle
      continuous
      class="!tw-h-[170px] lg:!tw-h-[300px]"
      show-arrows="hover"
      hide-delimiter-background
  >
    <v-carousel-item
        v-for="(item,i) in slides"
        :key="i"
        :src="item.src"

    ></v-carousel-item>
  </v-carousel>
</template>

<style scoped>

</style>
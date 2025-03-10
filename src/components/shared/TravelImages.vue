<script setup>


import {getApiBaseUrl} from "../../services/api.js";

const props = defineProps({
  images:Array,
})

const baseurl = getApiBaseUrl().replaceAll('api','')


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
        v-for="(item,i) in images"
        cover
        :key="i"
        :src="baseurl + item.path"
    >
      <template v-slot:placeholder>
        <v-row
            align="center"
            justify="center"
        >
          <v-progress-circular
              color="grey-lighten-5"
              indeterminate
          ></v-progress-circular>
        </v-row>
      </template>
    </v-carousel-item>

  </v-carousel>
</template>

<style scoped>

</style>
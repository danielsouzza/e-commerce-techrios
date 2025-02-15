<script setup>

import {onMounted, ref} from "vue";
import {routes} from "../../../services/fetch.js";

const loading = ref(true);

const slides = ref([])
function getSlides() {
  routes["banners"]({subdomain:window.subdomain}).then(res => {
    slides.value = res.data.data;
    console.log(res);
    loading.value = false;
  })
}



onMounted(()=>{
  getSlides();
})

</script>

<template>
  <v-skeleton-loader
      :loading="loading"
      class="!tw-h-full my-load "
      type="image"
  >
    <v-responsive>
      <v-carousel
          v-if="slides.length > 0"
          cycle
          continuous
          class=" !tw-w-full !tw-h-full my-carousel"
          show-arrows="hover"
          hide-delimiter-background
      >
        <v-carousel-item
            class="my-carousel !tw-h-[170px] lg:!tw-h-full "
            cover
            v-for="(item,i) in slides"
            lazy-src="https://picsum.photos/1920/500"
            :key="i"
            :src="item.image_url"

        >
          <template v-slot:error>
            <v-img
                class="mx-auto "
                src="https://picsum.photos/1920/500"
            ></v-img>
          </template>
        </v-carousel-item>
      </v-carousel>
    </v-responsive>
  </v-skeleton-loader>

</template>

<style scoped>

.my-load::v-deep(.v-skeleton-loader__image) {
  height: 500px;
}

.my-carousel::v-deep(.v-carousel__controls){
  z-index: 0 !important;
}
</style>
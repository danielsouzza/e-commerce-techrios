<script setup>

import {onMounted, ref} from "vue";
import {routes} from "../../../services/fetch.js";

const loading = ref(true);

const slides = ref([])
function getSlides() {
  routes["banners"]({subdomain:window.subdomain,principal:1}).then(res => {
    slides.value = res.data.data;
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
        <a   v-for="(item,i) in slides" :href="item.redirect_url" target="_blank" >
          <v-carousel-item
              class="my-carousel !tw-h-[170px] lg:!tw-h-full "
              cover
              :key="i"
              :src="item.image_url"
          >
            <template v-slot:placeholder>
              <v-row
                  align="center"
                  class="fill-height ma-0"
                  justify="center"
              >
                <v-progress-circular
                    color="grey-lighten-5"
                    indeterminate
                ></v-progress-circular>
              </v-row>
            </template>
          </v-carousel-item>
        </a>

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
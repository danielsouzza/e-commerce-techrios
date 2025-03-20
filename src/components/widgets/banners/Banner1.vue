<script setup>
import { onMounted, ref } from "vue";
import { routes } from "../../../services/fetch.js";

const loading = ref(true);
const slides = ref([]);
const imagesLoaded = ref(false); // Contador de imagens carregadas

function getSlides() {
  const subdomain = window?.subdomain || "defaultSubdomain";

  routes["banners"]({ subdomain, principal: 1 })
      .then((res) => {
        slides.value = res.data.data;
      })
      .catch(() => {
        slides.value = [];
      })
      .finally(() => {
        loading.value = false;
      });
}

function imageLoaded(item) {
  imagesLoaded.value = true;
}

onMounted(() => {
  getSlides();
});
</script>

<template>

  <v-skeleton-loader
      :loading="loading"
      class="!tw-h-full my-load"
      type="image"
  >
    <v-responsive >

      <v-carousel
          cycle
          continuous
          class="!tw-w-full !tw-h-full my-carousel"
          show-arrows="hover"
          hide-delimiter-background
      >
        <div v-if="slides.length == 0 || !imagesLoaded " class="carousel-placeholder !tw-h-[170px] lg:!tw-h-[500px]" ></div>

        <a v-for="(item, i) in slides" :key="i" :href="item.redirect_url" :target="item.target">
          <v-carousel-item
              class="my-carousel !tw-h-[170px] lg:!tw-h-full"
              cover
              :class="item.redirect_url ? 'tw-cursor-pointer' : ''"
              :src="item.image_url"
              alt="banner principal"
              @load="imageLoaded"
          >
            <template v-slot:placeholder>
              <v-row align="center" class="fill-height ma-0" justify="center">
                <v-progress-circular color="grey-lighten-5" indeterminate></v-progress-circular>
              </v-row>
            </template>
          </v-carousel-item>
        </a>
      </v-carousel>
    </v-responsive>
  </v-skeleton-loader>
</template>


<style scoped>
.carousel-placeholder {
  background-color: #f0f0f0;
}

.my-load::v-deep(.v-skeleton-loader__image) {
  height: 500px;
}

.my-carousel::v-deep(.v-carousel__controls){
  z-index: 0 !important;
}
</style>
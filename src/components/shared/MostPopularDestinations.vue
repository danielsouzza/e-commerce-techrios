<script setup>
import 'vue3-carousel/dist/carousel.css'
import {Carousel, Pagination, Slide} from "vue3-carousel";

const config = {
  itemsToShow: 2,
  gap:10,
  wrapAround: true,
};

</script>

<template>
  <v-card color="secondary" >
    <v-card-title class="tw-text-center !tw-font-black tw-text-primary !tw-text-2xl !tw-py-5">Destinos mais procurados</v-card-title>
    <Carousel v-bind="config" class="tw-w-[100vw] tw-mb-10 my-carrousel">
      <Slide v-for="n in 4" :key="n" >
        <v-img
            cover
            gradient="to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 50%"
            :lazy-src="`https://picsum.photos/10/6?image=${n * 5 + 10}`"
            class="!tw-rounded-xl"
            height="120"
            width="40"
            src="https://picsum.photos/350/165?random"
        >
          <div class="d-flex align-center justify-center tw-absolute tw-bottom-0 tw-text-white tw-p-2 tw-w-full">
            Manaus, AM
          </div>
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
        </v-img>
      </Slide>
      <template #addons>
        <Pagination class="!tw-bottom-[-30px] "/>
      </template>
    </Carousel>
  </v-card>
</template>

<style scoped>
.my-carrousel::v-deep(.carousel__pagination-button::after){
  height: 10px !important;
  width: 10px !important;
  border-radius: 50% !important;
  @apply tw-bg-white tw-opacity-50 !important;
}
.my-carrousel::v-deep(.carousel__pagination-button--active::after){
  @apply tw-bg-primary !important;
}
</style>
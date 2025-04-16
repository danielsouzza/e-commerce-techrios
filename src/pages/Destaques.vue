<script setup>


import {nextTick, onMounted, ref} from "vue";
import {routes} from "../services/fetch.js";
import CardTicket from "../components/shared/CardTrip.vue";
import {Icon} from "@iconify/vue";
import NotFoundTrips from "../components/shared/NotFoundTrips.vue";

const loading = ref(true);
const filtersSelected = ref({
  quantia:8
})
const trechosWithTravels = ref([])

function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('is_destaque', 1)
  params.append('quantia', filtersSelected.value.quantia)
  params.append('subdomain', window.subdomain || '')
  loading.value = true
  routes["trechos-viagem"](params).then(response => {
    const trechos = response.data.data?.trechos?.data || []


    trechos.forEach(trecho => {
      const images = trecho.municipio_destino?.images || []
      if (images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length)
        trecho.municipio_destino.random_image = images[randomIndex]
      }
    })

    trechosWithTravels.value = {
      ...response.data,
      data: {
        ...response.data.data,
        trechos: {
          ...response.data.data.trechos,
          data: trechos
        }
      }
    }
    nextTick(()=> loading.value = false)
  })
}

function showMoreticket(){
  filtersSelected.value.quantia += 4
  getTrechosWithTravels()
}

onMounted(()=>{
  getTrechosWithTravels()
})

</script>

<template>

  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Viagem em destaques</strong> </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <v-row v-if="trechosWithTravels.data?.trechos?.data.length > 0"   class="my-3">
      <v-col cols="12" lg="3" md="4" v-for="(item, n) in trechosWithTravels.data?.trechos?.data" :key="item.id">
        <CardTicket :data="item"/>
      </v-col>
    </v-row>
    <div class="tw-flex tw-justify-center tw-min-h-[30vh] tw-items-center"  v-else-if="loading">
      <v-progress-circular
          width="2"
          color="white"
          size="90"
          indeterminate
      ></v-progress-circular>
    </div>
    <NotFoundTrips v-else class="tw-min-h-[30vh]" ></NotFoundTrips>
    <div class="tw-flex tw-justify-center mb-5">
      <v-btn @click="showMoreticket" v-if="filtersSelected.quantia <= trechosWithTravels.data?.trechos.total" flat variant="plain" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
        <Icon icon="line-md:arrow-down" class="mr-2 tw-text-xl"/>
        Mostrar mais
      </v-btn>
    </div>
  </div>
</template>

<style scoped>

</style>
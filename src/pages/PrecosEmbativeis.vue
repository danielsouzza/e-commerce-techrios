<script setup>


import {nextTick, onMounted, ref} from "vue";
import {routes} from "../services/fetch.js";
import CardTicket from "../components/shared/CardTrip.vue";
import {Icon} from "@iconify/vue";
import {municipioLabel} from "../Helper/Ultis.js";
import IconsBoat from "../components/ui-components/IconsBoat.vue";
import NotFoundTrips from "../components/shared/NotFoundTrips.vue";

const loading = ref(true);
const filtersSelected = ref({
  quantia:8,origem:null,
})
const trechosWithTravels = ref([])
const municipios = ref([])

function getTrechosWithTravels() {
  trechosWithTravels.value = []
  const params = new URLSearchParams()
  params.append('com_desconto', 1)
  params.append('origem', filtersSelected.value.origem ||'')
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
    nextTick(()=>{
      loading.value = false

    })
  })
}

function showMoreticket(){
  filtersSelected.value.quantia += 4
  getTrechosWithTravels()
}

function getMunicipios(search=''){
  const params = {
    search:search,
    com_desconto:1
  }
  routes["filtros"](params).then(response => {
    if(!response.data.data.success){
      municipios.value = response.data.data.municipiosOrigem;
    }
  })
}


onMounted(()=>{
  getTrechosWithTravels()
  getMunicipios()
})

</script>

<template>

  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Viagens com preços imbatíveis!</strong> </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <div class="tw-mb-3 my-4 ">
      <div class="tw-flex tw-text-p   "><IconsBoat/> <span  class="tw-ml-3 tw-flex tw-flex-wrap tw-font-semibold">Viagens saindo de</span></div>
      <v-autocomplete
          flat
          hide-details
          clearable
          variant="solo"
          v-model="filtersSelected.origem"
          item-value="slug"
          item-title="nome"
          placeholder="Alterar ponto de partida"
          class="my-select mt-1"
          @update:search="getMunicipios"
          @update:modelValue="getTrechosWithTravels"
          :items="municipios">
      </v-autocomplete>
    </div>
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
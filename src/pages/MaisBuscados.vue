<script setup>


import {onMounted, ref, watch} from "vue";
import {routes} from "../services/fetch.js";
import CardTicket from "../components/shared/CardTrip.vue";
import {Icon} from "@iconify/vue";
import {municipioLabel} from "../Helper/Ultis.js";
import IconsBoat from "../components/ui-components/IconsBoat.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const loading = ref(true);
const municipios = ref([])
const filtersSelected = ref({
  destino:null,
  quantia:8
})
const trechosWithTravels = ref([])

function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('destino', filtersSelected.value.destino || '')
  params.append('quantia', filtersSelected.value.quantia)
  params.append('subdomain', window.subdomain || '')

  routes["trechos-viagem"](params).then(response => {
    trechosWithTravels.value = response.data
    setTimeout(() => {
      loading.value = false
    },500)
  })
}

function showMoreticket(){
  filtersSelected.value.quantia += 4
  getTrechosWithTravels()
}

function getDestinations(){
  routes["destinos-procurados"]().then(res => {
    municipios.value = res.data.map(it=>it.municipio);
  })
}

watch(()=>route.query.destino,()=>{
  filtersSelected.value.destino = route.query.destino || null;
  getTrechosWithTravels()
})

onMounted(()=>{
  filtersSelected.value.destino = route.query.destino || null;
  getTrechosWithTravels()
  getDestinations();
})

</script>

<template>

  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Destinos mais procurados</strong> </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <v-row v-if="trechosWithTravels.data?.trechos?.data.length > 0"   class="my-3">
      <v-col cols="12"  >
        <div class="tw-mb-3 ">
          <div class="tw-flex tw-text-p   "><IconsBoat/> <span  class="tw-ml-3 tw-flex tw-flex-wrap">Cidades:<span class="tw-text-primary tw-font-black" > {{municipioLabel(origem)}}</span></span></div>
          <v-autocomplete
              flat
              hide-details
              variant="solo"
              v-model="filtersSelected.destino"
              item-value="slug"
              item-title="nome"
              placeholder="Alterar cidade de destino"
              class="my-select mt-1"
              @update:search="getDestinations"
              @update:modelValue="getTrechosWithTravels"
              :items="municipios">
          </v-autocomplete>
        </div>
      </v-col>
      <v-col cols="12" lg="3" md="4" v-for="(item, n) in trechosWithTravels.data?.trechos?.data" :key="item.id">
        <CardTicket :data="item"/>
      </v-col>
    </v-row>
    <div v-else class="tw-w-full tw-text-center tw-flex tw-flex-col tw-items-center">
      <Icon icon="ix:anomaly-found" width="60" class=" tw-text-xl tw-text-p"/>
      <p class="tw-text-p mt-1">Nenhuma passagem encontrada</p>
    </div>
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
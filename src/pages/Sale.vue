<script setup>

import {Icon} from "@iconify/vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {routes} from "../services/fetch.js";
import BaseCard from "../components/shared/BaseCard.vue";
import CardTicket from "../components/shared/CardTicket.vue";
import CardFilter from "../components/shared/CardFilter.vue";
import {formatCurrency, formatDate, formatMoney, getMonicipioLabel} from "../Helper/Ultis.js";

const route = useRoute();
const ticketSelected = ref([])
const filtersData = ref([])
const stepSale = ref(1)
const trechosWithTravels = ref([])
const filtersSelected = ref({
  origem:null,
  destino:null,
  dataIda:null,
  dataVolta:null,
})


const updateFilters = () => {
  filtersSelected.value.origem = parseInt(route.query.origem) || null;
  filtersSelected.value.destino = parseInt(route.query.destino) || null;
  filtersSelected.value.dataIda = new Date(route.query.dataIda) || '';
  filtersSelected.value.dataVolta = route.query.dataVolta || null;
};


function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('origem', filtersSelected.value.origem || '')
  params.append('destino', filtersSelected.value.destino || '')
  params.append('data_hora', formatDate(filtersSelected.value.dataIda) || '')
  routes["trechos-viagem"](params).then(response => {
    trechosWithTravels.value = response.data
    console.log(trechosWithTravels.value)
  })
}

function getFilterItems(){
  routes["filtros"]().then(res => {
    if(!res.data.data.success){
      filtersData.value = res.data.data;
    }
  })
}

function nextStep(){
  stepSale.value = stepSale.value + 1;
}

function prevStep(){
  stepSale.value = stepSale.value - 1;
}

function saveTicket(items){
  ticketSelected.value = items;
  nextStep();
}

function calculateTotal(){
  const rooms = ticketSelected.value.rooms.length * parseInt(formatMoney(ticketSelected.value.trecho.valor))
  const taxa = ticketSelected.value.rooms.length * parseInt(formatMoney(ticketSelected.value.trecho.taxa_de_embarque))
  return rooms + taxa;
}

onMounted(() => {
  updateFilters();
  getFilterItems()
  getTrechosWithTravels()
});


</script>

<template>
  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex lg:!tw-mb-[50px] !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-4 px-5 lg:tw-text-lg">Passagem de <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem',filtersData)}}</strong> para <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}</strong></div>

      <v-btn color="secondary" class="mb-3 lg:!tw-hidden" variant="outlined" rounded >
        <div class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
          <Icon icon="flowbite:arrows-repeat-outline" class="mr-2 tw-text-xl"/>
          INVERTER
        </div>
      </v-btn>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3">
    <CardFilter
        v-model="filtersSelected"
        @update:modelValue="getTrechosWithTravels()"
        :options="filtersData"
        class=" tw-top-[-30px]  !tw-mb-[-30px] lg:tw-top-[-70px] lg:!tw-mb-[-70px] !tw-mx-5 lg:!tw-mx-0 !tw-hidden lg:!tw-block" />
    <v-card flat  class=" my-3 !tw-px-3 !tw-py-2 !tw-hidden">
      <div class="tw-flex tw-justify-between tw-items-center tw-p-2 tw-text-[12px] tw-rounded-lg">
        <div class="tw-text-p tw-font-semibold ">Dom, 28 abr</div>
        <div class="tw-text-p tw-flex tw-items-center tw-font-semibold">Alterar data Viagem <Icon icon="uis:calendar" class="ml-2"/></div>
      </div>
    </v-card>
    <div v-if="stepSale == 1" class="tw-flex tw-justify-between tw-items-center  tw-px-3 mt-5 lg:!tw-hidden">
      <div class="tw-font-bold  ">
        Selecionar sua viagem
      </div>
      <div class="tw-flex tw-justify-between tw-text-sm tw-items-center tw-text-p/50 tw-font-semibold">
        Filtrar  <Icon icon="mage:filter-fill" class="ml-2 tw-text-xl tw-text-p"/>
      </div>
    </div>

    <div class="lg:tw-flex tw-items-center !tw-my-10  tw-hidden">
      <v-btn variant="outlined" color="secondary" rounded @click="prevStep">

        <Icon icon="mingcute:ship-line" class="ml-2 tw-text-xl" />
        SELECIONE A SUA VIAGEM
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" color="grey100" rounded>
        <Icon icon="fluent:wallet-credit-card-20-regular" class="ml-2 tw-text-xl"/>
        PAGAR E INFORMAR DADOS
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" color="grey100" rounded>
        <Icon icon="icon-park-outline:ticket" class="ml-2 tw-text-xl"/>
        CONFIRMAÇÃO DA VIAGEM
      </v-btn>
    </div>
    <div v-if="stepSale == 1" class="tw-flex tw-justify-between my-3 tw-gap-10">
      <v-card width="30%" rounded="lg" flat class="lg:!tw-block !tw-hidden tw-h-full">
        <v-container fluid>
          <p class="tw-font-semibold tw-px-3">Horário de Saída</p>
          <div>
            <v-checkbox
                v-model="selected"
                label="Manhã(6h - 1h59)"
                hide-details
                value="John"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Tarde(12h - 17h59)"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Noite(18h -23h59)"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Madrugada(00h - 5h59)"
                hide-details
                value="Jacob"
            ></v-checkbox>
          </div>

          <p class="tw-font-semibold tw-px-3 mt-1">Tipo de Assento</p>
          <div>
            <v-checkbox
                v-model="selected"
                label="Assento/Poltrona"
                hide-details
                value="John"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Rede"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Camarote"
                hide-details
                value="Jacob"
            ></v-checkbox>
          </div>

          <p class="tw-font-semibold tw-px-3  mt-1 ">Companhia</p>
          <div>
            <v-checkbox
                v-model="selected"
                label="São Bartolomeu VI"
                hide-details
                value="John"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="LM Zé Holanda"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="FB OGP III"
                hide-details
                value="Jacob"
            ></v-checkbox>
          </div>
        </v-container>
      </v-card>
      <div class="tw-flex tw-flex-col tw-gap-3 tw-w-full">
        <v-card  flat  class=" my-3 !tw-px-3 !tw-py-2">
          <div class="tw-flex tw-justify-between tw-items-center tw-p-2 tw-text-[12px]">
            <div class="tw-text-p tw-font-semibold ">Dom, 28 abr</div>
            <div class="tw-text-p tw-flex tw-items-center tw-font-semibold">Alterar data Viagem <Icon icon="uis:calendar" class="ml-2"/></div>
          </div>
        </v-card>
        <CardTicket v-for="item in trechosWithTravels.data?.trechos?.data" :data="item" class="!tw-h-fit" @continue="saveTicket"></CardTicket>
      </div>
    </div>

    <v-expand-x-transition  class="tw-flex tw-justify-between my-3 tw-gap-10" >
      <div v-if="stepSale === 2" >
        <BaseCard title="Pague no pix com desconto">
          <div class="tw-flex tw-flex-col tw-px-4 tw-py-2">
            <div class=" tw-font-bold tw-text-gray-800 ">Resumo da viagem</div>
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
            <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-1">IDA</div>
            <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
              <v-col cols="6" class="tw-flex tw-items-center  ">
                <Icon icon="uis:calendar" class="mr-2" width="15"/>{{ticketSelected.trecho.horario}}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center  ">
                <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{ticketSelected.trecho.tempo_viagem}}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center  ">
                <Icon icon="solar:map-arrow-up-bold" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem', filtersData)}}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center  ">
                <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{'Poltrona'}}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center  ">
                <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center  ">
                <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{ticketSelected.trecho.embarcacao}}
              </v-col>
            </v-row>
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
            <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
              <v-col cols="6" class="tw-flex tw-items-center !tw-py-2  tw-text-xs ">
                <Icon icon="icon-park-outline:ticket" class="mr-2" width="15"/>{{ticketSelected.rooms.length}} {{ticketSelected.rooms.length > 1 ? 'passagens' : 'passagens'}}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center !tw-py-2 !tw-font-black tw-text-sm !tw-text-primary tw-justify-end">
                {{formatCurrency(ticketSelected.rooms.length * parseInt(formatMoney(ticketSelected.trecho.valor))) }}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs ">
                <Icon icon="icon-park-outline:doc-search-two" class="mr-2" width="15"/>Taxa de serviço
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs  tw-justify-end">
                {{ticketSelected.trecho.taxa_de_embarque}}
              </v-col>
            </v-row>
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
            <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
              <v-col cols="6" >
                Total à vista
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center  !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                <div class="tw-text-end">
                  {{formatCurrency(calculateTotal())}}<br>
                  <p class="tw-text-xs tw-text-gray-500 tw-font-light">ou a partir de R$ 62,40 no cartão</p>
                </div>
              </v-col>
            </v-row>
          </div>
        </BaseCard>
      </div>
    </v-expand-x-transition>
  </div>
</template>

<style scoped>
.v-input--density-default {
  --v-input-control-height: auto !important;
  --v-input-padding-top: 16px;
}
</style>
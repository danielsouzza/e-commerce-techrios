<script setup>

import SuperOfferStamp from "../ui-components/SuperOfferStamp.vue";
import {
  calcularValorParcelado,
  formatCurrency,
  formatDateToServe,
  formatMoney,
  municipioLabel
} from "../../Helper/Ultis.js";
import router from "../../routes/index.js";
import {getApiBaseUrl} from "../../services/api.js";

const props = defineProps({
  data: Object,
  dragging:Boolean,
})

const baseurl = getApiBaseUrl().replaceAll('api','')

function goToSalePage(){
  if(props.dragging)return;
  router.push({name: "sale",params:{tab:'escolher-passagem'}, query: {
      destino: props.data?.municipio_destino.codigo,
      origem: props.data?.municipio_origem.codig,
      dataIda: formatDateToServe(new Date(props.data?.data_embarque)),
      type:'somente-ida'
    }})
}

</script>

<template>
  <div  @click="goToSalePage" class="tw-relative tw-w-[100vw] lg:tw-w-full tw-h-full tw-rounded-xl tw-overflow-hidden tw-shadow-lg tw-cursor-pointer">
    <div
        class="tw-w-full tw-h-[300px] md:tw-h-[500px] lg:tw-h-[405px] !tw-rounded-xl tw-bg-cover tw-bg-center"
        :style="{ backgroundImage: `url('${baseurl}${data.municipio_destino.image}')` }">
    </div>


    <div class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-bg-gradient-to-t tw-from-black/100 tw-via-black/50 tw-to-transparent"></div>

    <div class="tw-absolute tw-bottom-0 tw-p-4 tw-w-full tw-text-white">
      <SuperOfferStamp class=""/>

      <div class="tw-flex tw-justify-between tw-mb-5 tw-items-end">
        <div class="tw-font-extrabold">
          <p class="tw-mt-2 tw-text-gray-200 tw-text-sm "> {{municipioLabel(data?.municipio_origem)}}</p>
          <p class="tw-text-gray-200 tw-text-sm ">{{ municipioLabel(data?.municipio_destino)}}</p>
        </div>
        <div>
          <div class="tw-flex tw-items-baseline tw-mt-2">
            <span class="tw-text-3xl tw-font-black text-secondary">{{data.desconto ? formatCurrency(formatMoney(data.valor) - data.desconto.desconto) : data.valor}}</span>
            <span class="tw-text-gray-300 tw-text-sm tw-ml-2">no PIX</span>
          </div>
          <p class="tw-text-gray-300 tw-text-xs">
            ou a até 6x de <span class="tw-font-bold">{{ calcularValorParcelado(data) }}</span> no cartão
          </p>
        </div>
        </div>
      </div>
  </div>


</template>

<style scoped>


</style>
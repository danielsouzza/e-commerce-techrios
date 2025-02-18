<script setup>

import {Icon} from "@iconify/vue";
import IconsBoat from "../ui-components/IconsBoat.vue";
import SuperOfferStamp from "../ui-components/SuperOfferStamp.vue";
import {
  calcularValorParcelado, calcularValorPix,
  formatarHora,
  formatCurrency,
  formatDate,
  formatDateToServe,
  formatMoney,
  municipioLabel
} from "../../Helper/Ultis.js";
import router from "../../routes/index.js";
import {getApiBaseUrl} from "../../services/api.js";

const baseurl = getApiBaseUrl().replaceAll('api','')
const props = defineProps({
  data:Object,
  active: Boolean,
  dragging: Boolean,
  superSale:{
    type:Boolean,
    default:false
  }
})

function goToSalePage(){
  if(props.dragging)return;
  router.push({name: "sale",params:{tab:'escolher-passagem'},query: {
      destino: props.data?.municipio_destino.codigo,
      origem: props.data?.municipio_origem.codig,
      dataIda: formatDateToServe(new Date(props.data?.data_embarque)),
      type:'somente-ida'
    }})
}


</script>

<template>
  <v-card @click="goToSalePage" hover  flat class="!tw-rounded-xl !tw-w-[250px]  lg:!tw-w-[270px] tw-h-full hover:tw-border-secondary hover:!tw-border-2"  >
    <v-img
        cover
        class="bg-grey-lighten-2"
        height="200"
        :src="baseurl + data.municipio_destino.image"
    ></v-img>
    <SuperOfferStamp v-if="superSale" class="tw-absolute tw-top-[39.5%] tw-right-[50%] " rounded="!tw-rounded-t-lg"/>
    <v-card-title class="tw-bg-white lg:!tw-h-full">
      <div class="tw-mb-2">
        <p class="tw-text-p tw-font-bold tw-flex tw-items-center">
          <Icon icon="material-symbols-light:arrow-circle-right" class="mr-2  tw-text-[25px]"/>
          {{municipioLabel(data?.municipio_origem)}}
        </p>
        <p class="tw-text-p tw-font-bold tw-flex tw-items-center">
          <Icon icon="material-symbols-light:arrow-circle-left" class="mr-2 tw-text-[25px]"/>
          {{ municipioLabel(data?.municipio_destino)}}
        </p>
      </div>
      <div class="tw-flex tw-items-center tw-gap-3 tw-text-p tw-text-sm">
        <IconsBoat/><span>{{formatDate(data?.saida)}} • {{formatarHora(data?.horario)}}</span>
      </div>
      <div class="tw-mt-4 tw-text-left">
        <p v-if="data?.desconto" class="tw-text-sm tw-text-gray-500 ">De <span class="tw-line-through">{{ formatCurrency(formatMoney(data.valor))}}</span> por</p>
        <div><span class="tw-text-2xl tw-text-primary tw-font-[900]">{{calcularValorPix(data)}}</span><span class="tw-text-p tw-text-[10px]"> no PIX</span></div>
        <p class="tw-text-[12px] tw-text-gray-500 tw-text-wrap">ou a partir de {{calcularValorParcelado(data)}}  no cartão</p>
      </div>
    </v-card-title>
  </v-card>
</template>

<style scoped>

</style>
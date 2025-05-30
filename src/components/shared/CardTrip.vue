<script setup>

import {Icon} from "@iconify/vue";
import IconsBoat from "../ui-components/IconsBoat.vue";
import SuperOfferStamp from "../ui-components/SuperOfferStamp.vue";
import {
  calcularValor,
  calcularValorParcelado, calcularValorPix,
  formatarHora,
  formatCurrency,
  formatDate,
  formatDateToServe,
  formatMoney,
  municipioLabel
} from "../../Helper/Ultis.js";
import router from "../../routes/index.js";
import TravelImages from "./TravelImages.vue";
import {computed} from "vue";
import {useLoadingStore} from "../../store/states.js";


const props = defineProps({
  data:Object,
  active: Boolean,
  dragging: Boolean,
  superSale:{
    type:Boolean,
    default:false
  }
})

const valor = computed(()=>{
  return formatMoney(props.data?.valor) + formatMoney(props.data?.taxa_de_embarque);
})

const superSale = computed(() => {
  const valorOriginal = formatMoney(props.data?.valor) + formatMoney(props.data?.taxa_de_embarque);
  const desconto = props.data?.desconto?.desconto ? props.data.desconto.desconto : 0;
  if (!valorOriginal || !desconto) return false;
  const percentual = (desconto / valorOriginal) * 100;
  return percentual >= 30;
});

function goToSalePage(){
  if(props.dragging)return;
    const loadingStore = useLoadingStore();
    loadingStore.startLoading();
  router.push({name: "escolher-passagem",params:{
          origem: props.data?.municipio_origem.slug,
          destino: props.data?.municipio_destino.slug,
          dataIda: formatDateToServe(new Date(props.data?.data_embarque)),
          type:'somente-ida'
      }
  })
}



</script>

<template>
  <v-card @click="goToSalePage" hover  flat class="!tw-rounded-xl !tw-w-[250px]  lg:!tw-w-[270px] tw-h-full hover:tw-border-secondary hover:!tw-border-2"  >

    <TravelImages :alt="data.municipio_destino.nome"  :images="[data?.municipio_destino?.random_image]"   class="bg-grey-lighten-2 !tw-h-[200px] "/>


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
        <IconsBoat :type="data.tipo_embarcacao"/><span>{{formatDate(data?.data_embarque)}} • {{formatarHora(data?.horario)}}</span>
      </div>

      <div class="tw-mt-4 tw-text-left">

        <p v-if="data?.desconto" class="tw-text-sm tw-text-gray-500 ">De <span class="tw-line-through">{{ formatCurrency(valor)}}</span> por</p>
        <div><span class="tw-text-2xl tw-text-primary tw-font-[900]">{{formatCurrency(calcularValor(valor, data.desconto?.desconto))}}</span><span class="tw-text-p tw-text-[10px]"> no PIX</span></div>
        <p class="tw-text-[12px] tw-text-gray-500 tw-text-wrap">ou a partir de {{formatCurrency(calcularValor(valor, data.desconto?.desconto,-0.04))}}  no cartão</p>
      </div>
    </v-card-title>
  </v-card>
</template>

<style scoped>

</style>

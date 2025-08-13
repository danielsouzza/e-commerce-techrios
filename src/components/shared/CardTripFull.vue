<script setup>
import SuperOfferStamp from "../ui-components/SuperOfferStamp.vue";
import {
  calcularValor,
  calcularValorParcelado,
  formatCurrency,
  formatDateToServe,
  formatMoney,
  municipioLabel
} from "../../Helper/Ultis.js";
import router from "../../routes/index.js";
import { getApiBaseUrl } from "../../services/api.js";
import { ref, onMounted, onUnmounted, computed } from "vue";
import {useLoadingStore} from "../../store/states.js";

const props = defineProps({
  data: Object,
  dragging: Boolean,
});

const baseurl = getApiBaseUrl().replaceAll("api", "");

const imagesRandom = computed(()=>{
  const count =  props.data?.municipio_destino.images.length
  if (count > 0) {
    const randomIndex = Math.floor(Math.random() * count);
    return [ props.data?.municipio_destino.images[randomIndex]];
  }
  return null;
})

const imagens = computed(() => {
  const imgs = imagesRandom.value?.map(img => img.path) || [];
  return imgs.length > 0 ? imgs : [ "/images/default.jpg"];
});

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

function goToSalePage() {
  if (props.dragging) return;
    const loadingStore = useLoadingStore();
    loadingStore.startLoading();
    router.push({
        name: "escolher-passagem",
        params: {  destino: props.data?.municipio_destino.slug,
            origem: props.data?.municipio_origem.slug,
            dataIda: formatDateToServe(new Date(props.data?.data_embarque)),
            type: "somente-ida",
        }
    });
}
</script>

<template>
  <div
      @click="goToSalePage"
      class="tw-relative tw-w-[100vw] lg:tw-w-full tw-h-full tw-rounded-xl tw-overflow-hidden tw-shadow-lg tw-cursor-pointer"
  >
    <!-- Contêiner do Carrossel -->
    <div class="tw-w-full tw-h-[300px] md:tw-h-[500px] lg:tw-h-[405px] tw-overflow-hidden">
      <div
          class="tw-flex tw-h-full tw-w-full tw-transition-transform tw-duration-700 tw-ease-in-out">
        <div
            v-for="(image, index) in imagens"
            :key="index"
            class="tw-w-full tw-h-full tw-bg-cover tw-bg-center tw-flex-shrink-0"
            :style="{ backgroundImage: `url('${baseurl}${image}')` }"
        ></div>
      </div>
    </div>

    <!-- Gradiente de escurecimento -->
    <div
        class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-bg-gradient-to-t tw-from-black/100 tw-via-black/50 tw-to-transparent"
    ></div>

    <!-- Conteúdo -->
    <div class="tw-absolute tw-bottom-0 tw-p-4 tw-w-full tw-text-white">
      <SuperOfferStamp v-if="superSale" />

      <div class="tw-flex tw-justify-between tw-mb-5 tw-items-end">
        <div class="tw-font-extrabold">
          <p class="tw-mt-2 tw-text-gray-200 tw-text-sm">
            {{ municipioLabel(data?.municipio_origem) }}
          </p>
          <p class="tw-text-gray-200 tw-text-sm">
            {{ municipioLabel(data?.municipio_destino) }}
          </p>
        </div>
        <div>
          <div class="tw-flex tw-items-baseline tw-mt-2">
            <span class="tw-text-3xl tw-font-black text-secondary">
              {{formatCurrency(calcularValor(valor, data.desconto?.desconto))}}
            </span>
            <span class="tw-text-gray-300 tw-text-sm tw-ml-2">no PIX</span>
          </div>
          <p class="tw-text-gray-300 tw-text-xs">
            ou a até 6x de <span class="tw-font-bold">{{formatCurrency(calcularValor(valor, data.desconto?.desconto,-0.05))}}</span> no cartão
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Suaviza a transição entre imagens */
.tw-transition-transform {
  transition: transform 0.5s ease-in-out;
}
</style>

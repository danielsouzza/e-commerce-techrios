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
import { getApiBaseUrl } from "../../services/api.js";
import { ref, onMounted, onUnmounted, computed } from "vue";

const props = defineProps({
  data: Object,
  dragging: Boolean,
});

const baseurl = getApiBaseUrl().replaceAll("api", "");

// Obtendo imagens corretamente e garantindo que haja pelo menos uma imagem
const imagens = computed(() => {
  const imgs = props.data?.municipio_destino.images?.map(img => img.path) || [];
  return imgs.length > 0 ? imgs : [ "/images/default.jpg"];
});

// Índice da imagem atual
const currentImageIndex = ref(0);

// Troca a imagem a cada 6 segundos
let intervalId = null;
onMounted(() => {
  if (imagens.value.length > 1) {
    intervalId = setInterval(() => {
      currentImageIndex.value = (currentImageIndex.value + 1) % imagens.value.length;
    }, 6000);
  }
});

// Limpa o intervalo quando o componente for destruído
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

function goToSalePage() {
  if (props.dragging) return;
  router.push({
    name: "sale",
    params: { tab: "escolher-passagem" },
    query: {
      destino: props.data?.municipio_destino.codigo,
      origem: props.data?.municipio_origem.codigo,
      dataIda: formatDateToServe(new Date(props.data?.data_embarque)),
      type: "somente-ida",
    },
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
          class="tw-flex tw-h-full tw-w-full tw-transition-transform tw-duration-700 tw-ease-in-out"
          :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
      >
        <!-- Imagens -->
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
      <SuperOfferStamp />

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
              {{ data.desconto ? formatCurrency(formatMoney(data.valor) - data.desconto.desconto) : data.valor }}
            </span>
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
/* Suaviza a transição entre imagens */
.tw-transition-transform {
  transition: transform 0.5s ease-in-out;
}
</style>

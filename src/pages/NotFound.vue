<script setup>
import CardFilter from "../components/shared/CardFilter.vue";
import FeaturedTrip from "../components/app/FeaturedTrip.vue";
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLoadingStore } from "../store/states.js";

const router = useRouter();
const filterData = ref({
  origem: null,
  destino: null,
  dataIda: null,
  dataVolta: null,
  type: 'somente-ida'
});

const filterOptions = ref({});
const isLoading = ref(false);

// Função para formatar data para o servidor
function formatDateToServe(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Função para ir para a página de escolher passagem
function goToSalePage(query) {
  const loadingStore = useLoadingStore();
  query.dataIda = formatDateToServe(query.dataIda);
  query.dataVolta = query.dataVolta ? formatDateToServe(query.dataVolta) : null;

  loadingStore.startLoading();
  router.push({
    name: 'escolher-passagem',
    params: {
      origem: query.origem,
      destino: query.destino,
      type: query.type,
      dataIda: query.dataIda,
      dataVolta: query.dataVolta || undefined
    }
  });
}


const handleOptionsUpdate = (newOptions) => {
  filterOptions.value = newOptions;
};
</script>

<template>
  <div class="not-found-page">
    <div class="maxWidth tw-flex tw-flex-col  ">
      <!-- Mensagem de erro -->
      <div class="error-message tw-h-[25em] tw-flex tw-flex-col tw-justify-center tw-items-center">
        <div class="tw-mb-6">
          <Icon icon="mdi:map-marker-question" class="tw-text-6xl tw-text-primary tw-mb-4" />
        </div>
        <h1>Ops! Página não encontrada</h1>
        <p class="tw-text-center tw-max-w-md tw-mb-6">
          Parece que você se perdeu no caminho. Mas não se preocupe! 
          Que tal aproveitar e descobrir nossas incríveis viagens em destaque?
        </p>
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-items-center">
          <router-link to="/" class="primary-btn">
            <Icon icon="mdi:home" class="tw-mr-2" />
            Voltar ao início
          </router-link>
        
        </div>
      </div>
           <!-- Filtros de busca -->
    <div class="filter-section tw-px-4 lg:tw-px-8">
      <CardFilter 
        v-model="filterData"
        :options="filterOptions"
        :is-loading="isLoading"
        @update:modelValue="goToSalePage"
        @update:options="handleOptionsUpdate"
      />
    </div>

      <!-- Viagens em destaque -->
      <div class="featured-section tw-px-4 lg:tw-px-8">
        <FeaturedTrip :empresa="false" />
      </div>
    </div>
   
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
}

.error-message {
  text-align: center;
  margin-top: 50px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  margin: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  color: #ff5252;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.primary-btn, .secondary-btn {
  text-decoration: none;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.primary-btn {
  background-color: #42b983;
  color: white;
  border: 2px solid #42b983;
}

.primary-btn:hover {
  background-color: #3aa876;
  border-color: #3aa876;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.secondary-btn {
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
}

.secondary-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin: 2rem 0;
}

.featured-section {
  margin: 2rem 0 4rem 0;
}
</style>
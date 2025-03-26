<script setup>
import {Icon} from "@iconify/vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {computed, onMounted, ref} from "vue";
import {converterData} from "../../Helper/Ultis.js";
import {routes} from "../../services/fetch.js";


const props = defineProps({
  modelValue: Object,
  options:Object,
})


const filterOptions = ref([])
const emit = defineEmits(['update:modelValue'])
const form = ref(null);
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);


function removeAcentos(str) {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function customFilter(item, queryText) {
  if (!queryText) return true;
  const textoNormalizado = removeAcentos(item).toLowerCase();
  const queryNormalizada = removeAcentos(queryText).toLowerCase();
  return textoNormalizado.includes(queryNormalizada);
}

async function updateFilters(){
  const {valid}  = await form.value.validate()
  if(valid){
    emit('update:modelValue',props.modelValue);
  }
}

const validarDataIda = computed(() => {
  if (!props.modelValue.dataIda) return "Esse campo é obrigatório";
  const dataIda = new Date(props.modelValue.dataIda);
  if (dataIda < hoje) return "A data de ida não pode ser menor que hoje";
  if(props.modelValue.dataVolta){
    const dataVolta = new Date(props.modelValue.dataVolta);
    if (dataVolta < dataIda) return "A data de ida não pode ser maior que a volta";
  }
  return true;
});

function permitirDatasIda(data) {
  const dataSelecionada = new Date(data);
  if (props.modelValue.type === 'ida-e-volta' && props.modelValue.dataVolta) {
    return dataSelecionada >= hoje && dataSelecionada <= props.modelValue.dataVolta;
  }
  return dataSelecionada >= hoje;
}

function permitirDatasVolta(data) {
  const dataSelecionada = new Date(data);
  dataSelecionada.setHours(0, 0, 0, 0);
  if (props.modelValue.dataIda) {
    return dataSelecionada >= props.modelValue.dataIda.setHours(0, 0, 0, 0);
  }
  return dataSelecionada >= hoje;
}

const validarDataVolta = computed(() => {
  if (props.modelValue.type !== "ida-e-volta") return true;
  if (!props.modelValue.dataVolta) return "Esse campo é obrigatório";

  const dataIda = new Date(props.modelValue.dataIda);
  const dataVolta = new Date(props.modelValue.dataVolta);

  if (dataVolta < dataIda) return "A data de volta não pode ser menor que a ida";
  return true;
});

function getFilterItems(){

  const params = {
    origem: props.modelValue.origem || '',
    subdomain:  window.subdomain || ''
  }
  routes["filtros"](params).then(response => {
    if(!response.data.data.success){
      filterOptions.value = response.data.data;
      if(filterOptions.value.municipiosDestino.findIndex(it=>it.slug == props.modelValue.destino) < 0){
        props.modelValue.destino = null
      }
    }
  })
}
function invertFilter(){
  const temp = props.modelValue.origem;
  props.modelValue.origem = props.modelValue.destino;
  props.modelValue.destino = temp;
  updateFilters()
}

function changeTypeTravel(){
  props.modelValue.dataVolta = null
  // updateFilters()
}

onMounted(getFilterItems)

</script>

<template>
  <v-card elevation="0" class="my-5 !tw-rounded-xl !tw-bg-transparent">
    <v-btn-toggle v-model="modelValue.type" @update:modelValue="changeTypeTravel" dense rounded="xl" color="secondary" class="mb-1 mx-auto tw-w-full"  >
      <v-btn value="somente-ida" class="!tw-font-bold" >
        Somente ida
      </v-btn>
      <v-btn value="ida-e-volta" class="!tw-font-bold" >
        Ida e volta
      </v-btn>
    </v-btn-toggle>

    <v-card class=" !tw-rounded-xl" elevation="0">
      <v-form ref="form" class="tw-grid tw-grid-cols-2  " :class="modelValue.type == 'ida-e-volta' ? 'lg:tw-grid-cols-5' : 'lg:tw-grid-cols-4'">
        <div class="tw-flex tw-flex-col tw-px-5 tw-py-3 tw-border-r tw-border-b lg:tw-border-b-0 lg:!tw-ml-5">
          <div class="tw-text-p tw-font-extrabold tw-text-[20px]">Saindo de</div>
          <div class="tw-flex tw-items-center tw-text-p tw-text-[14px]">

            <v-autocomplete
                flat
                menu-icon=""
                hide-details="auto"
                item-value="slug"
                item-title="nome"
                variant="solo"
                :rules="[v => !!v || 'Esse campo é obrigatório']"
                placeholder="Origem"
                class="my-select mt-1"
                v-model="modelValue.origem"
                :items="filterOptions.municipiosOrigem"
                @update:modelValue="getFilterItems"
                :custom-filter="customFilter"
            >
              <template v-slot:selection="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :title="item.raw.nome+'/'+item.raw.uf"
                ></v-list-item>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :title="item.raw.nome+'/'+item.raw.uf"
                ></v-list-item>
              </template>
              <template #prepend-inner>
                <Icon icon="solar:map-arrow-up-bold" class="mr-2"/>
              </template>
            </v-autocomplete>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-px-5 tw-py-3  tw-border-b lg:tw-border-b-0 !tw-ml-5">
          <div class="tw-text-p tw-font-extrabold tw-text-[20px]">Indo para</div>
          <div class="tw-flex tw-items-center tw-text-p tw-text-[14px]">
            <v-autocomplete
                flat
                menu-icon=""
                item-value="slug"
                item-title="nome"
                v-model="modelValue.destino"
                :rules="[v => !!v || 'Esse campo é obrigatório']"
                hide-details="auto"
                variant="solo"
                placeholder="Destino"
                class="my-select mt-1 !tw-z-[1]"
                :items="filterOptions.municipiosDestino"
                :custom-filter="customFilter"
            >
              <template v-slot:selection="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :title="item.raw.nome+'/'+item.raw.uf"
                ></v-list-item>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :title="item.raw.nome+'/'+item.raw.uf"
                ></v-list-item>
              </template>
              <template #prepend-inner>
                <Icon icon="solar:map-arrow-up-bold" class="mr-2"/>
              </template>
            </v-autocomplete>
          </div>
        </div>

        <div
            class="tw-absolute tw-w-[50px] tw-h-[50px] tw-flex tw-justify-center lg:tw-justify-start lg:tw-top-[50%] tw-left-[43%] tw-top-[37%] -tw-translate-y-1/2 !tw-z-[0]"
            :class="modelValue.type == 'ida-e-volta' ? ' lg:tw-left-[18%]' : ' lg:tw-left-[23%]'"
        >
          <v-btn @click="invertFilter" variant="flat" color="secondary" icon>
            <Icon icon="flowbite:arrows-repeat-outline" class="tw-text-[30px]" />
          </v-btn>
        </div>

        <div class="tw-flex tw-flex-col tw-px-5 tw-py-3 tw-border-r lg:tw-border-x">
          <div class="tw-text-p tw-font-extrabold tw-text-[20px]">Ida</div>
          <div class="tw-flex tw-items-center tw-text-p tw-text-[14px]">
            <v-date-input
                flat
                hide-details="auto"
                prepend-icon=""
                v-model="modelValue.dataIda"
                :allowed-dates="permitirDatasIda"
                :rules="[validarDataIda]"
                variant="solo"
                v-mask="'##/##/####'"
                @change="(e)=>{ props.modelValue.dataIda = new Date(converterData(e.target._value) + 'T00:00:00')}"
                class="my-select"
                hide-actions
                placeholder="dd/mm/aaaa">
              <template #default>
                <Icon icon="uis:calendar" class="mr-2"/>
              </template>
            </v-date-input>
          </div>
        </div>
        <div v-if="modelValue.type == 'ida-e-volta'" class="tw-flex tw-flex-col tw-px-5 tw-py-3  !tw-ml-5">
          <div class="tw-text-p "><span class="tw-font-extrabold tw-text-[20px] ">Volta</span> </div>
          <div class="tw-flex tw-items-center tw-text-p tw-text-[14px]">
            <v-date-input
                flat
                hide-details="auto"
                prepend-icon=""
                locale="pt"
                hide-actions
                :allowed-dates="permitirDatasVolta"
                variant="solo"
                v-mask="'##/##/####'"
                @change="(e)=>{ props.modelValue.dataVolta = new Date(converterData(e.target._value) + 'T00:00:00')}"
                v-model="modelValue.dataVolta"
                :rules="[validarDataVolta]"
                class="my-select"
                placeholder="dd/mm/aaaa">
              <template #default>
                <Icon icon="uis:calendar" class="mr-2"/>
              </template>
            </v-date-input>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-col-span-2 lg:tw-col-span-1 tw-w-full tw-h-full ">
          <v-btn @click="updateFilters" class="tw-w-full !tw-h-full " variant="flat" color="secondary" rounded="0">
            <div  class="tw-text-[20px] tw-flex tw-items-center tw-text-white tw-font-[900] tw-my-3 tw-normal-case">
              <Icon icon="majesticons:search-line" class="tw-text-[30px] tw-text-white tw-mr-1 " />Buscar
            </div>
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-card>
</template>

<style scoped>
.v-btn--active {
  color: #ffffff !important;
}

.my-select::v-deep(.v-field__input) {
  min-height: 42px !important;
  padding-top: 0!important;
  padding-bottom: 0!important;
  padding-inline: 0!important;
}

.my-select::v-deep(.v-field--appended){
  padding-inline-end: 0 !important;
}

.my-select::v-deep( .v-field--prepended) {
  padding-inline-start: 0 !important;
}
</style>
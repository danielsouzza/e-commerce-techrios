<script setup>
import {Icon} from "@iconify/vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {ref} from "vue";


const props = defineProps({
  modelValue: Object,
  options:Object,
})

const emit = defineEmits(['update:modelValue'])
const form = ref(null);


async function updateFilters(){
  const {valid}  = await form.value.validate()
  if(valid){
    emit('update:modelValue',props.modelValue);
  }
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

</script>

<template>
  <v-card elevation="0" class="my-5 !tw-rounded-xl !tw-bg-transparent">
    <v-btn-toggle v-model="modelValue.type" @update:modelValue="changeTypeTravel" dense rounded="xl" color="secondary" class="mb-1 "  >
      <v-btn value="ida-e-volta" class="!tw-font-bold" >
        Ida e volta
      </v-btn>
      <v-btn value="somente-ida" class="!tw-font-bold" >
        Somente ida
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
                item-value="codigo"
                item-title="nome"
                variant="solo"
                :rules="[v => !!v || 'Esse campo é obrigatório']"
                placeholder="Origem"
                class="my-select mt-1"
                v-model="modelValue.origem"
                :items="options.municipiosOrigem">
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
                item-value="codigo"
                item-title="nome"
                v-model="modelValue.destino"
                :rules="[v => !!v || 'Esse campo é obrigatório']"
                hide-details="auto"
                variant="solo"
                placeholder="Destino"
                class="my-select mt-1 !tw-z-[1]"
                :items="options.municipiosDestino">
              <template #prepend-inner>
                <Icon icon="flowbite:map-pin-alt-solid" class="mr-2"/>
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
                :rules="[v => !!v || 'Esse campo é obrigatório']"
                variant="solo"
                class="my-select"
                placeholder="dd/mm/aaaa">
              <template #default>
                <Icon icon="uis:calendar" class="mr-2"/>
              </template>
            </v-date-input>
          </div>
        </div>
        <div v-if="modelValue.type == 'ida-e-volta'" class="tw-flex tw-flex-col tw-px-5 tw-py-3  !tw-ml-5">
          <div class="tw-text-p "><span class="tw-font-extrabold tw-text-[20px] ">Volta</span> <span class=" tw-text-[14px]">(opcional)</span></div>
          <div class="tw-flex tw-items-center tw-text-p tw-text-[14px]">
            <v-date-input
                flat
                hide-details="auto"
                prepend-icon=""
                variant="solo"
                v-model="modelValue.dataVolta"
                :rules="[v =>  modelValue.type == 'ida-e-volta' ? !!v  ||  'Esse campo é obrigatório' : true]"
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
              <Icon icon="majesticons:search-line" class="tw-text-[30px] tw-text-black tw-mr-1 " />Buscar
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
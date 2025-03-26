<script setup>
import {Icon} from "@iconify/vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {converterData, isValidDate, permitirDatasNascimento} from "../../Helper/Ultis.js";

const props = defineProps({
  form:Object,
  index:Number,
})

const emits = defineEmits(['addToContact','removeToContact'])

const tiposDoc = [
  { id:1, nome: 'RG', tamanho: 15, mask: '###############' },
  { id:2,nome: 'Titulo de Eleitor', tamanho: 12, mask: '#### #### ####' },
  { id:3,nome: 'Passaporte', tamanho: 20, mask: '#################' },
  { id:4,nome: 'CNH', tamanho: 11, mask: '###########' },
  { id:5,nome: 'CPF', tamanho: 0, mask: '###.###.###-##' }
];
</script>

<template>
  <div class=" tw-font-bold tw-px-2 tw-text-gray-800 ">Passageiro {{index + 1}}</div>

  <v-row class="tw-px-2 mt-2">
    <v-col cols="6">
      <v-text-field
          v-model="form.nome"
          :error-messages="form.errors.nome"
         variant="outlined"
          label="Nome completo"
          hide-details="auto"
      >
        <template v-slot:prepend-inner>
          <Icon icon="stash:person-light" width="26"/>
        </template>
      </v-text-field>
    </v-col>
    <v-col  cols="6">
      <v-text-field
          v-model="form.telefone"
          :error-messages="form.errors.telefone"
          v-mask="'(##) #####-####'"
         variant="outlined"
          label="Telefone"
          hide-details="auto"
      >
        <template v-slot:prepend-inner>
          <Icon icon="mdi-light:phone" width="26"/>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="6" >
      <v-select
          v-model="form.tipo_doc"
          :error-messages="form.errors.tipo_doc"
          variant="outlined"
          label="Documento"
          item-title="nome"
          item-value="id"
          hide-details="auto"
          :items="tiposDoc"
      >
      </v-select>
    </v-col>
    <v-col cols="6"  v-if="form.tipo_doc">
      <v-text-field
          v-model="form.document"
          :error-messages="form.errors.document"
         variant="outlined"
          label="Nº do documento"
          hide-details="auto"
          v-mask="form.tipo_doc ? tiposDoc[form.tipo_doc-1]?.mask : '###########' "
      >
        <template v-slot:prepend-inner>
          <Icon icon="material-symbols-light:id-card-outline" width="26"/>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="6">
      <v-date-input
          flat
          hide-details="auto"
          prepend-icon=""
          hide-actions
          :allowed-dates="permitirDatasNascimento"
          v-mask="'##/##/####'"
          @change="(e)=>{form.nascimento =  isValidDate(e.target._value)? new Date(converterData(e.target._value) + 'T00:00:00') : null}"
          v-model="form.nascimento"
          :error-messages="form.errors.nascimento"
          variant="outlined"

          placeholder="Data de Nascimento">
        <template #default>
          <Icon icon="uis:calendar" class="mr-2"/>
        </template>
      </v-date-input>
    </v-col>
  </v-row>
  <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
  <v-checkbox
      v-model="form.isContact"
      @update:modelValue="(arg)=>{if(arg) emits('addToContact',index); else emits('removeToContact',index)}"
      hide-details="auto"
      class="!tw-text-p tw-mt-3 !tw-text-sx"
      label="Adicionar como contato"
  >
  </v-checkbox>
</template>

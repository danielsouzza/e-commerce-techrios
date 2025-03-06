<script setup>

import {onMounted, reactive, ref} from "vue";
import {Icon} from "@iconify/vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import axios from "axios";
import {routes} from "../services/fetch.js";
import router from "../routes/index.js";
import {useToast} from "vue-toastification";


const toast = useToast();
const visible1 = ref(false);
const visible2 = ref(false);
const municipios = ref([]);
const form = reactive({

  name:"",
  email: "",
  email_confirmation: "",
  password: "",
  password_confirmation: "",
  telefone:"",
  comprador:{
  nascimento:null,
    cpf_cnpj:"",
    xnome:"",
    estrangeiro:false,
    xlgr:"",
    nro:"",
    bairro:"",
    cmun:null,
    cep:"",
    telefone:"",
  },
  errors:{}
})

function getMunicipios(){
  axios.get("https://yjaraviagens.com/municipios/PA").then((response) => {
    municipios.value = response.data
  })
}

function goToLoginPage(){
  router.push({name: "login"})
}

function handleSubmit() {
  form.comprador.xnome = form.name
  form.comprador.telefone = form.telefone
  routes['user.register'](form).then((response) => {
    goToLoginPage()
  }).catch((error) => {
    form.errors = error.response.data.errors
    console.log(error)
    toast.error('Preencha todos os dados');
  })
}

onMounted(()=>{
  getMunicipios();
})

</script>

<template>
  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Faça seu cadastro</strong> </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <v-card
        class="mx-auto pa-8 pb-8 my-4"
        elevation="8"
        rounded="lg"
    >
      <div class="tw-flex tw-items-center  my-5">
        <v-btn variant="outlined" color="secondary" rounded >
          <span class="tw-text-xs"> Dados pessoais</span>
        </v-btn>
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
      </div>

      <v-row class="my-5">
        <v-col cols="12" >
          <div class="tw-flex tw-items-center  tw-gap-2">
            <v-btn variant="outlined"  :active="!form.comprador.estrangeiro" color="primary" @click="form.comprador.estrangeiro = false">
              <span class="tw-text-xs"> Brasileiro</span>
            </v-btn>
            <v-btn variant="outlined" :active="form.comprador.estrangeiro" color="primary" @click="form.comprador.estrangeiro = true">
              <span class="tw-text-xs">Estrangeiro</span>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Seu nome</div>
          <v-text-field
              density="compact"
              color="secondary"
              hide-details="auto"
              v-model="form.name"
              :error-messages="form.errors.name"
              placeholder="Digite o seu nome completo "
              prepend-inner-icon="mdi-account"
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">{{!form.comprador.estrangeiro ? 'CPF' : 'Passaporte'}}</div>

          <v-text-field
              density="compact"
              color="secondary"
              hide-details="auto"
              :error-messages="form.errors['comprador.cpf_cnpj']"
              v-model="form.comprador.cpf_cnpj"
              v-mask="!form.comprador.estrangeiro ? '###.###.###-##' : '#################'"
              :placeholder="!form.comprador.estrangeiro ? 'Digite o seu cpf' : 'Digite seu passaporte' "
              prepend-inner-icon="mdi-account"
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Data de nascimento</div>
          <v-date-input
              density="compact"
              color="secondary"
              hide-details="auto"
              prepend-icon=""
              :error-messages="form.errors['comprador.nascimento']"
              v-model="form.comprador.nascimento"
              variant="outlined"
              placeholder="Data de Nascimento">
            <template #default>
              <Icon icon="uis:calendar" class="mr-2 tw-text-p"/>
            </template>
          </v-date-input>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Seu telefone</div>

          <v-text-field
              density="compact"
              color="secondary"
              hide-details="auto"
              v-mask="'(##) #####-####'"
              :error-messages="form.errors.telefone"
              v-model="form.telefone"
              placeholder="Digite o seu numero de telefone "
              prepend-inner-icon="mdi-phone"
              variant="outlined"
          ></v-text-field>
        </v-col>
      </v-row>

      <div class="tw-flex tw-items-center mt-5 ">
        <v-btn variant="outlined" color="secondary" rounded >
          <span class="tw-text-xs">Endereço</span>
        </v-btn>
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
      </div>

      <v-row class="my-5">
        <v-col cols="12" lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">CEP</div>

          <v-text-field
              density="compact"
              color="secondary"
              v-mask="'#####-###'"
              v-model="form.comprador.cep"
              :error-messages="form.errors['comprador.cep']"
              hide-details="auto"
              placeholder="Digite o seu cep "
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Bairro</div>

          <v-text-field
              density="compact"
              color="secondary"
              v-model="form.comprador.bairro"
              :error-messages="form.errors['comprador.bairro']"
              hide-details="auto"
              placeholder="Digite o seu bairro "
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Município</div>

          <v-autocomplete
              density="compact"
              color="secondary"
              item-value="codigo"
              item-title="nome"
              v-model="form.comprador.cmun"
              :error-messages="form.errors['comprador.cmun']"
              hide-details="auto"
              :items="municipios"
              placeholder="Selecione seu município "
              variant="outlined"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Logradouro</div>

          <v-text-field
              density="compact"
              color="secondary"
              :error-messages="form.errors['comprador.xlgr']"
              v-model="form.comprador.xlgr"
              hide-details="auto"
              placeholder="Digite o seu logradouro "
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Número</div>

          <v-text-field
              density="compact"
              color="secondary"
              :error-messages="form.errors['comprador.nro']"
              v-model="form.comprador.nro"
              hide-details="auto"
              placeholder="Digite o seu número "
              variant="outlined"
          ></v-text-field>
        </v-col>
      </v-row>


      <div class="tw-flex tw-items-center mt-5">
        <v-btn variant="outlined" color="secondary" rounded >
          <span class="tw-text-xs"> Dados de acesso</span>
        </v-btn>
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
      </div>

      <v-row class="my-5">
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Seu email</div>

          <v-text-field
              density="compact"
              color="secondary"
              v-model="form.email"
              :error-messages="form.errors.email"
              hide-details="auto"
              placeholder="Digite o seu email "
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Confirme seu email</div>

          <v-text-field
              density="compact"
              color="secondary"
              v-model="form.email_confirmation"
              hide-details="auto"
              placeholder="Digite o seu email novamente "
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Sua senha</div>

          <v-text-field
              :append-inner-icon="visible1 ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible1 ? 'text' : 'password'"
              density="compact"
              color="secondary"
              hide-details="auto"
              :error-messages="form.errors.password"
              v-model="form.password"
              placeholder="Digite sua senha"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              @click:append-inner="visible1 = !visible1"
          ></v-text-field>
        </v-col>
        <v-col cols="12"  lg="6">
          <div class="text-subtitle-1 text-medium-emphasis">Confirme sua senha</div>

          <v-text-field
              :append-inner-icon="visible2 ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible2 ? 'text' : 'password'"
              density="compact"
              color="secondary"
              hide-details="auto"
              v-model="form.password_confirmation"
              placeholder="Digite novamente sua senha"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              @click:append-inner="visible2 = !visible2"
          ></v-text-field>
        </v-col>
      </v-row>


      <v-btn
          @click="handleSubmit"
          class="my-8"
          color="secondary"
          size="large"
          rounded
          variant="outlined"
          block
      >
        Registrar
      </v-btn>

      <v-card-text class="text-center">
        <RouterLink  :to="{name: 'login'}">
          <div class="text-blue text-decoration-none">
           já tenho conta<v-icon icon="mdi-chevron-right"></v-icon>
          </div>
        </RouterLink>

      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>

</style>
<script setup>

import {computed, nextTick, onMounted, reactive, ref} from "vue";
import {Icon} from "@iconify/vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import axios from "axios";
import {routes} from "../services/fetch.js";
import router from "../routes/index.js";
import {useToast} from "vue-toastification";
import {
  converterData,
  formatDateToServe,
  isValidDate,
  permitirDatasNascimento,
  validarCPF,
  validarEmail
} from "../Helper/Ultis.js";
import {showErrorNotification, showSuccessNotification} from "../event-bus.js";
import {VIcon} from "vuetify/components";


const toast = useToast();
const visible1 = ref(false);
const visible2 = ref(false);
const loadCep = ref(false)
const openDialogSuccess = ref(false)
const formRef = ref()
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
  errors:{},
  processing:false
})

function getMunicipios(search='', after=()=>{}){
  routes['municipios']({search:search}).then((response) => {
    municipios.value = response.data.data
    after()
  })
}

function resetAddress(){
  form.comprador.bairro = ''
  form.comprador.xlgr = ''
  form.comprador.cmun = null
}
function getCep(){
  if(form.comprador.cep.length > 8){
    loadCep.value = true
    axios.get(`https://viacep.com.br/ws/${form.comprador.cep}/json/`).then((response) => {
      if(!response.data.erro){
        form.comprador.bairro = response.data.bairro
        form.comprador.xlgr = response.data.logradouro
        getMunicipios(response.data.localidade,()=>{
          form.comprador.cmun = parseInt(municipios.value.find(it=>it.codigo == response.data.ibge)?.codigo)
        })
      }else{
        toast.error('Cep não encontrado');
        resetAddress()
      }
      loadCep.value = false
    }).catch(error=>{
      resetAddress()
      loadCep.value = false
    })
  }else {
    resetAddress()
  }
}


function validationEmail(email){
  return validarEmail(email) ? true :  'Email invalido'

}

const validatePassword = () => {
  if (!form.password || !form.password_confirmation) {
    return false;
  }
  const isValid = passwordRules.value.every(rule => rule.rule);
  return isValid && form.password === form.password_confirmation;
};

const passwordRules = computed(() => {
  return [
    { rule: form.password?.length >= 8, message: 'A senha deve ter pelo menos 8 caracteres' },
    { rule: /[A-Z]/.test(form.password), message: 'A senha deve ter pelo menos uma letra maiúscula' },
    { rule: /[a-z]/.test(form.password), message: 'A senha deve ter pelo menos uma letra minúscula' },
    { rule: /[0-9]/.test(form.password), message: 'A senha deve ter pelo menos um número' },
  ];
});

function goToLoginPage(){
  router.push({name: "login"})
}

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


const validateForm = () => {
  form.errors = {};
  const validateField = (field, value, errorMessage) => {
    if (value === null || value === undefined || value === '') {
      form.errors[field] = errorMessage;
    } else {
      delete form.errors[field];
    }
  };


  const validarNomeSobrenome = (nome) => {
    return nome.split(" ").length > 1 || "Digite nome e sobrenome";
  };
  const validatePhone = (field, value) => {
    const phone =  value.replace(/\D/g, '');
    const phoneRegex = /^[0-9]{10,11}$/; // Aceita 10 ou 11 dígitos numéricos

    if (!phone) {
      form.errors[field] = 'Por favor, insira um número de telefone.';
    } else if (!phoneRegex.test(phone)) {
      form.errors[field] = 'O telefone deve conter apenas números e ter 10 ou 11 dígitos.';
    } else {
      delete form.errors[field];
    }
  };


  validateField('name', form.name, 'Por favor, insira seu nome e sobrenome.');
  validateField('email', form.email, 'Por favor, insira seu email.');
  validateField('email_confirmation', form.email_confirmation, 'Por favor, confirme seu email.');
  validateField('password', form.password, 'Por favor, insira sua senha.');
  validateField('comprador.nascimento', form.nascimento, 'Por favor, insira sua data de nascimento.');
  validateField('password_confirmation', form.password_confirmation, 'Por favor, confirme sua senha.');
  validatePhone('telefone', form.telefone, 'Por favor, insira seu telefone.')
  validateField(`comprador.cpf_cnpj`, form.comprador.cpf_cnpj, form.comprador.estrangeiro ? `Por favor, insira seu passaporte.` :`Por favor, insira seu cpf.`);
  validateField(`comprador.xlgr`, form.comprador.xlgr, `Por favor, insira o logradouro.`);
  validateField(`comprador.bairro`, form.comprador.bairro, `Por favor, insira o bairro.`);
  validateField(`comprador.cmun`, form.comprador.cmun, `Por favor, escolha um municipío.`);
  validateField(`comprador.cep`, form.comprador.cmun, `Por favor, escolha um cep.`);
  validateField(`comprador.nro`, form.comprador.nro, `Por favor, insira o número.`);

  if(form.name && !validarNomeSobrenome(form.name)){
    form.errors.name = 'Digite nome e sobrenome'
  }

  if(form.email && !validarEmail(form.email)){
    form.errors.email = 'Email invalido!'
  }

  if(form.email != form.email_confirmation){
    form.errors.email_confirmation = 'O email não confere'
  }

  if(form.password_confirmation && !validatePassword()){
    form.errors.password_confirmation = 'A senha não confere'
  }

  if(!form.comprador.estrangeiro && !validarCPF(form.comprador.cpf_cnpj)){
    form.errors['comprador.cpf_cnpj'] = 'Número de CPF inválido'
  }

  return Object.keys(form.errors).length === 0;
};

async function focusErro() {
  nextTick(async () => {
    const errors = await formRef.value.validate()
    const erroredField = formRef.value?.$el.querySelector(".v-input.v-input--error input");
    if (erroredField) {
      erroredField.focus();
    }
  });
}


function handleSubmit() {
  focusErro()
  const data = {
    ...form,
  }
  data.comprador.xnome = form.name
  data.comprador.telefone = form.telefone
  data.comprador.nascimento = formatDateToServe(data.nascimento)
  if(validateForm()){
    form.processing= true
    routes['user.register'](data).then((response) => {
      form.processing= false
      openDialogSuccess.value = true
    }).catch((error) => {
      if(error.response.data.errors){
        form.errors = error.response.data.errors
      }
      form.processing= false
      showErrorNotification(error.response.data.data?.error ?? 'Ops, algor de errado aconteceu, verifique as informações');
    })
  }

}

onMounted(()=>{
  getMunicipios();
})

</script>

<template>

  <v-dialog max-width="500" v-model="openDialogSuccess" @afterLeave="goToLoginPage()">

    <template v-slot:default="{ isActive }">
      <v-card color="success" >
        <v-card-text >
          <div class="tw-w-full tw-flex tw-flex-col tw-items-center tw-pb-3 tw-text-center tw-text-white">
            <v-icon class="icon tw-my-8" icon="mdi-check-circle" size="70"></v-icon>
            <span class="tw-text-2xl">Conta criada com sucesso!</span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn
              class="!tw-text-white"
              text="Ir para o login"
              @click="goToLoginPage();"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

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

      <v-form ref="formRef">
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
                :focused="!!form.errors.name"
                color="secondary"
                hide-details="auto"
                v-model="form.name"
                :error-messages="form.errors.name"
                :rules="[(nome)=>nome.split(' ').length > 1 || 'Digite nome e sobrenome']"
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
                v-mask="'##/##/####'"
                hide-actions
                :allowed-dates="permitirDatasNascimento"
                v-model="form.nascimento"
                @change="(e)=>{form.nascimento =  isValidDate(e.target._value)? new Date(converterData(e.target._value) + 'T00:00:00') : null}"
                :error-messages="form.errors['comprador.nascimento']"
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
                :loading="loadCep"
                @update:modelValue="getCep"
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
                :disabled="loadCep"
                :loading="loadCep"
                v-model="form.comprador.bairro"
                :error-messages="form.errors['comprador.bairro']"
                hide-details="auto"
                placeholder="Digite o seu bairro "
                variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12"  lg="6">
            <div class="text-subtitle-1 text-medium-emphasis">Município </div>

            <v-autocomplete
                density="compact"
                color="secondary"
                item-value="codigo"
                item-title="nome"
                :disabled="loadCep"
                :loading="loadCep"
                v-model="form.comprador.cmun"
                :error-messages="form.errors['comprador.cmun']"

                hide-details="auto"
                :items="municipios"
                placeholder="Selecione seu município "
                variant="outlined"
                :custom-filter="customFilter"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12"  lg="6">
            <div class="text-subtitle-1 text-medium-emphasis">Logradouro</div>

            <v-text-field
                density="compact"
                color="secondary"
                :disabled="loadCep"
                :loading="loadCep"
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
                :rules="[validationEmail]"
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
                :error-messages="form.errors.email_confirmation"
                hide-details="auto"
                :rules="[(v)=> v == form.email || 'Email não confere']"
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
            <v-list dense>
              <v-list-item v-for="(rule, index) in passwordRules" :key="index">
                <div class="tw-flex tw-gap-2 tw-items-center">
                  <v-icon v-if="rule.rule" color="green">mdi-check-circle</v-icon>
                  <v-icon v-else color="red">mdi-close-circle</v-icon>
                  <v-list-item-title>{{ rule.message }}</v-list-item-title>
                </div>
              </v-list-item>
            </v-list>
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
                :error-messages="form.errors.password_confirmation"
                :rules="[(v)=> v == form.password || 'Senha não confere']"
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
            :loading="form.processing"
            :disabled="form.processing"
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
      </v-form>

    </v-card>
  </div>

</template>

<style scoped>

</style>
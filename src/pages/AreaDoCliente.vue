<script setup>

import {computed, onMounted, reactive, ref} from "vue";
import {Icon} from "@iconify/vue";
import TableOrders from "../components/shared/TableOrders.vue";
import {routes} from "../services/fetch.js";
import {VDateInput} from 'vuetify/labs/VDateInput'
import axios from "axios";
import {showErrorNotification, showSuccessNotification} from "../event-bus.js";
import {converterData, formatDateToServe} from "../Helper/Ultis.js";
import router from "../routes/index.js";
import {useToast} from "vue-toastification";

const props = defineProps({
  tab:String,
})

const toast = useToast();
const auth = ref(null)
const municipios = ref([]);
const tab = ref(props.tab)
const visible1 = ref(false);
const visible3 = ref(false);
const tabs = [
  {
    title:'Meu perfil',
    link:{name:'pedidos'},
    icon:'iconamoon:profile-light',
    value:'perfil'
  },
  {
    title:'Meus Pedidos',
    link:{name:'pedidos'},
    icon:'material-symbols-light:order-approve-outline',
    value:'pedidos'
  },
  {
    title:'Alterar senha',
    link:{name:'pedidos'},
    icon:'fluent:password-20-regular',
    value:'alterar-senha'
  },
  {
    title:'Excluir conta',
    link:{name:'pedidos'},
    icon:'fluent:delete-20-regular',
    value:'excluir-conta'
  }
]



const formPassword = reactive({
  current_password:null,
  new_password:'',
  password_confirmation:null,
  errors:{}

})

const form = reactive({
  id:null,
  name:"",
  email: "",
  telefone:"",
  nascimento:null,
  password:null,
  comprador:{
    nascimento:null,
    cpf_cnpj:"",
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

function fillFormDataUser(){
  form.id = auth.value.id
  form.name = auth.value.name;
  form.email = auth.value.email
  form.telefone = auth.value.comprador.telefone
  form.comprador.telefone = auth.value.comprador.telefone
  form.nascimento = auth.value.comprador.nascimento ? new Date(auth.value.comprador.nascimento+'T00:00:00') : null
  form.comprador.telefone = auth.value.comprador.telefone
  form.comprador.estrangeiro = auth.value.comprador.estrangeiro
  form.comprador.bairro = auth.value.comprador.bairro
  form.comprador.nro = auth.value.comprador.nro
  form.comprador.xlgr = auth.value.comprador.xlgr
  form.comprador.cmun = auth.value.comprador.cmun
  form.comprador.cep = auth.value.comprador.cep
  form.comprador.cpf_cnpj = auth.value.comprador.cpf_cnpj
}

const windowWidth = ref(window.innerWidth);
const titlePage = computed(()=>{
  return tabs.find(item=>item.value===tab.value).title;
})

function handleSubmit() {
  const data = {
    ...form,
  }
  data.comprador.xnome = form.name
  data.comprador.telefone = form.telefone
  data.comprador.nascimento = formatDateToServe(data.nascimento)
  console.log(data)

  routes['user.register'](data).then((response) => {
    showSuccessNotification(response.data.message)

  }).catch((error) => {
    showErrorNotification(error.response.data.data.error)
  })
}

function deleteAccount() {
  routes['user.delete'](form).then((response) => {
    showSuccessNotification(response.data.message)
    router.push({name: "login"})
  }).catch((error) => {
    console.log(error)
    showErrorNotification(error.response.data.data.error)
  })
}

function getUser() {
  routes['user.me']().then((res) => {
    auth.value = res.data.data;
    fillFormDataUser()
  })
}
const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

function getMunicipios(){
  axios.get("https://yjaraviagens.com/municipios/PA").then((response) => {
    console.log(response)
    municipios.value = response.data
  })
}

const validatePassword = () => {
  if (!formPassword.new_password || !formPassword.password_confirmation) {
    return false;
  }
  const isValid = passwordRules.value.every(rule => rule.rule);
  return isValid && formPassword.new_password === formPassword.password_confirmation;
};

const passwordRules = computed(() => {
  return [
    { rule: formPassword.new_password?.length >= 8, message: 'Pelo menos 8 caracteres' },
    { rule: /[A-Z]/.test(formPassword.new_password), message: 'Pelo menos uma letra maiúscula' },
    { rule: /[a-z]/.test(formPassword.new_password), message: 'Pelo menos uma letra minúscula' },
    { rule: /[0-9]/.test(formPassword.new_password), message: 'Pelo menos um número' },
  ];
});

function submitFormPassword(){
  if(validatePassword()){
    handleSubmit()
  }
}
function permitirDatas(data) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataSelecionada = new Date(data);
  dataSelecionada.setHours(0, 0, 0, 0);

  return dataSelecionada < hoje;
}


onMounted(()=>{
  getMunicipios();
})

onMounted(()=>{
  getUser();
  window.addEventListener('resize', updateWidth);
})

</script>

<template>

  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold"> {{titlePage}}</strong> </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <v-row  class="my-3">
      <v-col cols="12" lg="3" md="4">
        <v-sheet  elevation="0"  rounded="lg">
          <v-tabs
              v-model="tab"
              :items="tabs"
              @update:modelValue="(args)=>router.push({name:'area-do-cliente',params:{tab:args}})"
              height="60"
              :direction="windowWidth >= 960 ? 'vertical' : 'horizontal'"
              slider-color="secondary"
          >
            <template v-slot:tab="{ item }">
              <v-tab :value="item.value"> <Icon :icon="item.icon" class="mr-2" width="30"/> {{item.title}}</v-tab>
            </template>
          </v-tabs>
        </v-sheet>
      </v-col>
      <v-col cols="12" lg="9" md="8">
        <v-tabs-window v-model="tab" class="mb-3">
          <v-tabs-window-item value="perfil">
            <v-card
                class="mx-auto pa-8 "
                elevation="0"
                rounded="lg"
            >
              <div class="tw-flex tw-items-center  mb-5">
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
                      :allowed-dates="permitirDatas"
                      v-model="form.nascimento"
                      @change="(e)=>{ form.nascimento = new Date(converterData(e.target._value) + 'T00:00:00')}"
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
                      hide-details="auto"
                      placeholder="Digite o seu bairro "
                      variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12"  lg="6">
                  <div class="text-subtitle-1 text-medium-emphasis">Município</div>

                  <v-select
                      density="compact"
                      color="secondary"
                      item-value="codigo"
                      item-title="nome"
                      v-model="form.comprador.cmun"
                      hide-details="auto"
                      :items="municipios"
                      placeholder="Selecione seu município "
                      variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12"  lg="6">
                  <div class="text-subtitle-1 text-medium-emphasis">Logradouro</div>

                  <v-text-field
                      density="compact"
                      color="secondary"
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
                <v-col cols="12"  >
                  <div class="text-subtitle-1 text-medium-emphasis">Seu email</div>

                  <v-text-field
                      density="compact"
                      color="secondary"
                      v-model="form.email"
                      hide-details="auto"
                      placeholder="Digite o seu email "
                      prepend-inner-icon="mdi-email-outline"
                      variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>


              <v-btn
                  @click="handleSubmit"
                  class=""
                  color="secondary"
                  size="large"
                  rounded
                  variant="outlined"
                  block
              >
                Atualizar
              </v-btn>

            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="pedidos">
            <TableOrders :header="['Código do pedido','Viagem','Data da Compra','status']" />
          </v-tabs-window-item>
          <v-tabs-window-item value="alterar-senha">
            <v-card
                class="mx-auto pa-8  "
                elevation="0"
                rounded="lg"
            >
              <div class="tw-flex tw-items-center  mb-5">
                <v-btn variant="outlined" color="secondary" rounded >
                  <span class="tw-text-xs">Alterar senha </span>
                </v-btn>
                <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
              </div>
              <v-row class="my-5">
                <v-col cols="12"  >
                  <div class="text-subtitle-1 text-medium-emphasis">Sua nova senha</div>
                  <v-text-field
                      :append-inner-icon="visible1 ? 'mdi-eye-off' : 'mdi-eye'"
                      :type="visible1 ? 'text' : 'password'"
                      density="compact"
                      color="secondary"
                      hide-details="auto"
                      v-model="formPassword.new_password"
                      placeholder="Digite sua nova senha"
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
                <v-col cols="12"  >
                  <div class="text-subtitle-1 text-medium-emphasis">Confirme sua nova senha</div>

                  <v-text-field
                      :append-inner-icon="visible3 ? 'mdi-eye-off' : 'mdi-eye'"
                      :type="visible3 ? 'text' : 'password'"
                      density="compact"
                      color="secondary"
                      hide-details="auto"
                      v-model="formPassword.password_confirmation"
                      placeholder="Digite novamente sua nova senha"
                      prepend-inner-icon="mdi-lock-outline"
                      variant="outlined"
                      @click:append-inner="visible3 = !visible3"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn
                  @click="submitFormPassword"
                  class=""
                  color="secondary"
                  size="large"
                  rounded
                  variant="outlined"
                  block
              >
                Atualizar
              </v-btn>

            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="excluir-conta">
            <v-card
                class="mx-auto pa-8  "
                elevation="0"
                rounded="lg"
            >
              <div class="tw-flex tw-items-center  mb-5">
                <v-btn variant="outlined" color="error" rounded >
                  <span class="tw-text-xs">Deletar Contar Permanentemente</span>
                </v-btn>
                <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
              </div>
              <v-row class="my-5">
                <v-col cols="12">
                  Depois que você excluir sua conta, não há como voltar atrás. Por favor, tenha certeza.
                </v-col >
                <v-col cols="12" >
                  <v-btn
                      @click="deleteAccount"
                      color="error"
                      size="large"
                      rounded
                      variant="outlined"
                      block
                  >
                    Deletar sua conta
                  </v-btn>
                </v-col>
              </v-row>

            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>

  </div>

</template>

<style scoped>

</style>
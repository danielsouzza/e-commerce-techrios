<script setup>

import {Icon} from "@iconify/vue";
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import {routes} from "../services/fetch.js";
import BaseCard from "../components/shared/BaseCard.vue";
import CardTicket from "../components/shared/CardTicket.vue";
import CardFilter from "../components/shared/CardFilter.vue";
import {
  formatarTempoViagem,
  formatCurrency,
  formatDate,
  formatMoney,
  gerarStringTiposComodos,
  getMonicipioLabel
} from "../Helper/Ultis.js";
import PassegerForm from "../components/app/PassegerForm.vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import router from "../routes/index.js";
import CardPayment from "../components/shared/CardPayment.vue";
import CopyToClipboard from "../components/shared/CopyToClipboard.vue";



const route = useRoute();
const ticketSelected = ref([])
const filtersData = ref([])
const stepSale = ref(1)
const orderResponse = ref(null)
const orderPending = ref(null)
const orderConfirmation = ref(null)
const trechosWithTravels = ref([])
const waitPayment = ref(false)
const formPayment = reactive({
  order_id:null,
  payment_method_id:null,
  credit_card:{
    holder:null,
    card_number:null,
    expiration_date:'',
    security_code:null,
    installment_quantity:null,
  }
})
const filtersSelected = ref({
  origem:null,
  destino:null,
  dataIda:null,
  dataVolta:null,
})
const formSale = reactive({
  trecho:null,
  viagem:null,
  data_hora:null,
  total_passagems:0.0,
  total_taxas:0.0,
  contato:{
    nome:'',
    email:'',
    telefone:'',
    tipo_doc:null,
    data_nascimento:null,
    document:'',
  },
  dataComodos:[],
  dataVolta:null,
})
const tiposDoc = [
  { id:1, nome: 'RG', tamanho: 15, mask: '###############' },
  { id:2, nome: 'Titulo de Eleitor', tamanho: 12, mask: '#### #### ####' },
  { id:3, nome: 'Passaporte', tamanho: 20, mask: '******************' },
  { id:4, nome: 'CNH', tamanho: 11, mask: '###########' },
  { id:5, nome: 'CPF', tamanho: 0, mask: '###.###.###-##' }
];
const months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const years = computed(() => {
      const currentYear = new Date().getFullYear();
      return  Array.from({ length: 21 }, (_, i) => `${currentYear + i}`);
    })

const updateFilters = () => {
  filtersSelected.value.origem = parseInt(route.query.origem) || null;
  filtersSelected.value.destino = parseInt(route.query.destino) || null;
  filtersSelected.value.dataIda = new Date(route.query.dataIda) || '';
  filtersSelected.value.dataVolta = route.query.dataVolta || null;
};

function getTrechosWithTravels() {
  const params = new URLSearchParams()
  params.append('origem', filtersSelected.value.origem || '')
  params.append('destino', filtersSelected.value.destino || '')
  params.append('data_hora', formatDate(filtersSelected.value.dataIda) || '')
  routes["trechos-viagem"](params).then(response => {
    trechosWithTravels.value = response.data
    console.log(trechosWithTravels.value)
  })
}

function getFilterItems(){
  routes["filtros"]().then(res => {
    if(!res.data.data.success){
      filtersData.value = res.data.data;
    }
  })
}

function nextStep(){
  stepSale.value = stepSale.value + 1;
}

function prevStep(){
  stepSale.value = stepSale.value - 1;
  if(stepSale.value === 1){
    resetFormSale()
  }
}

function saveTicket(items){
  ticketSelected.value = items;
  const total = calculateTotal();
  formSale.trecho = ticketSelected.value.trecho.id;
  formSale.viagem = ticketSelected.value.trecho.id_viagem;
  formSale.total_passagems = total.passagens;
  formSale.total_taxas = total.taxa;
  formSale.data_hora = ticketSelected.value.trecho.data_embarque;
  ticketSelected.value.rooms.forEach(item => {
    formSale.dataComodos.push({
      tipo_doc:1,
      nome:'',
      document:'',
      nascimento:null,
      comodo:item.id,
      embarque:parseInt(formatMoney(ticketSelected.value.trecho.taxa_de_embarque)),
      valor:item.comodo_trechos?.valor ? item.comodo_trechos?.valor : parseFloat(formatMoney(ticketSelected.value.trecho.valor)),
      comodo_relacionado:'',
      telefone:''
    })
  })
  nextStep();
}

function getQuantityTicket(){
  return ticketSelected.value.rooms.length
}

function calculateTotal(){
  const valor = ticketSelected.value.rooms.reduce((acc,item)=>{
    return acc + (item.comodo_trechos?.valor ? item.comodo_trechos?.valor : parseFloat(formatMoney(ticketSelected.value.trecho.valor)))
  },0)

  const taxa = getQuantityTicket() * parseInt(formatMoney(ticketSelected.value.trecho.taxa_de_embarque))
  return {
    passagens: valor,
    taxa:taxa,
  };
}

function submitOrder(){
  formSale.contato.data_nascimento = formatDate(formSale.contato.nascimento)
  formSale.dataComodos.forEach(item => {
    item.data_nascimento = formatDate(item.nascimento)
  })

  formSale.total = formSale.total_passagems + formSale.total_taxas;
  routes["order"](formSale).then(res => {
    console.log(res.data)
    if(res.data.success){
      orderResponse.value = res.data.data;
      formPayment.order_id = orderResponse.value.id;
      nextStep()
    }
  })
}

function submitConfirm(){
  routes["order.confirm"](formPayment.order_id, {forma_pagamento_id:formPayment.payment_method_id}).then(res => {
    if(res.data.success){
      orderConfirmation.value = res.data.data;
      nextStep()
    }
  })
}

function checkStatusPayment(){
  routes["payment.status"](formPayment.order_id).then(res => {
    console.log(res.data)
    if(res.data.success){
      orderConfirmation.value = res.data.data;
    }
  })
}

function submitPaymentCredit(){
  formPayment.payment_method_id = 3

  routes["payment.credito"](formPayment).then(res => {
    console.log(res.data)
    if(res.data.success){
      orderPending.value = res.data.data;
      waitPayment.value = true
      nextStep()
      setTimeout(()=>{
        checkStatusPayment()
      },5000)
    }
  })
}

function submitPaymentPix(){
  formPayment.payment_method_id = 6
  routes["payment.pix"]({order_id:formPayment.order_id}).then(res => {
    console.log(res.data)
    if(res.data.success){
      orderPending.value = res.data.data;
      waitPayment.value = true
      nextStep()
      setTimeout(()=>{
        checkStatusPayment()
      },5000)
    }
  })


}

function resetFormSale() {
  formSale.trecho = null;
  formSale.viagem = null;
  formSale.data_hora = null;
  formSale.total_passagems = 0.0;
  formSale.total_taxas = 0.0;
  formSale.contato = {
    nome: '',
    email: '',
    telefone: '',
    tipo_doc: null,
    nascimento: [],
    document: '',
  };
  formSale.dataComodos = [];
  formSale.dataVolta = null;
}

function updateFormattedDate(value,type) {
  let [month, year] = formPayment.credit_card.expiration_date.split("/");
  if (type === 'month') {
    month = value
  }else{
    year = value
  }
  formPayment.credit_card.expiration_date = `${month}/${year}`;
}
function addCompradorComoPassageiro(){
  const contato = formSale.contato;
  formSale.dataComodos[0].tipo_doc = contato.tipo_doc;
  formSale.dataComodos[0].nome = contato.nome;
  formSale.dataComodos[0].document = contato.document;
  formSale.dataComodos[0].nascimento = [contato.nascimento];
  formSale.dataComodos[0].telefone = contato.telefone;

  console.log(formSale)
}



onMounted(() => {
  updateFilters();
  getFilterItems()
  getTrechosWithTravels()
});


</script>

<template>
  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex lg:!tw-mb-[50px] !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-4 px-5 lg:tw-text-lg">Passagem de <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem',filtersData)}}</strong> para <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}</strong></div>
      <v-btn color="secondary" class="mb-3 lg:!tw-hidden" variant="outlined" rounded >
        <div class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
          <Icon icon="flowbite:arrows-repeat-outline" class="mr-2 tw-text-xl"/>
          INVERTER
        </div>
      </v-btn>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <CardFilter
        v-model="filtersSelected"
        @update:modelValue="getTrechosWithTravels()"
        :options="filtersData"
        class=" tw-top-[-30px]  !tw-mb-[-30px] lg:tw-top-[-70px] lg:!tw-mb-[-70px] !tw-mx-5 lg:!tw-mx-0 !tw-hidden lg:!tw-block" />
    <v-card flat  class=" my-3 !tw-px-3 !tw-py-2 !tw-hidden">
      <div class="tw-flex tw-justify-between tw-items-center tw-p-2 tw-text-[12px] tw-rounded-lg">
        <div class="tw-text-p tw-font-semibold ">Dom, 28 abr</div>
        <div class="tw-text-p tw-flex tw-items-center tw-font-semibold">Alterar data Viagem <Icon icon="uis:calendar" class="ml-2"/></div>
      </div>
    </v-card>
    <div v-if="stepSale == 1" class="tw-flex tw-justify-between tw-items-center  tw-px-3 mt-5 lg:!tw-hidden">
      <div class="tw-font-bold  ">
        Selecionar sua viagem
      </div>
      <div class="tw-flex tw-justify-between tw-text-sm tw-items-center tw-text-p/50 tw-font-semibold">
        Filtrar  <Icon icon="mage:filter-fill" class="ml-2 tw-text-xl tw-text-p"/>
      </div>
    </div>
    <div class="lg:tw-flex tw-items-center !tw-my-10  tw-hidden">
      <v-btn variant="outlined" :color="stepSale > 1 ? 'success': 'secondary'" rounded @click="prevStep">
        <Icon icon="mingcute:ship-line" class="ml-2 tw-text-xl" />
        SELECIONE A SUA VIAGEM
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" :color="stepSale > 2 ? 'success' : stepSale == 2 ? 'secondary' : 'grey100'" rounded>
        <Icon icon="fluent:data-usage-edit-20-regular" class="ml-2 tw-text-xl"/>
        INFORMAR DADOS
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" :color="stepSale > 3 ? 'success' : stepSale == 3 ? 'secondary' : 'grey100'" rounded>
        <Icon icon="fluent:wallet-credit-card-20-regular" class="ml-2 tw-text-xl"/>
        FORMA DE PAGAMENTO
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" :color=" stepSale == 4 ? 'secondary' : 'grey100'" rounded>
        <Icon icon="icon-park-outline:ticket" class="ml-2 tw-text-xl"/>
        CONFIRMAÇÃO DA VIAGEM
      </v-btn>
    </div>
    <div v-if="stepSale == 1" class="tw-flex tw-justify-between my-3 tw-gap-10">
      <v-card width="30%" rounded="lg" flat class="lg:!tw-block !tw-hidden tw-h-full">
        <v-container fluid>
          <p class="tw-font-semibold tw-px-3">Horário de Saída</p>
          <div>
            <v-checkbox
                v-model="selected"
                label="Manhã(6h - 1h59)"
                hide-details
                value="John"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Tarde(12h - 17h59)"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Noite(18h -23h59)"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Madrugada(00h - 5h59)"
                hide-details
                value="Jacob"
            ></v-checkbox>
          </div>

          <p class="tw-font-semibold tw-px-3 mt-1">Tipo de Assento</p>
          <div>
            <v-checkbox
                v-model="selected"
                label="Assento/Poltrona"
                hide-details
                value="John"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Rede"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="Camarote"
                hide-details
                value="Jacob"
            ></v-checkbox>
          </div>

          <p class="tw-font-semibold tw-px-3  mt-1 ">Companhia</p>
          <div>
            <v-checkbox
                v-model="selected"
                label="São Bartolomeu VI"
                hide-details
                value="John"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="LM Zé Holanda"
                hide-details
                value="Jacob"
            ></v-checkbox>
            <v-checkbox
                v-model="selected"
                label="FB OGP III"
                hide-details
                value="Jacob"
            ></v-checkbox>
          </div>
        </v-container>
      </v-card>
      <div class="tw-flex tw-flex-col tw-gap-3 tw-w-full">
        <v-card  flat  class=" my-3 !tw-px-3 !tw-py-2">
          <div class="tw-flex tw-justify-between tw-items-center tw-p-2 tw-text-[12px]">
            <div class="tw-text-p tw-font-semibold ">Dom, 28 abr</div>
            <div class="tw-text-p tw-flex tw-items-center tw-font-semibold">Alterar data Viagem <Icon icon="uis:calendar" class="ml-2"/></div>
          </div>
        </v-card>
        <CardTicket v-for="item in trechosWithTravels.data?.trechos?.data" :data="item" class="!tw-h-fit" @continue="saveTicket"></CardTicket>
      </div>
    </div>

    <v-expand-x-transition  class="tw-flex tw-justify-between my-3 " >
      <v-row v-if="stepSale === 2"  class="!tw-flex-row-reverse">
        <v-col cols="12" md="3">
          <BaseCard title="Pague no pix com desconto">
            <div class="tw-flex tw-flex-col tw-px-4 tw-py-2">
              <div class=" tw-font-bold tw-text-gray-800 ">Resumo da viagem</div>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>

              <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-1">IDA</div>

              <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                <v-col cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="uis:calendar" class="mr-2" width="15"/>{{ticketSelected.trecho.horario}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{formatarTempoViagem(ticketSelected.trecho.tempo_viagem)}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="solar:map-arrow-up-bold" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem', filtersData)}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{gerarStringTiposComodos(ticketSelected.rooms.map(it=>it.tipo_comodidade))}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{ticketSelected.trecho.embarcacao}}
                </v-col>
              </v-row>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
              <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                <v-col cols="6" class="tw-flex tw-items-center !tw-py-2  tw-text-xs">
                  <Icon icon="icon-park-outline:ticket" class="mr-2" width="15"/>{{getQuantityTicket()}} {{getQuantityTicket() > 1 ? 'passagens' : 'passagens'}}
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center !tw-py-2 !tw-font-black tw-text-sm !tw-text-primary tw-justify-end">
                  {{ formatCurrency(formSale.total_passagems) }}
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs ">
                  <Icon icon="icon-park-outline:doc-search-two" class="mr-2" width="15"/>Taxa de serviço
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs  tw-justify-end">
                  {{ formatCurrency(formSale.total_taxas) }}
                </v-col>
              </v-row>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
              <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                <v-col cols="6" >
                  Total à vista
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center  !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                  <div class="tw-text-end">
                    {{formatCurrency(formSale.total_passagems + formSale.total_taxas)}}<br>
                    <p class="tw-text-xs tw-text-gray-500 tw-font-light">ou a partir de R$ 62,40 no cartão</p>
                  </div>
                </v-col>
              </v-row>
            </div>
          </BaseCard>
        </v-col>
        <v-col cols="12" md="9">
          <BaseCard title="Dados de quem está comprando" color="secondary">
            <v-row class="tw-px-2">
              <v-col cols="12" md="6">
                <v-text-field
                    variant="plain"
                    v-model="formSale.contato.nome"
                    label="Nome do comprador"
                    hide-details="auto"
                >
                  <template v-slot:prepend-inner>
                    <Icon icon="stash:person-light" width="26"/>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    variant="plain"
                    v-model="formSale.contato.email"
                    label="E-mail"
                    hide-details="auto"
                >
                  <template v-slot:prepend-inner>
                    <Icon icon="mdi-light:email" width="26"/>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                    variant="plain"
                    v-model="formSale.contato.telefone"
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
                    variant="plain"
                    label="Documento"
                    item-title="nome"
                    item-value="id"
                    v-model="formSale.contato.tipo_doc"
                    hide-details="auto"
                    :items="tiposDoc"
                >
                </v-select>
              </v-col>

              <v-col cols="6" >
                <v-text-field
                    variant="plain"
                    v-model="formSale.contato.document"
                    label="Nº do documento"
                    hide-details="auto"
                >
                  <template v-slot:prepend-inner>
                    <Icon icon="material-symbols-light:id-card-outline" width="26"/>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-date-input
                    flat
                    hide-details
                    prepend-icon=""
                    v-model="formSale.contato.nascimento"
                    variant="solo"
                    class="my-select"
                    placeholder="Data de Nascimento">
                  <template #default>
                    <Icon icon="uis:calendar" class="mr-2"/>
                  </template>
                </v-date-input>
              </v-col>
            </v-row>
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
            <v-checkbox
                @update:modelValue="(arg)=>{if(arg) {addCompradorComoPassageiro()}}"
                hide-details="auto"
                class="!tw-text-p tw-mt-3 !tw-text-sx"
                label="Adicionar como passageiro"
            >
            </v-checkbox>
          </BaseCard>
          <BaseCard title="Dados de quem irá viajar" color="secondary" class="mt-3">
            <PassegerForm v-for="(item,index) in formSale.dataComodos" :form="item" :key="index" :index="index"/>
          </BaseCard>
          <v-col cols="12"  class="tw-flex tw-justify-between mt-3">
            <v-btn variant="flat" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 "  @click="prevStep">
              <Icon icon="mdi:navigate-before" width="20"  class="mr-1 tw-text-white"  /> <span class=" !tw-text-xs tw-text-white mr-1"  >Voltar</span>
            </v-btn>
            <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 "  @click="submitOrder">
              <span class=" !tw-text-xs tw-text-white ml-1"  >Avançar</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
            </v-btn>
          </v-col>
        </v-col>
      </v-row>
    </v-expand-x-transition>
    <v-expand-x-transition  class="tw-flex tw-justify-between my-3 " >
      <v-row v-if="stepSale == 3"  class="!tw-flex-row-reverse">
        <v-col cols="12" md="3">
          <BaseCard title="Pague no pix com desconto">
            <div class="tw-flex tw-flex-col tw-px-4 tw-py-2">
              <div class=" tw-font-bold tw-text-gray-800 ">Resumo da viagem</div>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>

              <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-1">IDA</div>

              <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                <v-col cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="uis:calendar" class="mr-2" width="15"/>{{ticketSelected.trecho.horario}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{formatarTempoViagem(ticketSelected.trecho.tempo_viagem)}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="solar:map-arrow-up-bold" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem', filtersData)}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{gerarStringTiposComodos(ticketSelected.rooms.map(it=>it.tipo_comodidade))}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}
                </v-col>
                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                  <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{ticketSelected.trecho.embarcacao}}
                </v-col>
              </v-row>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
              <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                <v-col cols="6" class="tw-flex tw-items-center !tw-py-2  tw-text-xs">
                  <Icon icon="icon-park-outline:ticket" class="mr-2" width="15"/>{{getQuantityTicket()}} {{getQuantityTicket() > 1 ? 'passagens' : 'passagens'}}
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center !tw-py-2 !tw-font-black tw-text-sm !tw-text-primary tw-justify-end">
                  {{ formatCurrency(formSale.total_passagems) }}
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs ">
                  <Icon icon="icon-park-outline:doc-search-two" class="mr-2" width="15"/>Taxa de serviço
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs  tw-justify-end">
                  {{ formatCurrency(formSale.total_taxas) }}
                </v-col>
              </v-row>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
              <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                <v-col cols="6" >
                  Total à vista
                </v-col>
                <v-col cols="6" class="tw-flex tw-items-center  !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                  <div class="tw-text-end">
                    {{formatCurrency(formSale.total_passagems + formSale.total_taxas)}}<br>
                    <p class="tw-text-xs tw-text-gray-500 tw-font-light">ou a partir de R$ 62,40 no cartão</p>
                  </div>
                </v-col>
              </v-row>
            </div>
          </BaseCard>
        </v-col>
        <v-col cols="12" md="9" >
          <BaseCard >
            <div class=" tw-font-bold tw-px-2 tw-text-gray-800 ">Escolher como pagar sua viagem</div>
          </BaseCard>
          <BaseCard title="Desconto de 5% para pagamento via pix"  class="mt-3">
            <CardPayment title=" PIX (liberação imediata)" icon="ic:baseline-pix">
              <template #icon>
                <Icon icon="ic:baseline-pix"  class="mr-2 tw-text-green-400" width="26"/>
              </template>
              <p class="tw-text-p mt-3">Você deve informar o nome completo e o CPF/CNPJ de quem irá realizar o PIX. <strong>O QR Code será exibido após a confirmação de compra.</strong></p>
              <div class="tw-text-p mt-4 tw-border-2 tw-border-red-200 tw-bg-red-50 tw-rounded-lg tw-py-2 tw-px-3">
                <p class="tw-text-red-400">
                  <strong>IMPORTANTE:</strong> Após finalizar a compra, o PIX gerado ficará
                  disponível por 30 minutos para pagamento, após esse período
                  o código expira e seu pedido será cancelado.
                </p>
              </div>
              <div class="mt-3 tw-px-3">
                <ul class="tw-list-disc">
                  <li>O pagamento poderá ser efetuado via aplicativos de pagamento, lendo o QR Code ou copiar e colando a URL gerada</li>
                  <li>Caso você tenha um programa anti pop-up, você deverá desativá-lo.</li>
                </ul>
              </div>
              <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2  mt-3 lg:!tw-py-5"  @click="submitPaymentPix">
                <Icon icon="ic:baseline-pix"  class="mr-2 tw-text-white" width="26"/><span class=" !tw-text-xs lg:!tw-text-sm tw-text-white ml-1"  >REALIZAR PAGAMENTO VIA PIX</span>
              </v-btn>
            </CardPayment>
          </BaseCard>
          <BaseCard class="mt-3" >
            <CardPayment title="Cartão de crédito">
              <template #icon>
                <Icon icon="heroicons:credit-card-20-solid"  class="mr-2 " width="26"/>
              </template>
              <v-row class="mt-3">
                <v-col cols="12" >
                  <v-text-field variant="plain" v-model="formPayment.credit_card.holder" label="Nome no cartão"/>
                </v-col>
                <v-col cols="12" >
                  <v-text-field  variant="plain" v-model="formPayment.credit_card.card_number" label="Numero do cartão"/>
                </v-col>
                <v-col>
                  <v-row justify="center">
                    <v-col cols="12" md="6" >
                      <v-select
                          variant="plain"
                          :items="months"
                          @update:modelValue="(args)=>updateFormattedDate(args, 'month')"
                          label="Mês"
                      ></v-select>
                    </v-col>
                    <v-col cols="12"  md="6">
                      <v-select
                          variant="plain"
                          @update:modelValue="(args)=>updateFormattedDate(args, 'year')"
                          :items="years"
                          label="Ano"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2  mt-3 lg:!tw-py-5"  @click="submitPaymentCredit">
                <Icon icon="heroicons:credit-card-20-solid"  class="mr-2 tw-text-white" width="26"/><span class=" !tw-text-xs lg:!tw-text-sm tw-text-white ml-1"  >REALIZAR PAGAMENTO</span>
              </v-btn>
            </CardPayment>
          </BaseCard>
          <v-btn variant="flat" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 mt-3"  @click="prevStep">
            <Icon icon="mdi:navigate-before" width="20"  class="mr-1 tw-text-white"  /> <span class=" !tw-text-xs tw-text-white mr-1"  >Voltar</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-expand-x-transition>
    <v-expand-x-transition  class="tw-flex tw-justify-between my-3 " >
      <v-row v-if="stepSale === 4"  >
        <v-col cols="12" v-if="formPayment.payment_method_id === 6" >
          <BaseCard title="Confirmação da compra"  class="mt-3">
            <v-progress-linear
                :active="waitPayment"
                :indeterminate="waitPayment"
                color="secondary"
                absolute
                bottom
            ></v-progress-linear>
            <div class="tw-flex tw-justify-center tw-flex-col tw-items-center">
              <p class="tw-text-p tw-text-sm">Sua compra foi concluída com sucesso. Você receberá um e-mail de confirmação com mais detalhes</p>
              <p class="tw-text-lg tw-font-bold my-2">Realize o pagamento através do QR Code abaixo.</p>
              <v-img
                  rounded
                  width="400"
                  height="400"
                  lazy-src="https://picsum.photos/id/11/400/400"
                  src="https://bad.src/not/valid"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                        color="grey-lighten-4"
                        indeterminate
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
              <p class="tw-text-lg tw-font-bold my-2">PIX Copiar e Colar</p>
              <CopyToClipboard  textToCopy="00020101021226860014br.gov.bcb.pix2564pix-qrcode.sicredi.com.br/qr/v2/3df3983710fe40a" />
            </div>
          </BaseCard>
        </v-col>
      </v-row>
    </v-expand-x-transition>
    <v-expand-x-transition  class="tw-flex tw-justify-between my-3 " >
      <v-row v-if="stepSale === 5"  >
        <v-col cols="12" v-if="formPayment.payment_method_id === 6" >
          <BaseCard title="Confirmação da compra"  class="mt-3">
            <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">

              <Icon icon="icon-park-outline:ticket"  class="mr-2 tw-text-secondary !tw-text-[80px]"  />

              <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
              <p> Olá, {{orderConfirmation.nome}}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
              <p><strong>Pedido {{orderConfirmation.pedido.id}}</strong></p>
              <p>Para consultar seu pedido é só <a href="#" class="tw-text-secondary tw-underline tw-font-semibold">clicar aqui</a></p>
              <div class="tw-flex tw-justify-center tw-items-center tw-gap-1  py-2">
                <div class="!tw-rounded-[3px] !tw-text-[10px] tw-text-secondary tw-bg-secondary/10 tw-flex tw-p-2 tw-items-center tw-font-bold"><Icon icon="lets-icons:print" width="15"  class="mr-1 tw-text-black" />PASSAGEM IMPRESSA</div>
                <div class="!tw-rounded-[3px] !tw-text-[10px] tw-text-secondary tw-bg-secondary/10 tw-flex tw-p-2 tw-items-center tw-font-bold"><Icon icon="tdesign:qrcode" width="15"  class="mr-1 tw-text-black" />PASSAGEM NO CELULAR</div>
              </div>
            </div>
          </BaseCard>
        </v-col>
      </v-row>
    </v-expand-x-transition>

  </div>
</template>

<style scoped>
.v-input--density-default {
  --v-input-control-height: auto !important;
  --v-input-padding-top: 16px;
}

</style>
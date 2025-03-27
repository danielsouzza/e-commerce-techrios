<script setup>

import {Icon} from "@iconify/vue";
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {routes} from "../services/fetch.js";
import BaseCard from "../components/shared/BaseCard.vue";
import CardTicket from "../components/shared/CardTicket.vue";
import CardFilter from "../components/shared/CardFilter.vue";
import {
  calcularValor,
  formatarTempoViagem,
  formatCurrency,
  formatDate, formatDateToServe,
  formatMoney,
  gerarStringTiposComodos,
  getMonicipioLabel,
} from "../Helper/Ultis.js";
import PassegerForm from "../components/app/PassegerForm.vue";
import CardPayment from "../components/shared/CardPayment.vue";
import CopyToClipboard from "../components/shared/CopyToClipboard.vue";
import VueQrcode from "vue-qrcode";
import {useCartStore} from "../store/CartStore.js";
import router from "../routes/index.js";
import CartItem from "../components/app/Cart/CartItem.vue";
import {userAuthStore} from "../store/AuthStore.js";
import {getApiBaseUrl, getAppBaseUrl} from "../services/api.js";
import {closeAllCards, showErrorNotification, showInfoNotification, showSuccessNotification, scrollBehavior} from "../event-bus.js";
import {useLoadingStore} from "../store/states.js";
const props = defineProps({
  tab:String,
})

const showFormNotification = ref(false)
const percentToPay = ref(0)
const timeToPay = ref(30 * 60)
const cartStore = useCartStore()
const authStore = userAuthStore()
const loadingStore = useLoadingStore();
const route = useRoute();
const whatPayment = ref(false)
const windowWidth = ref(window.innerWidth);
const menu = ref(false)
const filtersData = ref([])
const orderResponse = ref(null)
const paymentPending = ref(null)
const empresas = ref([])
const orderConfirmation = ref(null)
const trechosWithTravels = ref([])
const formRef = ref()
let checkTimeout = null;
const formPayment = reactive({
  order_id:null,
  payment_method_id:6,
  credit_card:{
    holder:null,
    card_number:null,
    expiration_date:'',
    security_code:null,
    installment_quantity:{value:1,pencet:0.0},
  }
})
const filtersSelected = ref({
  origem:null,
  destino:null,
  dataIda:new Date(),
  dataVolta:null,
  type:null,
  intervalo:null,
  empresa:null,
  tipo_comodidade_id:null,
  quantia:8
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
    document:"",
  },
  dataComodos:[],
  dataVolta:null,
  errors:{},
  processing:false
})

const formNotification = reactive({
  email: authStore.user?.email ?? null,
  telefone: authStore.user?.comprador.telefone ?? null,
  url:getAppBaseUrl()+'/comprar-passagem/escolher-passagem',
  municipio_origem_id:null,
  municipio_destino_id:null,
  errors:{},
  processing:false
})

const nextDays = ref([])
const years = computed(() => {
      const currentYear = new Date().getFullYear();
      return  Array.from({ length: 21 }, (_, i) => `${currentYear + i}`);
    })
const isLargeScreen = computed(()=> windowWidth.value >= 1024)
const months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const tabs = [
  {
    step:1,
    value:'escolher-passagem'
  },
  {
    step:2,
    value:'infor-data'
  },
  {
    step:3,
    value:'pagamento'
  },
  {
    step:4,
    value:'confirmacao'
  }
]
const stepSale = ref(tabs.find(it=>it.value == props.tab).step)
const cart = computed(()=>{
  return cartStore
})
const pacerls = [
  {value:1,pencet:0.0},
  {value:2,pencet:0.06},
  {value:3,pencet:0.07},
  {value:4,pencet:0.08},
  {value:5,pencet:0.09},
  {value:6,pencet:0.10},
]
let intervalo = null;

const iniciarTemporizador = () => {
  intervalo = setInterval(() => {
    if (timeToPay.value > 0) {
      timeToPay.value--;
      percentToPay.value += 100 / 60;
      if (percentToPay.value >= 100) {
        percentToPay.value = 1;
      }
    } else {
      clearInterval(intervalo);
    }
  }, 1000);
};

const formatarTempo = () => {
  const minutos = Math.floor(timeToPay.value / 60);
  const segundos = timeToPay.value % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
};

const downloadFile = async (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank'; // Abre em nova aba
  link.download = filename;
  link.click()
}
const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  generateNextDays()
};

const updateFilters = () => {
  filtersSelected.value.origem = route.query.origem || null;
  filtersSelected.value.destino = route.query.destino || null;
  filtersSelected.value.type = route.query.type;
  filtersSelected.value.dataIda = new Date(route.query.dataIda + 'T00:00:00') || new Date().toISOString().split('T')[0];
  filtersSelected.value.dataVolta = route.query.dataVolta ? new Date(route.query.dataVolta + 'T00:00:00') : null;
  generateNextDays()
};

function generateNextDays(data_hora) {
  const dateCurrent = data_hora ?? filtersSelected.value.dataIda;
  if (!dateCurrent) return;

  let date = new Date(dateCurrent);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (date < hoje) {
    date = hoje;
  }

  let futureDates = [];
  let start = isLargeScreen.value ? -3 : -1;
  let end = isLargeScreen.value ? 4 : 2;

  while (start < 0) {
    let pastDate = new Date(date);
    pastDate.setDate(date.getDate() + start);
    if (pastDate < hoje) {
      start++;
    } else {
      break;
    }
  }

  for (let i = start; i < end; i++) {
    let futureDate = new Date(date);
    futureDate.setDate(date.getDate() + i);

    if (filtersSelected.value.dataVolta && futureDate > filtersSelected.value.dataVolta) {
      break;
    }

    futureDates.push(futureDate);
  }

  nextDays.value = futureDates;
}

function getTrechos(){
  const params = new URLSearchParams()
  params.append('origem', filtersSelected.value.origem || '')
  params.append('destino', filtersSelected.value.destino || '')
  params.append('data_hora', formatDate(filtersSelected.value.dataIda) || '')
  params.append('data_hora_volta', formatDate(filtersSelected.value.dataVolta) || '')
  params.append('intervalo', filtersSelected.value.intervalo || '')
  params.append('tipo_comodidade_id', filtersSelected.value.tipo_comodidade_id || '')
  params.append('quantia', filtersSelected.value.quantia || '')
  params.append('empresa', filtersSelected.value.empresa || '')
  params.append('subdomain', window.subdomain || '')
 loadingStore.startLoading();
  routes["trechos-viagem"](params).then(response => {

    if(filtersSelected.value.type == "ida-e-volta"  && response.data.data.tipo == "ida" && response.data.data.trechos.data.length > 0){
      showInfoNotification('Infelizmente não temos viajem de volta para o trecho escolhidos, mas temos viagem somente de ida');
      filtersSelected.value.type = 'somente-ida'

    }
    trechosWithTravels.value = response.data
    const date = filtersSelected.value.dataIda.getDate()
    const first = nextDays.value[0].getDate()
    const last = nextDays.value[nextDays.value.length - 1].getDate()
    if(date === first || date === last){
      generateNextDays();
    }
    loadingStore.stopLoading();
    router.push(
        {
          name: "sale",
          params:{tab:'escolher-passagem'},
          query: {
            ...filtersSelected.value,
            dataIda:formatDateToServe(filtersSelected.value.dataIda),
            dataVolta:formatDateToServe(filtersSelected.value.dataVolta)
          }
        }
    );
  }).catch(error => {
    loadingStore.stopLoading();
    if(error.response.data.data?.error){
      showErrorNotification(error.response.data.data?.error);
    }
  })
}

function getTrechosWithTravels() {
  resetFormSale()
  getTrechos()
}

function getFilterItems(){
  routes["filtros"]().then(res => {
    if(!res.data.data.success){
      filtersData.value = res.data.data;
    }
  })
}

function getEmpresas(){
  routes["empresas"]({flag:2}).then(res => {
    if(!res.data.data.success){
     empresas.value = res.data.data
    }
  })
}

function formatDates(date) {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  let dayOfWeek = daysOfWeek[date.getDay()];
  let day = date.getDate();
  return `${dayOfWeek} ${day}`;
}

function nextStep(){
  stepSale.value = stepSale.value + 1;
  scrollBehavior()
}

function prevStep(){
  stepSale.value = stepSale.value - 1;
  if(stepSale.value === 1){
    // resetFormSale()
  }
}

function saveTicket(items) {
  const totalIda = calculateTotal(items.dataIda);

  Object.assign(formSale, {
    total_passagems: totalIda.passagens,
    total_taxas: totalIda.taxa,
    trecho: items.dataIda.trecho,
    viagem: items.dataIda.trecho.id_viagem,
    data_hora: items.dataIda.trecho.data_embarque,
    dataComodos: populateComodos(items.dataIda.rooms, items.dataIda.trecho)
  });

  if (filtersSelected.value.type === "ida-e-volta") {
    const totalVolta = calculateTotal(items.dataVolta);
    formSale.total_passagems += totalVolta.passagens;
    formSale.total_taxas += totalVolta.taxa;

    formSale.dataVolta = {
      trecho: items.dataVolta.trecho,
      viagem: items.dataVolta.trecho.id_viagem,
      dataComodos: populateComodos(items.dataVolta.rooms, items.dataVolta.trecho)
    };
  }

  nextStep();
}

function populateComodos(rooms, trecho) {
  const comodos = [];

  rooms.forEach(item => {
    const baseComodo = {
      tipo_doc: null,
      nome: '',
      document: '',
      nascimento: null,
      desconto_id: trecho.desconto?.id ?? null,
      comodo: item.id,
      tipo_comodidade: item.tipo_comodidade,
      embarque: parseInt(formatMoney(trecho.taxa_de_embarque)),
      valor: item.comodo_trechos?.valor ?? parseFloat(formatMoney(trecho.valor)),
      telefone: '',
      isContact:false,
      errors: {}
    };

    comodos.push({ ...baseComodo, comodo_relacionado: null, comodos_filhos: item.quantidade });

    for (let i = 1; i < item.quantidade; i++) {
      comodos.push({ ...baseComodo, comodo_relacionado: item.id, comodos_filhos: 1 });
    }
  });

  return comodos;
}

function calculateTotal(items){
  const valor = items.rooms.reduce((acc,item)=>{
    let total = (item.comodo_trechos?.valor ? item.comodo_trechos?.valor : parseFloat(formatMoney(items.trecho.valor)))
    if(items.trecho.desconto){
      total = total - items.trecho.desconto.desconto
    }
    return acc + total
  },0)

  const length = items.rooms.length;
  const taxa = length * parseInt(formatMoney(items.trecho.taxa_de_embarque))
  return {
    passagens: valor,
    taxa:taxa,
  };
}

const validateForm = () => {
  let hasError = false;
  const validateField = (field, value, errorMessage,form) => {
    if (value === null || value === undefined || value === '') {
      form.errors[field] = errorMessage;
      hasError = true;
    } else {
      delete form.errors[field];
    }
  };

  formSale.dataComodos.forEach(it=>{
    validateField('nome', it.nome, 'Por favor, insira seu nome e sobrenome.',it);
    validateField('tipo_doc', it.tipo_doc, 'Por favor, escolha um tipo de documento.',it);
    validateField('document', it.document, 'Por favor, insira número do documento.',it);
    validateField('nascimento', it.nascimento, 'Por favor, insira uma data de nascimento.',it);
    // validateField('telefone', it.telefone, 'Por favor, insira um número de telefone.',it);
  })

  validateField('contato.nome', formSale.contato.nome, 'Por favor, insira seu nome e sobrenome.',formSale);
  validateField('contato.email', formSale.contato.email, 'Por favor, insira seu email.',formSale);
  // validateField('contato.tipo_doc', formSale.contato.tipo_doc, 'Por favor, escolha um tipo de documento.',formSale);
  // validateField('contato.document', formSale.contato.document, 'Por favor, insira número do documento.',formSale);
  // validateField('contato.nascimento', formSale.contato.nascimento, 'Por favor, insira uma data de nascimento.',formSale);
  validateField('contato.telefone', formSale.contato.telefone, 'Por favor, insira um número de telefone.',formSale);

  return !hasError
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

function submitOrder(){
  formSale.contato.data_nascimento = formatDate(formSale.contato.nascimento)
  formSale.dataComodos.forEach(item => {
    item.data_nascimento = formatDate(item.nascimento)
  })


  formSale.total = formSale.total_passagems + formSale.total_taxas;

  const params = {
    pedido_id: useCartStore().order?.id,
    ...formSale,
    trecho:formSale.trecho.id,

  }

  if(formSale.dataVolta){
    formSale.dataVolta.dataComodos.forEach(item => {
      item.data_nascimento = formatDate(item.nascimento)
    })
    params.dataVolta = {...formSale.dataVolta,trecho:formSale.dataVolta.trecho.id}
  }

  focusErro()
  formSale.processing = true
  if(validateForm()){
   loadingStore.startLoading();
    routes["order"](params).then(response => {
      if(response.data.success){
        orderResponse.value = response.data.data;
        cartStore.addItem(orderResponse.value)
        cartStore.loadCart()
        formPayment.order_id = orderResponse.value.id;
        // showSuccessNotification(response.data.message);
        nextStep()
      }
      loadingStore.stopLoading();
      formSale.processing = false
      scrollBehavior()
    }).catch(error=>{
      loadingStore.stopLoading();
      formSale.processing = false
      showErrorNotification(error.response.data.data.error);
      scrollBehavior()
    })
  }
}

function addCart(){
  formSale.contato.data_nascimento = formatDate(formSale.contato.nascimento)
  formSale.dataComodos.forEach(item => {
    item.data_nascimento = formatDate(item.nascimento)
  })


  formSale.total = formSale.total_passagems + formSale.total_taxas;

  const params = {
    pedido_id: useCartStore().order?.id,
    ...formSale,
    trecho:formSale.trecho.id,

  }

  if(formSale.dataVolta){
    formSale.dataVolta.dataComodos.forEach(item => {
      item.data_nascimento = formatDate(item.nascimento)
    })
    params.dataVolta = {...formSale.dataVolta,trecho:formSale.dataVolta.trecho.id}
  }
  focusErro()
  if(validateForm()){
   loadingStore.startLoading();
    formSale.processing = true
    routes["order"](params).then(response => {
      if(response.data.success){
        orderResponse.value = response.data.data;
        cartStore.addItem(orderResponse.value)
        cartStore.loadCart()
        formPayment.order_id = orderResponse.value.id;
        showSuccessNotification(response.data.message);
        resetFormSale()
        prevStep()
        closeAllCards()
        scrollBehavior()
      }
      loadingStore.stopLoading();
      formSale.processing = false
    }).catch(error=>{
      formSale.processing = false
      loadingStore.stopLoading();
      scrollBehavior()
      showErrorNotification(error.response.data.data.error);
    })
  }
}

function checkStatusPayment() {
  routes["payment.status"](cartStore.order?.id).then(res => {
    if (res.data.success) {
      orderConfirmation.value = res.data.data;
      if (orderConfirmation.value.status === "Pago") {
        stepSale.value = 5;
        whatPayment.value = false;
        cartStore.clearCartLocal();
      } else {
        if (timeToPay.value === 0) {
          showErrorNotification('Tempo de venda expirou');
          whatPayment.value = false;
          timeToPay.value = 30 * 60;
          resetFormSale();
        } else {
          checkTimeout = setTimeout(() => checkStatusPayment(), 10000);
        }
      }
    }
  }).catch(() => {
    whatPayment.value = false;
  });
}

function submitPaymentCredit(){
  const data = {
    ...formPayment,
    order_id:cartStore.order?.id.toString(),
    credit_card:{
      ...formPayment.credit_card,
      installment_quantity: formPayment.credit_card.installment_quantity.value,
      card_number:formPayment.credit_card.card_number.replaceAll(' ','')
    }
  }
 loadingStore.startLoading();
  routes["payment.credito"](data).then(res => {
    if(res.data.success){
      orderConfirmation.value = res.data.data;
      stepSale.value = 5
      useCartStore().clearCartLocal()
      showSuccessNotification(res.data.message);

    }
    loadingStore.stopLoading();
  }).catch(error=>{
    loadingStore.stopLoading();
    showErrorNotification(error.response.data.data.error);
    stepSale.value = 3
  })
}

function submitPaymentPix(){
 loadingStore.startLoading();
  routes["payment.pix"]({order_id:useCartStore().order?.id}).then(res => {
    if(res.data.success){
      paymentPending.value = res.data.data;
      loadingStore.stopLoading();
      whatPayment.value = true
      // showSuccessNotification(res.data.message);
      nextStep()
      iniciarTemporizador()
      checkStatusPayment()
    }
  }).catch(error=>{
    loadingStore.stopLoading();
    whatPayment.value = false
    showErrorNotification(error.response.data.data.error);
  })
}

function submitFormNotification(){
  const origem = filtersData.value.municipiosOrigem.find(it=>it.slug == filtersSelected.value.origem)?.id
  const destino = filtersData.value.municipiosDestino.find(it=>it.slug == filtersSelected.value.destino)?.id
  formNotification.municipio_origem_id = origem
  formNotification.municipio_destino_id = destino
  if(formNotification.email || formNotification.telefone){
    formNotification.processing = true
    routes["notification"](formNotification).then(response => {
      if(response.data.success){
        showSuccessNotification(response.data.message)
      }
      showFormNotification.value = false
      formNotification.processing = false
    }).catch(error=>{
      showFormNotification.value = false
      formNotification.processing = false
    })
  }else{
    formNotification.errors['message'] = 'Por favor preencha pelo menos um dos comapos de contato'
  }

}
function identificarCpfOuCnpj(valor) {
  if (typeof valor !== "string") return 0;

  const numero = valor.replace(/\D/g, '');

  if (numero.length === 11) {
    return 5;
  } else if (numero.length === 14) {
    return 6;
  } else {
    return 0;
  }
}

function resetFormSale() {
  formSale.trecho = null
  formSale.viagem = null
  formSale.data_hora = null
  formSale.total_passagems = 0.0
  formSale.total_taxas = 0.0
  formSale.contato = {
    nome: authStore.user?.name ?? null,
    email: authStore.user?.email ?? null,
    telefone: authStore.user?.comprador.telefone,
    tipo_doc: authStore.user?.comprador.cpf_cnpj ? identificarCpfOuCnpj(authStore.user?.comprador.cpf_cnpj) : null,
    nascimento: authStore.user?.comprador.nascimento ?
        new Date(authStore.user?.comprador.nascimento+ 'T00:00:00') :
        null,
    document:authStore.user?.comprador.cpf_cnpj,
  };
  formSale.dataComodos = [];
  formSale.dataVolta = null;
  stepSale.value = 1
  generateNextDays()
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
function addPassegerToContact(index,type){
  let passeger = null

  formSale.dataComodos.forEach((it,idx)=>{

    if(idx != index || type=='volta'){
      it.isContact = false
    }
  })
  formSale.dataVolta?.dataComodos.forEach((it,idx)=>{
    if(idx != index || type=='ida'){
    it.isContact = false

    }
  })

  if(type == 'ida'){
    passeger = formSale.dataComodos[index]
  }else{
    passeger = formSale.dataVolta.dataComodos[index]
  }
  formSale.contato.nome = passeger.nome;
  formSale.contato.telefone = passeger.telefone;
}

function removePassegerToContact(){
  formSale.contato.nome = null;
  formSale.contato.telefone = null;
}


function adicionarDadosIdaNaVolta(){
  formSale.dataVolta?.dataComodos.forEach((it,i)=>{
    it.tipo_doc = formSale.dataComodos[i].tipo_doc;
    it.nome = formSale.dataComodos[i].nome;
    it.document = formSale.dataComodos[i].document;
    it.nascimento = formSale.dataComodos[i].nascimento;
    it.telefone = formSale.dataComodos[i].telefone;
  })
}

function removerDadosIdaDaVolta(){
  formSale.dataVolta.dataComodos.forEach((it)=>{
    it.tipo_doc = null;
    it.nome = null ;
    it.document = null ;
    it.nascimento = null ;
    it.telefone = null ;
  })
}


function showMoreticket(){
  filtersSelected.value.quantia += 5
  getTrechosWithTravels()
}

function getTicketPdf(){
  const baseUrl = getApiBaseUrl().replaceAll('api','')
  const pathToReplace = "/var/www/storage/app/public/";
  const newPathPrefix = `${baseUrl}/storage/`;

  orderConfirmation.value.passagens_agrupadas?.forEach(passage => {
    passage.passagem_pedidos.forEach(it => {
      routes["ticket.print"](it.passageiro_viagem_id).then(response => {
        if(response.data.success){
          downloadFile(
              response.data.data.replace(pathToReplace, newPathPrefix),
              it.passageiro?.nome
          );
        }
      }).catch(error => {
        showErrorNotification(error.response.data.data.error);
      })
    })
  })
}

function loadData(){
  if(stepSale.value === 1){
    updateFilters()
    generateNextDays()
    getTrechosWithTravels()
  }
}



onMounted(() => {
  getFilterItems()
  loadData()
  getEmpresas()
  window.addEventListener('resize', updateWidth);
});

onUnmounted(() => {
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }
});

watch(()=>props.tab,()=>{
  cartStore.loadCart()
  stepSale.value = tabs.find(it=>it.value == props.tab).step
})

</script>

<template>
  <v-dialog max-width="600" v-model="showFormNotification">
    <template v-slot:default="{ isActive }">
      <v-card title="Trecho indisponível">
        <v-card-text>
          Opa, parece que o trecho que está procurando ainda não está disponível, mas já estamos informando as Empresas parceiras para liberarem as viagens.
          Informe o seu Email e seu WhatsApp que iremos lhe avisar assim que estiver disponível.
        </v-card-text>
        <v-card-item>
          <v-row class="tw-px-4">
            <v-col cols="12">
              <v-text-field
                  v-model="formNotification.telefone"
                  :error-messages="formNotification.errors.telefone"
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
            <v-col cols="12">
              <v-text-field
                  variant="outlined"
                  v-model="formNotification.email"
                  :error-messages="formNotification.errors.email"
                  label="E-mail"
                  hide-details="auto"
              >
                <template v-slot:prepend-inner>
                  <Icon icon="mdi-light:email" width="26"/>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-item>

        <v-card-actions>

          <v-btn
              text="cancelar"
              @click="showFormNotification = false"
          ></v-btn>
          <v-btn
              :disabled="formNotification.processing"
              :loading="formNotification.processing"
              variant="flat"
              color="primary"
              text="confirmar"
              @click="submitFormNotification"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex lg:!tw-mb-[70px] !tw-mb-[70px] !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-4 px-5 lg:tw-text-lg">
        Passagem de <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem',filtersData)}} </strong> para <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}</strong>
      </div>
    </div>
  </v-card>
  <div class="maxWidth tw-px-3 ">
    <CardFilter
        v-model="filtersSelected"
        @update:modelValue="getTrechosWithTravels()"
        :options="filtersData"
        class=" tw-top-[-100px]  !tw-mb-[-60px] lg:tw-top-[-100px] lg:!tw-mb-[-90px] !tw-mx-5 lg:!tw-mx-0  lg:!tw-block" />
    <div class="lg:tw-flex tw-items-center !tw-my-10  tw-hidden">
      <v-btn variant="outlined" :color="stepSale > 1 ? 'success': 'secondary'" rounded @click="prevStep">
        <Icon icon="mingcute:ship-line" class="ml-2 tw-text-xl" />
        SELECIONE A SUA VIAGEM
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" :color="stepSale > 2 ? 'success' : stepSale === 2 ? 'secondary' : 'grey100'" rounded>
        <Icon icon="fluent:data-usage-edit-20-regular" class="ml-2 tw-text-xl"/>
        INFORMAR DADOS
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" :color="stepSale > 3 ? 'success' : stepSale === 3 ? 'secondary' : 'grey100'" rounded>
        <Icon icon="fluent:wallet-credit-card-20-regular" class="ml-2 tw-text-xl"/>
        FORMA DE PAGAMENTO
      </v-btn>

      <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

      <v-btn variant="outlined" :color="stepSale > 4 ? 'success' : stepSale === 4 ? 'secondary' : 'grey100'" rounded>
        <Icon icon="icon-park-outline:ticket" class="ml-2 tw-text-xl"/>
        CONFIRMAÇÃO DA VIAGEM
      </v-btn>
    </div>
    <v-tabs-window v-model="stepSale" class="mb-3">
      <v-tabs-window-item :value="1">
        <div class="tw-flex tw-justify-between tw-items-center  tw-px-3 mt-5 lg:!tw-hidden">
          <div class="tw-font-bold  ">
            Selecionar sua viagem
          </div>
          <div class="tw-flex tw-justify-between tw-text-sm tw-items-center tw-text-p/50 tw-font-semibold">
            <v-menu
                v-model="menu"
                :close-on-content-click="false"
            >
              <template v-slot:activator="{ props }">
                <v-btn flat v-bind="props">
                  Filtrar  <Icon icon="mage:filter-fill" class="ml-2 tw-text-xl tw-text-p"/>
                </v-btn>
              </template>

              <v-card min-width="300" class="mt-3">

                <v-card rounded="lg" flat class=" tw-h-full">
                  <v-container fluid>
                    <p class="tw-font-semibold tw-px-3">Horário de Saída</p>
                    <div>
                      <v-checkbox
                          v-model="filtersSelected.intervalo"
                          label="Manhã(6h - 11h59)"
                          hide-details
                          value="06:00 11:59"
                      ></v-checkbox>
                      <v-checkbox
                          v-model="filtersSelected.intervalo"
                          label="Tarde(12h - 17h59)"
                          hide-details
                          value="12:00 17:59"
                      ></v-checkbox>
                      <v-checkbox
                          v-model="filtersSelected.intervalo"
                          label="Noite(18h -23h59)"
                          hide-details
                          value="18:00 23:59"
                      ></v-checkbox>
                      <v-checkbox
                          v-model="filtersSelected.intervalo"
                          label="Madrugada(00h - 5h59)"
                          hide-details
                          value="00:00 05:59"
                      ></v-checkbox>
                    </div>

                    <p class="tw-font-semibold tw-px-3 mt-1">Tipo de Assento</p>
                    <div>
                      <v-checkbox
                          v-for="item in trechosWithTravels.data?.tiposComodidade"
                          v-model="filtersSelected.tipo_comodidade_id"
                          :label="item.nome"
                          hide-details
                          :value="item.id"
                      ></v-checkbox>
                    </div>
                    <p class="tw-font-semibold tw-px-3 mt-1">Empresas</p>
                    <div>
                      <v-autocomplete
                          flat
                          menu-icon=""
                          hide-details="auto"
                          item-value="id"
                          item-title="xfant"
                          variant="solo"
                          placeholder="Empresas"
                          class="my-select mt-1"
                          v-model="filtersSelected.empresa"
                          :items="empresas"
                      >

                      </v-autocomplete>
                    </div>
                  </v-container>
                </v-card>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                      variant="text"
                      @click="menu = false"
                  >
                    Fechar
                  </v-btn>
                  <v-btn
                      color="primary"
                      variant="text"
                      @click="getTrechosWithTravels();menu = false"
                  >
                    Buscar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </div>
        </div>
        <div class="tw-flex tw-justify-between my-3 tw-gap-10 !tw-w-full">
          <v-card width="30%" rounded="lg" flat class="xl:!tw-block !tw-hidden tw-h-full">
            <v-container fluid>
              <p class="tw-font-semibold tw-px-3">Horário de Saída</p>
              <div>
                <v-checkbox
                    v-model="filtersSelected.intervalo"
                    @update:modelValue="getTrechosWithTravels"
                    label="Manhã(6h - 11h59)"
                    hide-details
                    value="06:00 11:59"
                ></v-checkbox>
                <v-checkbox
                    v-model="filtersSelected.intervalo"
                    @update:modelValue="getTrechosWithTravels"
                    label="Tarde(12h - 17h59)"
                    hide-details
                    value="12:00 17:59"
                ></v-checkbox>
                <v-checkbox
                    v-model="filtersSelected.intervalo"
                    @update:modelValue="getTrechosWithTravels"
                    label="Noite(18h -23h59)"
                    hide-details
                    value="18:00 23:59"
                ></v-checkbox>
                <v-checkbox
                    v-model="filtersSelected.intervalo"
                    @update:modelValue="getTrechosWithTravels"
                    label="Madrugada(00h - 5h59)"
                    hide-details
                    value="00:00 05:59"
                ></v-checkbox>
              </div>

              <p class="tw-font-semibold tw-px-3 mt-1">Tipo de Assento</p>
              <div>
                <v-checkbox
                    v-for="item in trechosWithTravels.data?.tiposComodidade"
                    v-model="filtersSelected.tipo_comodidade_id"
                    :label="item.nome"
                    @update:modelValue="getTrechosWithTravels"
                    hide-details
                    :value="item.id"
                ></v-checkbox>
              </div>
              <p class="tw-font-semibold tw-px-3 mt-1">Empresas</p>
              <div>
                <v-autocomplete
                    flat
                    menu-icon=""
                    hide-details="auto"
                    item-value="id"
                    item-title="xfant"
                    variant="solo"
                    clearable
                    v-model="filtersSelected.empresa"
                    @update:modelValue="getTrechosWithTravels"
                    placeholder="Empresas"
                    class="my-select mt-1"
                    :items="empresas"
                >

                </v-autocomplete>
              </div>
            </v-container>
          </v-card>
          <div class="tw-flex tw-flex-col tw-gap-3 !tw-w-full">
            <v-card  flat  class=" mb-3 !tw-px-3 !tw-py-2  lg:!tw-block">
              <div class="tw-flex tw-gap-10 tw-items-center tw-justify-center tw-p-2 tw-text-[12px]">
                <v-btn
                    flat
                    v-for="date in nextDays"
                    :key="date.getDate()"
                    :active="filtersSelected.dataIda.getDate() === date.getDate()"
                    @click="filtersSelected.dataIda = date; getTrechosWithTravels()"
                >
                  <span class="tw-text-p tw-font-semibold tw-text-xs">{{ formatDates(date) }}</span>
                </v-btn>
              </div>
            </v-card>

            <div class="tw-w-full tw-flex tw-flex-col tw-gap-3 " v-if="trechosWithTravels.data?.trechos?.data.length > 0">
              <CardTicket
                  v-for="item in trechosWithTravels.data?.trechos?.data"
                  :key="item.id_viagem + (item.volta?.id_viagem ?? 0)"
                  :dataIda="item"
                  :dataVolta="item.volta"
                  class=" !tw-w-full !tw-h-fit "
                  @continue="saveTicket"
              ></CardTicket>
            </div>
            <div v-else class="tw-w-full tw-text-center tw-flex tw-flex-col tw-items-center">
              <Icon icon="ix:anomaly-found" width="60" class=" tw-text-xl tw-text-p"/>
              <p class="tw-text-p mt-1"> Opa, parece que o trecho que está procurando ainda não está disponível, mas já estamos informando as Empresas parceiras para liberarem as viagens.
                Informe o seu Email e seu WhatsApp que iremos lhe avisar assim que estiver disponível.
              </p>
              <v-btn @click="showFormNotification = true" variant="tonal" color="secondary" class="mt-3">Avise-me</v-btn>
            </div>

            <v-btn @click="showMoreticket" v-if="filtersSelected.quantia <= trechosWithTravels.data?.trechos.total" flat variant="plain" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
              <Icon icon="line-md:arrow-down" class="mr-2 tw-text-xl"/>
              Mostrar mais
            </v-btn>
          </div>
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item :value="2">
        <v-row   class="!tw-flex-row-reverse">
          <v-col cols="12" md="3">
            <BaseCard title="Pague no pix com desconto" v-if="formSale.trecho">
              <div class="tw-flex tw-flex-col tw-px-4 tw-py-2">
                <div class=" tw-font-bold tw-text-gray-800 ">Resumo da viagem</div>
                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>

                <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-1">IDA</div>

                <v-row  class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                  <v-col cols="6" lg="12" class="tw-flex tw-items-center  ">
                    <Icon  icon="uis:calendar" class="mr-2" width="15"/>{{formSale.trecho?.horario}}
                  </v-col>
                  <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                    <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{formatarTempoViagem(formSale.trecho.tempo_viagem)}}
                  </v-col>
                  <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                    <Icon icon="solar:map-arrow-up-bold" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem', filtersData)}}
                  </v-col>
                  <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                    <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{gerarStringTiposComodos(formSale.dataComodos.map(it=>it.tipo_comodidade))}}
                  </v-col>
                  <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                    <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}
                  </v-col>
                  <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                    <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{formSale.trecho.embarcacao}}
                  </v-col>
                </v-row>
                <div v-if="formSale.dataVolta" class="tw-flex tw-flex-col">
                  <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
                  <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-1">VOLTA</div>

                  <v-row  class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                    <v-col cols="6" lg="12" class="tw-flex tw-items-center  ">
                      <Icon  icon="uis:calendar" class="mr-2" width="15"/>{{formSale.dataVolta?.trecho.horario}}
                    </v-col>
                    <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                      <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{formatarTempoViagem(formSale.dataVolta.trecho.tempo_viagem)}}
                    </v-col>
                    <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                      <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}
                    </v-col>
                    <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                      <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{gerarStringTiposComodos(formSale.dataComodos.map(it=>it.tipo_comodidade))}}
                    </v-col>
                    <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                      <Icon icon="solar:map-arrow-up-bold" class="mr-2" width="15"/>{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem', filtersData)}}
                    </v-col>
                    <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                      <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{formSale.trecho.embarcacao}}
                    </v-col>
                  </v-row>
                </div>

                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
                <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                  <v-col cols="6" class="tw-flex tw-items-center !tw-py-2  tw-text-xs">
                    <Icon icon="icon-park-outline:ticket" class="mr-2" width="15"/>{{formSale.dataComodos.length + (formSale.dataVolta?.dataComodos.length ?? 0)}} {{formSale.dataComodos.length + (formSale.dataVolta?.dataComodos.length ?? 0) > 1 ? 'passagens' : 'passagem'}}
                  </v-col>
                  <v-col cols="6" class="tw-flex tw-items-center !tw-py-2 !tw-font-black tw-text-sm !tw-text-primary tw-justify-end">
                    {{ formatCurrency(formSale.total_passagems) }}
                  </v-col>
                  <v-col v-if="formSale.total_taxas" cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs ">
                    <Icon icon="icon-park-outline:doc-search-two" class="mr-2" width="15"/>Taxa de embarque
                  </v-col>
                  <v-col v-if="formSale.total_taxas" cols="6" class="tw-flex tw-items-center !tw-pt-0  tw-text-xs  tw-justify-end">
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
                      {{formatCurrency(calcularValor(formSale.total_passagems + formSale.total_taxas, null, 0.04 ))}} <span class="tw-whitespace-nowrap w-text-p tw-text-[10px]"> no PIX</span><br>
                      <p class="tw-text-[10px] tw-text-gray-500">ou a partir de {{formatCurrency(formSale.total_passagems + formSale.total_taxas)}} no cartão</p>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </BaseCard>
          </v-col>
          <v-col cols="12" md="9">
            <v-form ref="formRef">

              <BaseCard title="Dados de quem irá viajar (IDA)" >
                <PassegerForm v-for="(item,index) in formSale.dataComodos" :form="item" :key="index" :index="index" @add-to-contact="(index)=>addPassegerToContact(index,'ida')" @remove-to-contact="removePassegerToContact"/>
                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>

                <v-checkbox
                    v-if="filtersSelected.type == 'ida-e-volta'"
                    @update:modelValue="(arg)=>{if(arg) adicionarDadosIdaNaVolta(); else removerDadosIdaDaVolta()}"
                    hide-details="auto"
                    class="!tw-text-p tw-mt-3 !tw-text-sx"
                    label="Adcionar dados da ida na volta"
                >
                </v-checkbox>
              </BaseCard>
              <BaseCard v-if="filtersSelected.type == 'ida-e-volta'" title="Dados de quem irá viajar (VOLTA)" class="mt-3">
                <PassegerForm v-for="(item,index) in formSale.dataVolta?.dataComodos" :form="item" :key="index" :index="index" @add-to-contact="(index)=>addPassegerToContact(index,'volta')" @remove-to-contact="removePassegerToContact"/>
              </BaseCard>
              <BaseCard title="Dados para contato"  class="mt-3">
                <v-row class="tw-px-2">
                  <v-col cols="12" md="6">
                    <v-text-field
                        variant="outlined"
                        v-model="formSale.contato.nome"
                        :error-messages="formSale.errors['contato.nome']"
                        label="Nome para contato"
                        hide-details="auto"
                    >
                      <template v-slot:prepend-inner>
                        <Icon icon="stash:person-light" width="26"/>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                        variant="outlined"
                        v-model="formSale.contato.email"
                        :error-messages="formSale.errors['contato.email']"
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
                        variant="outlined"
                        v-model="formSale.contato.telefone"
                        :error-messages="formSale.errors['contato.telefone']"
                        label="Telefone"
                        v-mask="'(##) #####-####'"
                        hide-details="auto"
                    >
                      <template v-slot:prepend-inner>
                        <Icon icon="mdi-light:phone" width="26"/>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
<!--                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>-->
<!--                <v-checkbox-->
<!--                    @update:modelValue="(arg)=>{if(arg) addCompradorComoPassageiro(); else removerCompradorComoPassageiro()}"-->
<!--                    hide-details="auto"-->
<!--                    class="!tw-text-p tw-mt-3 !tw-text-sx"-->
<!--                    label="Adicionar como passageiro"-->
<!--                >-->
<!--                </v-checkbox>-->
              </BaseCard>
              <v-col cols="12">
                <v-btn variant="tonal" color="success" rounded  class="!tw-flex lg:!tw-hidden  !tw-font-extrabold px-2 tw-w-full lg:tw-w-fit"  @click="addCart">
                  <Icon icon="fa6-solid:cart-plus" width="20"  class="mr-1 "  /><span class=" !tw-text-xs  ml-1">Adicionar ao carrinho</span>
                </v-btn>
                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
              </v-col>
              <v-col cols="12"  class="tw-flex tw-justify-between mt-3">
                <v-btn variant="flat" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 "  @click="prevStep">
                  <Icon icon="mdi:navigate-before" width="20"  class="mr-1 tw-text-white"  /> <span class=" !tw-text-xs tw-text-white mr-1"  >Voltar</span>
                </v-btn>
                <v-btn variant="tonal" color="success" rounded  class="lg:!tw-flex !tw-hidden  !tw-font-extrabold px-2 tw-w-full lg:tw-w-fit"  @click="addCart">
                  <Icon icon="fa6-solid:cart-plus" width="20"  class="mr-1 "  /><span class=" !tw-text-xs  ml-1">Adicionar ao carrinho</span>
                </v-btn>
                <div class="tw-flex tw-justify-end tw-gap-3">
                  <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 "  @click="submitOrder">
                    <span class=" !tw-text-xs tw-text-white ml-1"  >Ir para o pagamento</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
                  </v-btn>
                </div>
              </v-col>
            </v-form>
          </v-col>
        </v-row>
      </v-tabs-window-item>
      <v-tabs-window-item :value="3">
        <v-row   class="!tw-flex-row-reverse">
          <v-col cols="12" md="3">
            <BaseCard title="Pague no pix com desconto">
              <div class="tw-flex tw-flex-col tw-px-4 tw-py-2">
                <div class=" tw-font-bold tw-text-gray-800 ">Resumo da compra</div>

                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
                <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                  <v-col cols="6" class="tw-flex tw-items-center !tw-py-2  tw-text-xs">
                    <Icon icon="icon-park-outline:ticket" class="mr-2" width="15"/>{{useCartStore().getTotalTravelCount()}} {{useCartStore().getTotalTravelCount() > 1 ? 'viagens' : 'viagem'}}
                  </v-col>
                  <v-col cols="6" class="tw-flex tw-items-center !tw-py-2  tw-text-xs">
                    <Icon icon="mdi:boat" class="mr-2" width="15"/>{{useCartStore().getTotalTicketCount()}} {{useCartStore().getTotalTicketCount() > 1 ? 'passagens' : 'passagem'}}
                  </v-col>
                </v-row>
                <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
                <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                  <v-col cols="6" >
                    Total  passagens
                  </v-col>
                  <v-col cols="6" >
                    +{{formatCurrency(useCartStore().getTotalTickets())}}
                  </v-col>
                  <v-col cols="6" class="pt-0" v-if="useCartStore().getTotalTaxa()" >
                    Taxa de embarque
                  </v-col>
                  <v-col cols="6" class="pt-0" v-if="useCartStore().getTotalTaxa()">
                    +{{formatCurrency(useCartStore().getTotalTaxa())}}
                  </v-col>
                  <v-col cols="6" class="tw-font-bold" >
                    Total
                  </v-col>
                  <v-col cols="6" class="tw-flex tw-items-center  !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                    <div class="tw-text-end" v-if="formPayment.payment_method_id == 3">
                      {{formatCurrency(useCartStore().getTotal() + (useCartStore().getTotal() * (formPayment.credit_card.installment_quantity.pencet ?? 0) ) )}}<br>
                    </div>
                    <div class="tw-text-end" v-else-if="formPayment.payment_method_id == 6">
                      {{formatCurrency(useCartStore().getTotal() - (useCartStore().getTotal() * 0.04 ) )}} <span class="tw-text-p tw-text-[10px]"> no PIX</span><br>
                    </div>
                    <div class="tw-text-end" v-else>
                      {{formatCurrency(useCartStore().getTotal())}}<br>
                    </div>
                  </v-col>
                </v-row>
                <v-row v-if="formPayment.payment_method_id == 3" class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                  <v-col class="py-0" cols="6" v-if="formPayment.credit_card.installment_quantity.value" >
                    {{formPayment.credit_card.installment_quantity.value}}x
                  </v-col>
                  <v-col v-if="formPayment.credit_card.installment_quantity" cols="6" class="tw-flex tw-items-center py-0  !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                    <div class="tw-text-end">
                      <div  class="tw-text-p tw-flex tw-text-[13px] "> {{ formatCurrency((useCartStore().getTotal() + (useCartStore().getTotal() * formPayment.credit_card.installment_quantity.pencet) ) / formPayment.credit_card.installment_quantity.value ) }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </BaseCard>
          </v-col>
          <v-col cols="12" md="9" >
            <BaseCard >
              <div class=" tw-font-bold tw-px-2 tw-text-gray-800 ">Minhas viagens</div>
            </BaseCard>
            <v-row class="mt-3">
              <v-col cols="12" v-for="item in useCartStore().order?.passagens_agrupadas">
                <CartItem  :data="item"/>
              </v-col>
            </v-row>
            <BaseCard class="mt-3">
              <div class=" tw-font-bold tw-px-2 tw-text-gray-800 ">Escolher como pagar sua viagem</div>
            </BaseCard>
            <BaseCard title="Desconto de 4% para pagamento via pix"  class="mt-3">
              <CardPayment title=" PIX (liberação imediata)" icon="ic:baseline-pix" value="6" v-model="formPayment.payment_method_id">
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
              <CardPayment title="Cartão de crédito" value="3" v-model="formPayment.payment_method_id">
                <template #icon>
                  <Icon icon="heroicons:credit-card-20-solid"  class="mr-2 " width="26"/>
                </template>
                <div v-if="userAuthStore().isAuthenticated()" class="tw-w-full tw-flex tw-flex-col">
                  <v-row class="mt-3" >
                    <v-col cols="12" >
                      <v-text-field variant="outlined" v-model="formPayment.credit_card.holder" label="Nome no cartão"/>
                    </v-col>
                    <v-col cols="12" >
                      <v-text-field  variant="outlined" v-model="formPayment.credit_card.card_number" v-mask="'#### #### #### ####'" label="Numero do cartão"/>
                    </v-col>
                    <v-col>
                      <v-row justify="center">
                        <v-col cols="12" md="6" >
                          <v-select
                              variant="outlined"
                              :items="months"
                              @update:modelValue="(args)=>updateFormattedDate(args, 'month')"
                              label="Mês"
                          ></v-select>
                        </v-col>
                        <v-col cols="12"  md="6" >
                          <v-select
                              variant="outlined"
                              @update:modelValue="(args)=>updateFormattedDate(args, 'year')"
                              :items="years"
                              label="Ano"
                          ></v-select>
                        </v-col>
                        <v-col cols="12"  md="6">
                          <v-select
                              variant="outlined"
                              hide-details="auto"
                              v-model="formPayment.credit_card.installment_quantity"
                              :items="pacerls"

                              item-value="value"
                              item-title="value"
                              return-object
                              label="Parcelas"
                          >
                            <template v-slot:selection="{ item, index }">
                              <div>{{item.raw.value}}x {{(formatCurrency((cart.getTotal() + (cart.getTotal() * item.raw.pencet) )/ item.raw.value )) }}</div>
                            </template>
                            <template v-slot:item="{ props, item }">

                              <v-list-item class="!tw-my-0 !tw-py-0" v-bind="props" title="" >{{item.raw.value}}x {{(formatCurrency((cart.getTotal() + (cart.getTotal() * item.raw.pencet) )/ item.raw.value )) }}</v-list-item>
                            </template>
                          </v-select>
                        </v-col>
                        <v-col cols="12"  md="6"  >
                          <v-text-field
                              variant="outlined"
                              hide-details="auto"
                              v-mask="'###'"
                              v-model="formPayment.credit_card.security_code"
                              label="CV"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2  mt-3 lg:!tw-py-5"  @click="submitPaymentCredit">
                    <Icon icon="heroicons:credit-card-20-solid"  class="mr-2 tw-text-white" width="26"/><span class=" !tw-text-xs lg:!tw-text-sm tw-text-white ml-1"  >REALIZAR PAGAMENTO</span>
                  </v-btn>
                </div>
                <div v-else class="tw-flex tw-flex-col tw-w-full">
                  <p class="tw-text-p my-3"> Para realizar pagamento com cartão de credito é nescessário realizar o login.</p>
                  <div class="tw-flex tw-gap-3">
                    <RouterLink :to="{name:'login'}">
                      <v-btn  flat color="secondary" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                        <span class="tw-text-white tw-flex"><Icon icon="solar:login-linear" class="mr-2 tw-text-xl"/>Login</span>
                      </v-btn>
                    </RouterLink>
                    <RouterLink :to="{name:'validar-email'}">
                      <v-btn  variant="tonal" color="secondary" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                        <span class="tw-flex"><Icon icon="solar:login-linear" class="mr-2 tw-text-xl"/>Criar conta</span>
                      </v-btn>
                    </RouterLink>
                  </div>


                </div>

              </CardPayment>
            </BaseCard>
            <v-btn v-if="formSale.dataComodos.length > 0" variant="flat" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 mt-3"  @click="prevStep">
              <Icon icon="mdi:navigate-before" width="20"  class="mr-1 tw-text-white"  /> <span class=" !tw-text-xs tw-text-white mr-1"  >Voltar</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-tabs-window-item>
      <v-tabs-window-item :value="4">
        <v-row  >
          <v-col cols="12" v-if="formPayment.payment_method_id == 6" >
            <BaseCard title="Confirmação da compra"  class="mt-3">
              <v-progress-linear
                  :model-value="percentToPay"
                  height="10"
                  striped
                  :active="whatPayment"
                  color="secondary"
                  absolute
                  bottom
              ></v-progress-linear>
              <div class="tw-flex mt-3 justify-end">
               <v-chip> {{ formatarTempo() }}</v-chip>
              </div>
              <div class="tw-flex tw-justify-center tw-flex-col tw-items-center">
                <p class="tw-text-p tw-text-sm">Pedido realizado com sucesso. Você receberá um e-mail de confirmação com mais detalhes</p>
                <p class="tw-text-lg tw-font-bold my-2">Realize o pagamento através do QR Code abaixo.</p>
                <VueQrcode :value="paymentPending.pix_copia_cola" :size="200" />
                <p class="tw-text-lg tw-font-bold my-2">PIX Copiar e Colar</p>
                <CopyToClipboard  :textToCopy="paymentPending.pix_copia_cola" />
              </div>
            </BaseCard>
          </v-col>
        </v-row>
      </v-tabs-window-item>
      <v-tabs-window-item :value="5">
        <v-row  >
          <v-col cols="12" v-if="formPayment.payment_method_id == 6" >
            <BaseCard title="Confirmação da compra"  class="mt-3">
              <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
                <Icon icon="icon-park-outline:ticket"  class="mr-2 tw-text-secondary !tw-text-[80px]"  />
                <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
                <p> Olá, {{orderConfirmation.contato.nome}}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
                <p><strong>Pedido {{orderConfirmation.id}}</strong></p>
                <div class="tw-flex tw-justify-center tw-items-center tw-gap-1  py-2">
                  <div class="!tw-rounded-[3px] !tw-text-[10px] tw-text-secondary tw-bg-secondary/10 tw-flex tw-p-2 tw-items-center tw-font-bold"><Icon icon="lets-icons:print" width="15"  class="mr-1 tw-text-black" />PASSAGEM IMPRESSA</div>
                  <div class="!tw-rounded-[3px] !tw-text-[10px] tw-text-secondary tw-bg-secondary/10 tw-flex tw-p-2 tw-items-center tw-font-bold"><Icon icon="tdesign:qrcode" width="15"  class="mr-1 tw-text-black" />PASSAGEM NO CELULAR</div>
                </div>
              </div>
            </BaseCard>
          </v-col>

          <v-col cols="12" v-if="formPayment.payment_method_id == 3" >
            <BaseCard title="Confirmação da compra"  class="mt-3">
              <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
                <Icon icon="icon-park-outline:ticket"  class="mr-2 tw-text-secondary !tw-text-[80px]"  />
                <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
                <p> Olá, {{authStore.user.name}}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
                <p><strong> {{orderConfirmation.description}}</strong></p>
                <p><strong> {{formatCurrency(orderConfirmation.amount)}}</strong></p>
                <p><strong> {{orderConfirmation.installments}}x  {{orderConfirmation.payment_method}}</strong></p>
              </div>
            </BaseCard>
          </v-col>

          <v-col v-if="authStore.isAuthenticated" cols="12" class="tw-flex tw-justify-center tw-items-center tw-gap-1 py-2 pb-5" >
            <RouterLink :to="{name:'area-do-cliente',params:{tab:'pedidos'}}">
              <v-btn  flat color="secondary" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                <span class="tw-text-white tw-flex"><Icon icon="material-symbols-light:order-approve" class="mr-2 tw-text-xl"/>  Ver pedidos</span>
              </v-btn>
            </RouterLink>
            <v-btn @click="getTicketPdf()" flat color="secondary" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
              <span class="tw-text-white tw-flex"><Icon icon="material-symbols-light:order-approve" class="mr-2 tw-text-xl"/> Baixar bilhete</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<style scoped>

</style>
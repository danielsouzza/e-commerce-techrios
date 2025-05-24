<script setup>

import {computed, nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import {routes} from "../../services/fetch.js";
import {Icon} from "@iconify/vue";
import {formatCurrency, formatDate, formatDateToServe, formatMoney} from "../../Helper/Ultis.js";
import BaseCard from "./BaseCard.vue";
import VueQrcode from "vue-qrcode";
import CopyToClipboard from "./CopyToClipboard.vue";
import {showErrorNotification, showSuccessNotification} from "../../event-bus.js";
import {useLoadingStore} from "../../store/states.js";
import {userAuthStore} from "../../store/AuthStore.js";
import {useCartStore} from "../../store/CartStore.js";

const props = defineProps({
  auth: Object,
  color: {
    type: String,
    default: 'green-400',

  },
})

let intervalo = null;
let checkTimeout = null;
const myOrders = ref( [])
const percentToPay = ref(0)
const orderToPay = ref(null)
const whatPayment = ref(false)
const timeToPay = ref(30 * 60)
const paymentPending = ref(null)
const showPaymentPix = ref(false)
const showPaymentCredit = ref(false)
const loadingStore = useLoadingStore();
const orderConfirmation = ref(null)
const  headers = [
  { title: 'codigo', value: 'codigo' },
  { title: 'Data da Criação', value: 'data' },
  { title: 'Valor', value: 'total' },
  { title: 'Status', value: 'status' },
]
const months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const pacerls = [
  {value:1,pencet:0.4},
  {value:2,pencet:0.06},
  {value:3,pencet:0.07},
  {value:4,pencet:0.08},
  {value:5,pencet:0.09},
  {value:6,pencet:0.10},
]
const formPayment = reactive({
  order_id:null,
  payment_method_id:6,
  credit_card:{
    holder:null,
    card_number:null,
    expiration_date:'',
    security_code:null,
    installment_quantity:{value:1,pencet:0.04},
  },
  errors:{}
})

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return  Array.from({ length: 21 }, (_, i) => `${currentYear + i}`);
})

const orders = computed(() => {
  const items = []
  myOrders.value.data?.forEach((item, index) => {
    items.push({
      codigo: item.id,
      total: formatCurrency(item.total),
      data: formatDate(item.data),
      status: item.status,
      passagens: item.passagens_agrupadas.map(passage => {
          let embarque_passado = true
          if(passage.trecho_viagem){
              const [dataParte, horaParte] = passage.trecho_viagem?.data_embarque.split(' ');
              const [dia, mes, ano] = dataParte.split('/');
              const [hora, minuto] = horaParte ? horaParte.split(':') : ['00', '00'];

              const dataEmbarque = new Date(ano, mes - 1, dia, hora, minuto);
              const agora = new Date();
              embarque_passado = dataEmbarque < agora
          }


        return {
          codigo: item.id + "-" + passage.viagem.id,
          viagem: passage.trecho.municipio_origem.nome + " - " + passage.trecho.municipio_destino.nome,
          data: passage.trecho_viagem?.data_embarque,
          status: item.status,
          embarque_passado: embarque_passado,
          detalhes: {
            boat: passage.viagem?.embarcacao,
            passageiros: passage.passagem_pedidos,
            valor: passage.passagem_pedidos.reduce((acc, item) => acc + item.valor, 0),
            taxa: passage.passagem_pedidos.reduce((acc, item) => acc + item.taxa_embarque, 0),
          }
        }
      })
    })
  })
  return items;
})

function updateFormattedDate(value,type) {
  let [month, year] = formPayment.credit_card.expiration_date.split("/");
  if (type === 'month') {
    month = value
  }else{
    year = value
  }
  formPayment.credit_card.expiration_date = `${month}/${year}`;
}

function getOrder(){
  routes['order.my']({subdomain: window.subdomain || ''}).then((res) => {
    myOrders.value = res.data.data;
  })
}

function getTicketPdf(passagem){
  const baseUrl = "http://localhost";
  const pathToReplace = "/var/www/storage/app/public/";
  const newPathPrefix = `${baseUrl}/storage/`;

  routes["ticket.print"](passagem.passageiro_viagem_id).then(response => {
    const downloadFile = async (url, filename) => {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank'; // Abre em nova aba
      link.download = filename;
      link.click()
    }
    if(response.data.success){
      downloadFile(
          response.data.data.replace(pathToReplace, newPathPrefix),
          passagem.passageiro?.nome
      );
    }
  }).catch(error => {
    console.log(error)
  })
}

const validateFormCredit = () => {
  let hasError = false;
  const validateField = (field, value, errorMessage,form) => {
    if (value === null || value === undefined || value === '') {
      form.errors[field] = errorMessage;
      hasError = true;
    } else {
      delete form.errors[field];
    }
  };


  validateField('credit_card.holder', formPayment.credit_card.holder, 'Por favor, insira seu nome que esta no cartão.',formPayment);
  validateField('credit_card.card_number', formPayment.credit_card.card_number, 'Por favor, insira o número do cartão.',formPayment);
  validateField('credit_card.expiration_date', formPayment.credit_card.expiration_date, 'Por favor, insira a data de vencimento.',formPayment);
  validateField('credit_card.installment_quantity', formPayment.credit_card.installment_quantity, 'Por favor, insira a quantidade de parcelas.',formPayment);
  validateField('credit_card.security_code', formPayment.credit_card.security_code, 'Por favor, insira um código de validação.',formPayment);

  if(formPayment.credit_card.card_number && formPayment.credit_card.card_number.length < 16){
    formPayment.errors['credit_card.card_number'] = 'O número do cartão deve ter exatamente 16 dígitos.'
  }

  return !hasError
};

function checkStatusPayment() {
  routes["payment.status"](orderToPay.value).then(res => {
    if (res.data.success) {
      orderConfirmation.value = res.data.data;
      if (orderConfirmation.value.status === "Pago") {
        whatPayment.value = false;
        getOrder()
      } else {
        if (timeToPay.value === 0) {
          showErrorNotification('Tempo de venda expirou');
          whatPayment.value = false;
          timeToPay.value = 30 * 60;
        } else {
          checkTimeout = setTimeout(() => checkStatusPayment(), 10000);
        }
      }
    }
  }).catch(() => {
    whatPayment.value = false;
  });
}

const formatarTempo = () => {
  const minutos = Math.floor(timeToPay.value / 60);
  const segundos = timeToPay.value % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
};
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

function handlePaymentCredit(item){
  orderToPay.value = item
  showPaymentCredit.value = true

}

function submitPaymentPix(order_id){
  loadingStore.startLoading();
  orderToPay.value = order_id
  routes["payment.pix"]({order_id:order_id}).then(res => {
    if(res.data.success){
      paymentPending.value = res.data.data;
      loadingStore.stopLoading();
      showPaymentPix.value = true
      whatPayment.value = true
      iniciarTemporizador()
      checkStatusPayment()
    }
  }).catch(error=>{
    loadingStore.stopLoading();
    whatPayment.value = false
    showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
  })
}

function submitPaymentCredit(){

  if(!validateFormCredit()) return

  const data = {
    ...formPayment,
    order_id:orderToPay.value.codigo.toString(),
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
      console.log(orderConfirmation)
      showSuccessNotification(res.data.message);
      getOrder()
    }
    loadingStore.stopLoading();
  }).catch(error=>{
    loadingStore.stopLoading();
    showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
  })
}

function cancelarPaymentPix(){
  showPaymentCredit.value = false
  showPaymentPix.value = false
  clearInterval(intervalo);
  clearTimeout(checkTimeout);

  timeToPay.value = 30 * 60
  percentToPay.value = 0
  nextTick(()=>{
    orderToPay.value = null
    orderConfirmation.value = null
    getOrder()
  })
}

onUnmounted(() => {
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }
});

onMounted(()=>{
  getOrder()
})


</script>

<template>
  <v-dialog max-width="800" v-model="showPaymentPix" @after-leave="cancelarPaymentPix">
    <template v-slot:default="{ isActive }">
      <BaseCard title="Confirmação da compra"  class="mt-3 rounded-lg" v-if="orderConfirmation?.status == 'Pago'">
        <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
          <Icon icon="icon-park-outline:ticket"  class="mr-2 tw-text-secondary !tw-text-[80px]"  />
          <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
          <p> Olá, {{orderConfirmation.contato.nome}}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
          <p><strong>Pedido {{orderConfirmation.id}}</strong></p>
        </div>
        <v-row>
          <v-col cols="12" class="mb-0 pb-0" >
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
          </v-col>

          <v-col class=" d-flex justify-end  my-0 py-0">
            <v-btn
                class="my-0 py-0"
                variant="text"
                @click="cancelarPaymentPix"
            >
              Fechar
            </v-btn>
          </v-col>
        </v-row>
      </BaseCard>
      <BaseCard title="Confirmação da compra"  class="mt-3" v-else>
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
        <v-row>
          <v-col cols="12" class="mb-0 pb-0" >
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
          </v-col>

          <v-col class=" d-flex justify-end  my-0 py-0">
            <v-btn
                class="my-0 py-0"
                variant="text"
                @click="cancelarPaymentPix"
            >
              Fechar
            </v-btn>
          </v-col>
        </v-row>
      </BaseCard>
    </template>
  </v-dialog>
  <v-dialog max-width="800" v-model="showPaymentCredit" @after-leave="cancelarPaymentPix">
    <template v-slot:default="{ isActive }">
      <BaseCard title="Confirmação da compra"  class="mt-3 rounded-lg" v-if="orderConfirmation != null">
        <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
          <Icon icon="icon-park-outline:ticket"  class="mr-2 tw-text-secondary !tw-text-[80px]"  />
          <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
          <p> Olá, {{userAuthStore().user.name}}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
          <p><strong> {{orderConfirmation.description}}</strong></p>
          <p><strong> {{formatCurrency(orderConfirmation.amount)}}</strong></p>
          <p><strong> {{orderConfirmation.installments}}x  {{orderConfirmation.payment_method}}</strong></p>
        </div>
        <v-row>
          <v-col cols="12" class="mb-0 pb-0" >
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
          </v-col>

          <v-col class=" d-flex justify-end  my-0 py-0">
            <v-btn
                class="my-0 py-0"
                variant="text"
                @click="cancelarPaymentPix"
            >
              Fechar
            </v-btn>
          </v-col>
        </v-row>
      </BaseCard>
      <BaseCard title="Confirmação da compra"  class="mt-3" v-else>
        <div v-if="userAuthStore().isAuthenticated()" class="tw-w-full tw-flex tw-flex-col">
          <v-row class="mt-3" >
            <v-col cols="12" >
              <v-text-field
                  variant="outlined"
                  :error-messages="formPayment.errors['credit_card.holder']"
                  v-model="formPayment.credit_card.holder"
                  label="Nome no cartão"/>
            </v-col>
            <v-col cols="12" >
              <v-text-field
                  variant="outlined"
                  :error-messages="formPayment.errors['credit_card.card_number']"
                  v-model="formPayment.credit_card.card_number"
                  v-mask="'#### #### #### ####'"
                  label="Numero do cartão"/>
            </v-col>
            <v-col>
              <v-row justify="center">
                <v-col cols="12" md="6" >
                  <v-select
                      variant="outlined"
                      :items="months"
                      :error-messages="formPayment.errors['credit_card.expiration_date']"
                      @update:modelValue="(args)=>updateFormattedDate(args, 'month')"
                      label="Mês"
                  ></v-select>
                </v-col>
                <v-col cols="12"  md="6" >
                  <v-select
                      variant="outlined"
                      :error-messages="formPayment.errors['credit_card.expiration_date']"
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
                      :error-messages="formPayment.errors['credit_card.installment_quantity']"
                      item-value="value"
                      item-title="value"
                      return-object
                      label="Parcelas"
                  >
                    <template v-slot:selection="{ item, index }">
                      <div>{{item.raw.value}}x {{(formatCurrency((formatMoney(orderToPay.total) + (formatMoney(orderToPay.total) * item.raw.pencet) )/ item.raw.value )) }}</div>
                    </template>
                    <template v-slot:item="{ props, item }">

                      <v-list-item class="!tw-my-0 !tw-py-0" v-bind="props" title="" >{{item.raw.value}}x {{(formatCurrency((formatMoney(orderToPay.total) + (formatMoney(orderToPay.total) * item.raw.pencet) )/ item.raw.value )) }}</v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12"  md="6"  >
                  <v-text-field
                      variant="outlined"
                      hide-details="auto"
                      v-mask="'###'"
                      :error-messages="formPayment.errors['credit_card.security_code']"
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
            <RouterLink :to="{ name: 'login', query: { redirect: '/comprar-passagem/pagamento' } }">
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
        <v-row>
          <v-col cols="12" class="mb-0 pb-0" >
            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
          </v-col>

          <v-col class=" d-flex justify-end  my-0 py-0">
            <v-btn
                class="my-0 py-0"
                variant="text"
                @click="cancelarPaymentPix"
            >
              Fechar
            </v-btn>
          </v-col>
        </v-row>
      </BaseCard>
    </template>
  </v-dialog>
  <v-container class=" !tw-p-0 !tw-mx-0">
    <v-card variant="flat" elevation="0" rounded="lg" color="secondary"  class="!tw-border-2 !tw-border-secondary" >

      <v-data-table
          :headers="headers"
          :items="orders"
          class="!tw-bg-transparent my-table  tw-text-white "
          item-value="codigo"
          hide-default-footer
          show-expand
      >
        <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
          <v-btn
              :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              :text="isExpanded(internalItem) ? 'Mostrar menos' : 'Mostrar mais'"
              class="text-none"
              color="medium-emphasis"
              size="small"
              variant="text"
              border
              slim
              @click="toggleExpand(internalItem)"
          ></v-btn>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <td :colspan="5">
            <div class="row sp-details pt-3">
              <v-row class="tw-px-4 tw-pt-3  tw-text-p" v-for="passage in item.passagens">
                <v-col  cols="12" lg="6" class="py-0 ">
                  <v-row >
                    <v-col cols="12" class="tw-flex tw-items-center tw-font-semibold">
                      <Icon icon="mingcute:ship-fill" width="20" class="mr-3" />{{passage.detalhes.boat?.nome}}
                    </v-col>
                    <v-col cols="12" class="tw-flex tw-items-center tw-gap-3 py-0">
                      <Icon icon="flowbite:map-pin-alt-solid" width="20"/>
                      <span class="tw-font-semibold"> {{passage.viagem}}</span>
                    </v-col>
                    <v-col cols="12" class="tw-flex tw-items-center tw-gap-3 ">
                      <Icon icon="uis:calendar" width="20"/>
                      <span class="tw-font-semibold"> {{passage.data}}</span>
                    </v-col>
                    <v-col cols="12" class="tw-flex tw-items-center tw-gap-3 py-0">
                      <Icon icon="icon-park-outline:ticket"  width="20"/>
                      <span class="tw-font-semibold">{{passage.detalhes.passageiros.length}} {{passage.detalhes.passageiros.length > 1 ? 'passagens' : 'passagem'}}</span>
                      <span class="tw-flex tw-items-center !tw-py-2 !tw-font-black tw-text-sm !tw-text-primary tw-justify-end">{{formatCurrency(passage.detalhes.valor)}}</span>
                    </v-col>
                    <v-col cols="12" class="tw-flex tw-items-center tw-gap-3 ">
                      <Icon icon="icon-park-outline:doc-search-two"  width="20"/>
                      <span class="tw-font-semibold">Taxa de serviço</span>
                      <span class="tw-flex tw-items-center !tw-py-2  tw-text-sm  tw-justify-end">{{formatCurrency(passage.detalhes.taxa)}}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col  cols="12" lg="6">
                  <div v-for="(it,i) in passage.detalhes.passageiros" class="tw-flex ">
                    <Icon icon="famicons:person-outline"  width="20"/>
                    <div class="ml-3">
                      <div class="tw-font-bold tw-flex tw-items-center tw-gap-2">Passageiro {{i+1}} <span v-if="item.status == 'Pago'" @click="getTicketPdf(it)" class="tw-flex tw-text-blue-500 tw-items-center tw-cursor-pointer">Baixar<Icon  icon="icon-park-outline:tickets-checked"  width="20" /></span></div>
                      <div>{{it.passageiro.nome}}</div>
                      <div>Doc: {{it.passageiro.ndoc}}</div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12"> <v-divider  :thickness="1" class="border-opacity-100 mt-3 " ></v-divider></v-col>
              </v-row>

              <div v-if="item.passagens?.length == 0" class=" my-5 tw-text-center ">Pedido vazio</div>

              <v-row v-if="item.status == 'Em aberto' && item.passagens?.length > 0" >
                <v-col class="d-flex justify-end mx-4 mb-3">
                  <RouterLink :to="{name:'pagamento'}">
                    <v-btn color="primary" rounded="lg" class="tw-w-full" >Ir para o pagamento</v-btn>
                  </RouterLink>
                </v-col>
              </v-row>
              <v-row v-if="item.status == 'Solicitado' && !item.passagens?.some(it=>it.embarque_passado)" class="px-4">
                <v-col cols="12" lg="6" class="d-flex justify-end  mb-3">
                    <v-btn variant="tonal" @click="submitPaymentPix(item.codigo)" color="primary" rounded="lg" class="tw-w-full" >Pagar no Pix</v-btn>
                </v-col>
                <v-col cols="12" lg="6" class="d-flex justify-end  mb-3">

                  <v-btn variant="tonal"  @click="handlePaymentCredit(item)" color="secondary" rounded="lg" class="tw-w-full" >Pagar om cartão de credito</v-btn>
                </v-col>
              </v-row>

            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.my-table::v-deep(tbody tr td) {
  background-color: #f9f9f9;
  text-wrap: nowrap !important;
}

.my-table::v-deep(.v-data-table-footer){
  color: #f9f9f9;
}

.my-table::v-deep(  thead  tr  th) {
 border-bottom: none !important;
  height:40px !important ;
}

.my-table::v-deep(tbody td ) {
  background-color: #f9f9f9;
}

.my-table::v-deep(tbody tr:nth-child(1) td:nth-child(1) ) {
  background-color: #f9f9f9;
  border-radius: 14px 0 0 0 !important;
  text-wrap: nowrap !important;
}

.my-table::v-deep(tbody tr:nth-child(1) td:nth-last-child(1) ) {
  background-color: #f9f9f9;
  border-radius: 0 14px 0 0 !important;
  text-wrap: nowrap !important;
}


.my-table::v-deep(thead) {
  color: white !important;

}
</style>

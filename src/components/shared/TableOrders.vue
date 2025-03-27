<script setup>

import {computed, onMounted, onUnmounted, ref} from "vue";
import {routes} from "../../services/fetch.js";
import {Icon} from "@iconify/vue";
import {formatCurrency, formatDate} from "../../Helper/Ultis.js";
import BaseCard from "./BaseCard.vue";
import VueQrcode from "vue-qrcode";
import CopyToClipboard from "./CopyToClipboard.vue";
import {showErrorNotification} from "../../event-bus.js";
import {useLoadingStore} from "../../store/states.js";

const props = defineProps({
  auth: Object,
  color: {
    type: String,
    default: 'green-400',

  },
})

let intervalo = null;
let checkTimeout = null;
const  myOrders = ref( [])
const percentToPay = ref(0)
const orderToPay = ref(null)
const whatPayment = ref(false)
const timeToPay = ref(30 * 60)
const paymentPending = ref(null)
const showPaymentPix = ref(false)
const loadingStore = useLoadingStore();
const orderConfirmation = ref(null)
const  headers = [
  { title: 'codigo', value: 'codigo' },
  { title: 'Data da Criação', value: 'data' },
  { title: 'Valor', value: 'total' },
  { title: 'Status', value: 'status' },
]
const orders = computed(()=>{
  const items = []
  myOrders.value.data?.forEach((item,index)=>{
    items.push({
      codigo: item.id,
      total: formatCurrency(item.total),
      data: formatDate(item.data),
      status: item.status,
      passagens:  item.passagens_agrupadas.map( passage=>{
        return {
          codigo: item.id+"-"+passage.viagem.id,
          viagem: passage.trecho.municipio_origem.nome +" - "+ passage.trecho.municipio_destino.nome,
          data:passage.viagem.saida,
          status: item.status,
          detalhes:{
            boat: passage.viagem.embarcacao,
            passageiros:passage.passagem_pedidos,
            valor:passage.passagem_pedidos.reduce((acc, item)=>acc+item.valor,0),
            taxa:passage.passagem_pedidos.reduce((acc, item)=>acc+item.taxa_embarque,0),
          }
        }
      })
    })

  })
  return items;
})

function getOrder(){
  routes['order.my']({subdomain: window.subdomain || ''}).then((res) => {
    myOrders.value = res.data.data;
    console.log(myOrders.value)
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

function checkStatusPayment() {
  routes["payment.status"](orderToPay.value).then(res => {
    if (res.data.success) {
      orderConfirmation.value = res.data.data;
      if (orderConfirmation.value.status === "Pago") {
        whatPayment.value = false;
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
    showErrorNotification(error.response.data.data.error);
  })
}

function cancelarPaymentPix(){
  clearInterval(intervalo);
  clearTimeout(checkTimeout);
  orderToPay.value = null
  showPaymentPix.value = false
  timeToPay.value = 30 * 60
  percentToPay.value = 0
  getOrder()
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
  <v-dialog max-width="800" v-model="showPaymentPix">
    <template v-slot:default="{ isActive }">
      <BaseCard title="Confirmação da compra"  class="mt-3" v-if="orderConfirmation?.status == 'Pago'">
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
                      <Icon icon="mingcute:ship-fill" width="20" class="mr-3" />{{passage.detalhes.boat.nome}}
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

              <v-row v-if="item.status == 'Em aberto'">
                <v-col class="d-flex justify-end mr-4 mb-3">
                  <RouterLink :to="{name:'sale',params:{tab:'pagamento'}}">
                    <v-btn color="primary" rounded="lg" class="tw-w-full" >Ir para o pagamento</v-btn>
                  </RouterLink>
                </v-col>
              </v-row>
              <v-row v-if="item.status == 'Solicitado'">
                <v-col class="d-flex justify-end mr-4 mb-3">
                    <v-btn  @click="submitPaymentPix(item.codigo)" color="primary" rounded="lg" class="tw-w-full" >Gerar podigo pix novamente</v-btn>
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
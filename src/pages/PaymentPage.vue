<script setup>
import { ref, onMounted, reactive, computed, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { routes } from "../services/fetch.js";
import { showErrorNotification, showSuccessNotification } from "../event-bus.js";
import VueQrcode from "vue-qrcode";
import CopyToClipboard from "../components/shared/CopyToClipboard.vue";
import BaseCard from "../components/shared/BaseCard.vue";
import CardPayment from "../components/shared/CardPayment.vue";
import { Icon } from "@iconify/vue";
import { formatCurrency, formatMoney, formatDate } from "../Helper/Ultis.js";
import { useLoadingStore } from "../store/states.js";
import { userAuthStore } from "../store/AuthStore.js";
import router from "../routes/index.js";

const route = useRoute();
const orderId = ref(route.params.id);
const order = ref(null);
const loading = ref(false);
const loadingStore = useLoadingStore();
const orderConfirmation = ref(null);
const paymentPending = ref(null);
const showQRCode = ref(false);
const timeToPay = ref(30 * 60);
const percentToPay = ref(0);
const whatPayment = ref(false);

let intervalo = null;
let checkTimeout = null;

const formPayment = reactive({
  pedido_id: null,
  payment_method_id: 6,
    is_from_site:true,
  credit_card: {
    holder: null,
    card_number: null,
    expiration_date: '',
    security_code: null,
    installment_quantity: { value: 1, pencet: 0.04 },
  },
  errors: {}
});

const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const pacerls = [
  { value: 1, pencet: 0.04 },
  { value: 2, pencet: 0.06 },
  { value: 3, pencet: 0.07 },
  { value: 4, pencet: 0.08 },
  { value: 5, pencet: 0.09 },
  { value: 6, pencet: 0.10 },
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 21 }, (_, i) => `${currentYear + i}`);
});

const orderDetails = computed(() => {
  if (!order.value) return null;

  const passagens = order.value.passagens_agrupadas.map(passage => {

    return {
      codigo: order.value.id + "-" + passage.viagem.id,
      viagem: passage.trecho.municipio_origem.nome + " - " + passage.trecho.municipio_destino.nome,
      data: passage.trecho_viagem.data_embarque,
      status: order.value.status,
      valor: order.value.total,
      detalhes: {
        boat: passage.viagem?.embarcacao,
        passageiros: passage.passagem_pedidos,
        valor: passage.passagem_pedidos.reduce((acc, item) => acc + item.valor, 0),
        taxa: passage.passagem_pedidos.reduce((acc, item) => acc + item.taxa_embarque, 0),
      }
    }
  });

  return {
      codigo: order.value.id,
      total: (order.value.total),
      total_passagens: passagens.reduce((acc, passagem) => acc + passagem.detalhes.valor, 0),
      total_taxa: passagens.reduce((acc, passagem) => acc + passagem.detalhes.taxa, 0),
      data: formatDate(order.value.data),
      status: order.value.status,
      contato: order.value.contato,
      passagens
  };
});

async function getOrderDetails() {
  try {
    loading.value = true;
    const response = await routes['order.open']({ pedido_id: orderId.value });
    order.value = response.data.data;
  } catch (error) {
    showErrorNotification('Erro ao carregar detalhes do pedido');
    router.push({name:'not-found'})
  } finally {
    loading.value = false;
  }
}

function updateFormattedDate(value, type) {
  let [month, year] = formPayment.credit_card.expiration_date.split("/");
  if (type === 'month') {
    month = value;
  } else {
    year = value;
  }
  formPayment.credit_card.expiration_date = `${month}/${year}`;
}

function checkStatusPayment() {
  routes["payment.status"](orderId.value).then(res => {
    if (res.data.success) {
      orderConfirmation.value = res.data.data;
      if (orderConfirmation.value.status === "Pago") {
        whatPayment.value = false;
        getOrderDetails();
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

function submitPaymentPix() {
  loadingStore.startLoading();
  routes["payment.pix"]({ pedido_id: orderId.value }).then(res => {
    if (res.data.success) {
      paymentPending.value = res.data.data;
      loadingStore.stopLoading();
      showQRCode.value = true;
      whatPayment.value = true;
      iniciarTemporizador();
      checkStatusPayment();
    }
  }).catch(error => {
    loadingStore.stopLoading();
    whatPayment.value = false;
    showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
  });
}

const validateFormCredit = () => {
  let hasError = false;
  const validateField = (field, value, errorMessage, form) => {
    if (value === null || value === undefined || value === '') {
      form.errors[field] = errorMessage;
      hasError = true;
    } else {
      delete form.errors[field];
    }
  };

  validateField('credit_card.holder', formPayment.credit_card.holder, 'Por favor, insira seu nome que esta no cartão.', formPayment);
  validateField('credit_card.card_number', formPayment.credit_card.card_number, 'Por favor, insira o número do cartão.', formPayment);
  validateField('credit_card.expiration_date', formPayment.credit_card.expiration_date, 'Por favor, insira a data de vencimento.', formPayment);
  validateField('credit_card.installment_quantity', formPayment.credit_card.installment_quantity, 'Por favor, insira a quantidade de parcelas.', formPayment);
  validateField('credit_card.security_code', formPayment.credit_card.security_code, 'Por favor, insira um código de validação.', formPayment);

  if (formPayment.credit_card.card_number && formPayment.credit_card.card_number.length < 16) {
    formPayment.errors['credit_card.card_number'] = 'O número do cartão deve ter exatamente 16 dígitos.';
  }

  return !hasError;
};

function submitPaymentCredit() {
  if (!validateFormCredit()) return;

  const data = {
    ...formPayment,
    pedido_id: orderId.value.toString(),
    credit_card: {
      ...formPayment.credit_card,
      installment_quantity: formPayment.credit_card.installment_quantity.value,
      card_number: formPayment.credit_card.card_number.replaceAll(' ', '')
    }
  };
  loadingStore.startLoading();
  routes["payment.credito"](data).then(res => {
    if (res.data.success) {
      orderConfirmation.value = res.data.data;
      showSuccessNotification(res.data.message);
      getOrderDetails();
    }
    loadingStore.stopLoading();
  }).catch(error => {
    loadingStore.stopLoading();
    showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
  });
}

function cancelarPayment() {
  showQRCode.value = false;
  clearInterval(intervalo);
  clearTimeout(checkTimeout);
  timeToPay.value = 30 * 60;
  percentToPay.value = 0;
  nextTick(() => {
    orderConfirmation.value = null;
      whatPayment.value = false
    getOrderDetails();
  });
}

function clearCheckTimeout() {
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }
}

onMounted(() => {
  getOrderDetails();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && whatPayment.value) {
      checkStatusPayment();
    } else {
      clearCheckTimeout();
    }
  });
});

onUnmounted(() => {
  clearCheckTimeout();
  if (intervalo) {
    clearInterval(intervalo);
  }
  document.removeEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && whatPayment.value) {
      checkStatusPayment();
    } else {
      clearCheckTimeout();
    }
  });
});
</script>

<template>
  <v-card color="primary" rounded="0" class="!tw-py-6">
    <div class="maxWidth tw-flex !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl tw-text-secondary">
        <strong class="tw-font-bold">Pagamento</strong>
      </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3">
    <v-row class="my-3">
      <v-col cols="12" lg="8">
        <!-- Confirmação de Pagamento PIX -->
        <BaseCard v-if="orderConfirmation?.status == 'Pago'" class=" rounded-lg">
          <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
            <Icon icon="icon-park-outline:ticket" class="mr-2 tw-text-secondary !tw-text-[80px]" />
            <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
            <p>Olá, {{ orderConfirmation.contato.nome }}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
            <p><strong>Pedido {{ orderConfirmation.id }}</strong></p>
          </div>
        </BaseCard>

        <!-- Confirmação de Pagamento Cartão -->
        <BaseCard v-else-if="orderConfirmation != null && formPayment.payment_method_id == 3" class=" rounded-lg">
          <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
            <Icon icon="icon-park-outline:ticket" class="mr-2 tw-text-secondary !tw-text-[80px]" />
            <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
            <p>Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
            <p><strong>{{ orderConfirmation.description }}</strong></p>
            <p><strong>{{ formatCurrency(orderConfirmation.amount) }}</strong></p>
            <p><strong>{{ orderConfirmation.installments }}x {{ orderConfirmation.payment_method }}</strong></p>
          </div>
        </BaseCard>

        <!-- Opções de Pagamento -->
        <template v-else>
          <BaseCard>
            <div class="tw-font-bold tw-px-2 tw-text-gray-800">Escolher como pagar sua viagem</div>
          </BaseCard>

          <BaseCard title="Desconto de 4% para pagamento via pix" class="mt-3">
            <CardPayment title="PIX (liberação imediata)" icon="ic:baseline-pix" value="6" v-model="formPayment.payment_method_id">
              <template #icon>
                <Icon icon="ic:baseline-pix" class="mr-2 tw-text-green-400" width="26" />
              </template>
              <div v-if="!showQRCode">
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
                  </ul>
                </div>
                <v-btn :loading="whatPayment" :disabled="whatPayment" variant="flat" color="success" rounded class="d-lg-flex !tw-font-extrabold px-2 mt-3 lg:!tw-py-5 tw-w-full" @click="submitPaymentPix">
                  <Icon icon="ic:baseline-pix" class="mr-2 tw-text-white" width="26" />
                  <span class="!tw-text-xs lg:!tw-text-sm tw-text-white ml-1">REALIZAR PAGAMENTO VIA PIX</span>
                </v-btn>
              </div>
              <div v-else class="text-center">
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
                  <v-chip>{{ formatarTempo() }}</v-chip>
                </div>
                <div class="tw-flex tw-justify-center tw-flex-col tw-items-center">
                  <p class="tw-text-p tw-text-sm">Pedido realizado com sucesso. Você receberá um e-mail de confirmação com mais detalhes</p>
                  <p class="tw-text-lg tw-font-bold my-2">Realize o pagamento através do QR Code abaixo.</p>
                  <VueQrcode :value="paymentPending.pix_copia_cola" :size="200" />
                  <p class="tw-text-lg tw-font-bold my-2">PIX Copiar e Colar</p>
                  <CopyToClipboard :textToCopy="paymentPending.pix_copia_cola" />
                </div>
                <v-btn color="secondary" variant="outlined" @click="cancelarPayment" class="mt-4">
                  Fechar
                </v-btn>
              </div>
            </CardPayment>
          </BaseCard>

          <BaseCard class="mt-3">
            <CardPayment title="Cartão de crédito" value="3" v-model="formPayment.payment_method_id">
              <template #icon>
                <Icon icon="heroicons:credit-card-20-solid" class="mr-2" width="26" />
              </template>
              <div class="tw-w-full tw-flex tw-flex-col">
                <v-row class="mt-3">
                  <v-col cols="12">
                    <v-text-field
                      variant="outlined"
                      v-model="formPayment.credit_card.holder"
                      :error-messages="formPayment.errors['credit_card.holder']"
                      label="Nome no cartão"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :error-messages="formPayment.errors['credit_card.card_number']"
                      variant="outlined"
                      v-model="formPayment.credit_card.card_number"
                      v-mask="'#### #### #### ####'"
                      label="Número do cartão"
                    />
                  </v-col>
                  <v-col>
                    <v-row justify="center">
                      <v-col cols="12" md="6">
                        <v-select
                          variant="outlined"
                          :items="months"
                          :error-messages="formPayment.errors['credit_card.expiration_date']"
                          @update:modelValue="(args) => updateFormattedDate(args, 'month')"
                          label="Mês"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          variant="outlined"
                          :error-messages="formPayment.errors['credit_card.expiration_date']"
                          @update:modelValue="(args) => updateFormattedDate(args, 'year')"
                          :items="years"
                          label="Ano"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          variant="outlined"
                          hide-details="auto"
                          :error-messages="formPayment.errors['credit_card.installment_quantity']"
                          v-model="formPayment.credit_card.installment_quantity"
                          :items="pacerls"
                          item-value="value"
                          item-title="value"
                          return-object
                          label="Parcelas"
                        >
                          <template v-slot:selection="{ item }">
                            <div>{{ item.raw.value }}x {{ formatCurrency((order?.total + (order?.total * item.raw.pencet)) / item.raw.value) }}</div>
                          </template>
                          <template v-slot:item="{ props, item }">
                            <v-list-item class="!tw-my-0 !tw-py-0" v-bind="props" title="">
                              {{ item.raw.value }}x {{ formatCurrency((order?.total + (order?.total * item.raw.pencet)) / item.raw.value) }}
                            </v-list-item>
                          </template>
                        </v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          variant="outlined"
                          hide-details="auto"
                          v-mask="'####'"
                          :error-messages="formPayment.errors['credit_card.security_code']"
                          v-model="formPayment.credit_card.security_code"
                          label="CVV"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-btn :loading="whatPayment" :disabled="whatPayment" variant="flat" color="success" rounded class="d-lg-flex !tw-font-extrabold px-2 mt-3 lg:!tw-py-5" @click="submitPaymentCredit">
                  <Icon icon="heroicons:credit-card-20-solid" class="mr-2 tw-text-white" width="26" />
                  <span class="!tw-text-xs lg:!tw-text-sm tw-text-white ml-1">REALIZAR PAGAMENTO</span>
                </v-btn>
              </div>

            </CardPayment>
          </BaseCard>
        </template>
      </v-col>

      <!-- Resumo do Pedido -->
      <v-col cols="12" lg="4">
        <BaseCard title="Pague no pix com desconto">
          <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>

          <div v-else-if="orderDetails" class="tw-flex tw-flex-col tw-px-4 tw-py-2">
            <div class="tw-font-bold tw-text-gray-800">Resumo da compra</div>

            <v-divider :thickness="1" class="border-opacity-100 my-3"></v-divider>
            <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
              <v-col cols="6" class="tw-flex tw-items-center !tw-py-2 tw-text-xs">
                <Icon icon="icon-park-outline:ticket" class="mr-2" width="15"/>{{ orderDetails.passagens.length }} {{ orderDetails.passagens.length > 1 ? 'viagens' : 'viagem' }}
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center !tw-py-2 tw-text-xs">
                <Icon icon="mdi:boat" class="mr-2" width="15"/>{{ orderDetails.passagens.reduce((acc, passagem) => acc + passagem.detalhes.passageiros.length, 0) }} {{ orderDetails.passagens.reduce((acc, passagem) => acc + passagem.detalhes.passageiros.length, 0) > 1 ? 'passagens' : 'passagem' }}
              </v-col>
            </v-row>
            <v-divider :thickness="1" class="border-opacity-100 my-3"></v-divider>
            <v-row class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
              <v-col cols="6">
                Total passagens
              </v-col>
              <v-col cols="6">
                +{{ formatCurrency(orderDetails.total_passagens)}}
              </v-col>
              <v-col cols="6" class="pt-0" v-if="orderDetails.total_taxa > 0">
                Taxa de embarque
              </v-col>
              <v-col cols="6" class="pt-0" v-if="orderDetails.total_taxa > 0">
                +{{ formatCurrency(orderDetails.total_taxa) }}
              </v-col>
              <v-col cols="6" class="tw-font-bold">
                Total
              </v-col>
              <v-col cols="6" class="tw-flex tw-items-center !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                <div class="tw-text-end" v-if="formPayment.payment_method_id == 3">
                  {{ formatCurrency(orderDetails.total + (orderDetails.total * (formPayment.credit_card.installment_quantity.pencet ?? 0))) }}<br>
                </div>
                <div class="tw-text-end" v-else-if="formPayment.payment_method_id == 6">
                  {{ formatCurrency(orderDetails.total) }} <span class="tw-text-p tw-text-[10px]"> no PIX</span><br>
                </div>
                <div class="tw-text-end" v-else>
                  {{ formatCurrency(orderDetails.total) }}<br>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="formPayment.payment_method_id == 3" class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
              <v-col class="py-0" cols="6" v-if="formPayment.credit_card.installment_quantity.value">
                {{ formPayment.credit_card.installment_quantity.value }}x
              </v-col>
              <v-col v-if="formPayment.credit_card.installment_quantity" cols="6" class="tw-flex tw-items-center py-0 !tw-font-black tw-text-[17px] !tw-text-primary tw-justify-end">
                <div class="tw-text-end">
                  <div class="tw-text-p tw-flex tw-text-[13px]">
                    {{ formatCurrency((orderDetails.total + (orderDetails.total * formPayment.credit_card.installment_quantity.pencet)) / formPayment.credit_card.installment_quantity.value) }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </BaseCard>
      </v-col>
    </v-row>
  </div>
</template>

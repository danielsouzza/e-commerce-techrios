<script setup>

import {Icon} from "@iconify/vue";
import {computed, nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import {routes} from "../../services/fetch.js";
import BaseCard from "../../components/shared/BaseCard.vue";
import {formatCurrency} from "../../Helper/Ultis.js";
import CardPayment from "../../components/shared/CardPayment.vue";
import CopyToClipboard from "../../components/shared/CopyToClipboard.vue";
import VueQrcode from "vue-qrcode";
import {useCartStore} from "../../store/CartStore.js";
import CartItem from "../../components/app/Cart/CartItem.vue";
import {userAuthStore} from "../../store/AuthStore.js";
import { showErrorNotification, showSuccessNotification} from "../../event-bus.js";
import {useLoadingStore} from "../../store/states.js";
import Steps from "../../components/app/Sale/Steps.vue";
import {restoreFormSaleFromSession, saveConfirmPaymentToSession} from "../../store/SalesSection.js";
import router from "../../routes/index.js";
const props = defineProps({
    step:String,
})

const cartStore = useCartStore()
const percentToPay = ref(0)
const timeToPay = ref(30 * 60)
const whatPayment = ref(false)
const paymentPending = ref(null)
const loadingStore = useLoadingStore();
const orderConfirmation = ref(null)
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
        nascimento:null,
        tipo_doc:null,
        document:"",
    },
    dataComodos:[],
    dataVolta:null,
    errors:{},
    processing:false
})
const years = computed(() => {
    const currentYear = new Date().getFullYear();
    return  Array.from({ length: 21 }, (_, i) => `${currentYear + i}`);
})
const months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const tabs = [
    {
        step:1,
        value:'pagamento',
        title:'Pagamento'
    },
    {
        step:2,
        value:'confirmacao',
        title:'Pagamento concluído'
    },
    {
        step:3,
        value:'confirmacao',
        title:'Pagamento concluído'
    }
]

const stepSale = ref(1)
const cart = computed(()=>{
    return cartStore
})
const pacerls = [
    {value:1,pencet:0.04},
    {value:2,pencet:0.06},
    {value:3,pencet:0.07},
    {value:4,pencet:0.08},
    {value:5,pencet:0.09},
    {value:6,pencet:0.10},
]
let intervalo = null;
let checkTimeout = null;

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


function clearCheckTimeout() {
    if (checkTimeout) {
        clearTimeout(checkTimeout);
        checkTimeout = null;
    }
}

function nextStep(){
    orderConfirmation.value.payment_method_id = formPayment.payment_method_id
    saveConfirmPaymentToSession(orderConfirmation.value)
    if(orderConfirmation.value.payment_method_id === 3){
        router.push({name:'compra-realizada-credito'})
    }else{
        router.push({name:'compra-realizada-pix'})
    }
}

function prevStep(){
    if(stepSale.value > 1) {
        stepSale.value--;
        nextTick(() => {
            clearCheckTimeout()
        });
    }else{
        router.back()
    }
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
    routes["payment.status"](cartStore.order?.id).then(res => {
        if (res.data.success) {
            orderConfirmation.value = res.data.data;
            if (orderConfirmation.value.status === "Pago") {
                nextStep()
                whatPayment.value = false;
                cartStore.clearCartLocal();
                window.dataLayer.push({
                    event: 'pagamento_pix_aprovado',
                });
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
    }).catch((error) => {
        whatPayment.value = false;
        showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
        stepSale.value = 1
    });
}
function submitPaymentCredit(){
    window.dataLayer.push({
        event: 'pagamento_credito_solicitado',
    });

    if(!validateFormCredit()) return

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
            useCartStore().clearCartLocal()
            showSuccessNotification(res.data.message);
            window.dataLayer.push({
                event: 'pagamento_credito_aprovado',
            });
            nextStep()
        }
        loadingStore.stopLoading();
    }).catch(error=>{
        loadingStore.stopLoading();
        showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
        if(error.response.data.data?.pedido){
            cartStore.addItem(error.response.data.data.pedido)
            cartStore.loadCart()
        }
    })
}

function submitPaymentPix(){

    loadingStore.startLoading();
    routes["payment.pix"]({order_id:useCartStore().order?.id}).then(res => {
        if(res.data.success){
            paymentPending.value = res.data.data;
            loadingStore.stopLoading();
            whatPayment.value = true
            stepSale.value = 2
            iniciarTemporizador()
            checkStatusPayment()

            window.dataLayer.push({
                event: 'pagamento_pix_solicitado',
            });
        }
    }).catch(error=>{
        loadingStore.stopLoading();
        whatPayment.value = false
        showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
        if(error.response.data.data?.pedido){
            cartStore.addItem(error.response.data.data.pedido)
            cartStore.loadCart()
        }
    })
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



onMounted(() => {
    useCartStore().loadCart();
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && whatPayment.value) {
            checkStatusPayment();
        } else {
            clearCheckTimeout();
        }
    });
    restoreFormSaleFromSession(formSale)
});



onUnmounted(() => {
    clearCheckTimeout()
});

window.dataLayer.push({
    event: 'em_checkout'
});

</script>

<template>
    <v-card   color="primary" rounded="0"  class="!tw-py-6">
        <div  class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
            <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">{{tabs[stepSale-1].title}}</strong> </div>
        </div>
    </v-card>
    <div class="maxWidth tw-px-3 mt-5 " id="form-content">
        <Steps :step-sale="stepSale+2"></Steps>
        <v-tabs-window v-model="stepSale" class="mb-3">
            <v-tabs-window-item :value="1">
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
                                            {{formatCurrency(useCartStore().getTotal() )}} <span class="tw-text-p tw-text-[10px]"> no PIX</span><br>
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
                                <!--                <p class="tw-text-p mt-3">Você deve informar o nome completo e o CPF/CNPJ de quem irá realizar o PIX. <strong>O QR Code será exibido após a confirmação de compra.</strong></p>-->
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
                                        <!--                    <li>Caso você tenha um programa anti pop-up, você deverá desativá-lo.</li>-->
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
                                            <v-text-field
                                                variant="outlined"
                                                v-model="formPayment.credit_card.holder"
                                                :error-messages="formPayment.errors['credit_card.holder']"
                                                label="Nome no cartão"/>
                                        </v-col>
                                        <v-col cols="12" >
                                            <v-text-field
                                                :error-messages="formPayment.errors['credit_card.card_number']"
                                                variant="outlined"
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
                                                        :error-messages="formPayment.errors['credit_card.installment_quantity']"
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
                            </CardPayment>
                        </BaseCard>
                        <v-btn v-if="formSale.dataComodos.length > 0" variant="flat" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 mt-3"  @click="prevStep">
                            <Icon icon="mdi:navigate-before" width="20"  class="mr-1 tw-text-white"  /> <span class=" !tw-text-xs tw-text-white mr-1"  >Voltar</span>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="2">
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
                        <v-btn  variant="flat" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 mt-3"  @click="prevStep">
                            <Icon icon="mdi:navigate-before" width="20"  class="mr-1 tw-text-white"  /> <span class=" !tw-text-xs tw-text-white mr-1"  >Voltar</span>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<style scoped>

</style>

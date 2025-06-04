<script setup>

import {Icon} from "@iconify/vue";
import {nextTick, onMounted, reactive, ref} from "vue";
import {routes} from "../../services/fetch.js";
import BaseCard from "../../components/shared/BaseCard.vue";
import {formatCurrency} from "../../Helper/Ultis.js";
import {userAuthStore} from "../../store/AuthStore.js";
import {getApiBaseUrl} from "../../services/api.js";
import { showErrorNotification, showSuccessNotification} from "../../event-bus.js";
import {useLoadingStore} from "../../store/states.js";
import Steps from "../../components/app/Sale/Steps.vue";
import {clearConfirmPaymentToSession, restoreConfirmPaymentToSession} from "../../store/SalesSection.js";
const props = defineProps({
    step:String,
})


const authStore = userAuthStore()
const orderConfirmation = reactive({})
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


const downloadFile = async (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // Abre em nova aba
    link.download = filename;
    link.click()
}


function reSendTickets(){
    useLoadingStore().startLoading()
    routes["order.send-passenger"](orderConfirmation.value.id).then(response => {
        useLoadingStore().stopLoading()
        showSuccessNotification(response.data.data)

    }).catch(error=>{
        showErrorNotification('Algo deu errado!')
    })
}

function getTicketPdf(){
    const baseUrl = getApiBaseUrl().replaceAll('api','')
    const pathToReplace = "/var/www/storage/app/public/";
    const newPathPrefix = `${baseUrl}/storage/`;

    let trips = {}
    if(formPayment.payment_method_id == 6){
        trips = orderConfirmation.value
    }else if(formPayment.payment_method_id == 3){
        trips = orderConfirmation.value.pedido
    }

    trips?.passagens_agrupadas?.forEach(passage => {
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

onMounted(() => {
    restoreConfirmPaymentToSession(orderConfirmation)
    nextTick(()=>{
        clearConfirmPaymentToSession()
    })

    window.dataLayer.push({
        event: 'pagina_acessada',
    });

})






</script>

<template>
    <v-card   color="primary" rounded="0"  class="!tw-py-6">
        <div  class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
            <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Compra realizada com sucesso</strong> </div>
        </div>
    </v-card>
    <div class="maxWidth tw-px-3 mt-5 " id="form-content">
        <Steps :step-sale="5"></Steps>
        <v-row  >
            <v-col cols="12" v-if="orderConfirmation.payment_method_id == 6" >
                <BaseCard title="Confirmação da compra"  class="mt-3">
                    <div class="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-center">
                        <Icon icon="icon-park-outline:ticket"  class="mr-2 tw-text-secondary !tw-text-[80px]"  />
                        <p class="tw-text-xl tw-text-secondary tw-font-bold my-2">Compra realizada com sucesso!</p>
                        <p> Olá, {{orderConfirmation.contato.nome}}! <br> Sua passagem está confirmada e foi enviada para seu email e WhatsApp</p>
                        <p><strong>Pedido {{orderConfirmation.id}}</strong></p>
                    </div>
                </BaseCard>
            </v-col>

            <v-col cols="12" v-if="orderConfirmation.payment_method_id == 3" >
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

            <v-col v-if="userAuthStore().isAuthenticated()" cols="12" class="tw-flex tw-justify-center tw-items-center tw-gap-1 py-2 pb-5" >
                <RouterLink :to="{name:'area-do-cliente',params:{tab:'pedidos'}}">
                    <v-btn  flat color="secondary" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                        <span class="tw-text-white tw-flex"><Icon icon="material-symbols-light:order-approve" class="mr-2 tw-text-xl"/>  Ver pedidos</span>
                    </v-btn>
                </RouterLink>
                <v-btn @click="getTicketPdf()" flat color="secondary" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                    <span class="tw-text-white tw-flex"><Icon icon="material-symbols-light:order-approve" class="mr-2 tw-text-xl"/> Baixar bilhete</span>
                </v-btn>
            </v-col>
            <v-col v-if="!userAuthStore().isAuthenticated()"  cols="12" class="tw-flex tw-justify-center tw-items-center tw-gap-1 py-2 pb-5" >
                <v-btn @click="reSendTickets()" flat color="info" class="tw-flex tw-items-center !tw-font-extrabold tw-text-sm" >
                    <span class="tw-text-white tw-flex"><Icon icon="material-symbols-light:order-approve" class="mr-2 tw-text-xl"/> Enviar bilhete para meu contato</span>
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>

</style>

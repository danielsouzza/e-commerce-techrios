<script setup>

import {Icon} from "@iconify/vue";
import {computed, nextTick, onMounted, reactive, ref} from "vue";
import { useRoute} from "vue-router";
import {routes} from "../../services/fetch.js";
import BaseCard from "../../components/shared/BaseCard.vue";
import {
    calcularValor,
    formatarTempoViagem,
    formatCurrency,
    formatDate,
    formatMoney,
    gerarStringTiposComodos, validarEmail,
} from "../../Helper/Ultis.js";
import PassegerForm from "../../components/app/PassegerForm.vue";
import {useCartStore} from "../../store/CartStore.js";
import router from "../../routes/index.js";
import {userAuthStore} from "../../store/AuthStore.js";
import {closeAllCards, showErrorNotification, showSuccessNotification} from "../../event-bus.js";
import {useLoadingStore} from "../../store/states.js";
import {clearFormSaleSession, restoreFormSaleFromSession, saveFormSaleToSession} from "../../store/SalesSection.js";
import Steps from "../../components/app/Sale/Steps.vue";
import CardPayment from "../../components/shared/CardPayment.vue";

const formRef = ref()
const route = useRoute();
const cartStore = useCartStore()
const authStore = userAuthStore()
const orderResponse = ref(null)
const loadingStore = useLoadingStore();
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
const filtersSelected = ref({
    origem:route.params.origem || null,
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
        nascimento:null,
        tipo_doc:null,
        document:"",
    },
    dataComodos:[],
    dataVolta:null,
    errors:{},
    processing:false
})
const acceptPrivacy = ref(false)
const expandAttention = ref(true)

// Modal para menores de 16 anos
const showMinorModal = ref(false)

// Texto do aviso para menores de 16 anos
const minorWarningText = `
<strong>ATENÇÃO</strong><br>
Crianças ou adolescentes menores de 16 anos não podem viajar sozinhos ou acompanhados sem autorização autenticada em cartório.<br>
A ausência deste documento impedirá o embarque e, consequentemente, a realização da viagem.
`;

function checkMinorAge(date) {
    if (!date) return;
    const nascimento = new Date(date)
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    if (idade < 16) {
        showMinorModal.value = true;
    }
}


function scrollToStartDiv(){
    const minhaDiv = document.getElementById("form-content");
    minhaDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}



function nextStep(){
    useCartStore().loadCart().then(()=>{
        if(!useCartStore().isEmptyCart()){
            saveFormSaleToSession(formSale)
            router.push({name: 'pagamento'});
        }
    })

}

function prevStep(){
    saveFormSaleToSession(formSale)
    router.back()
}

function removerPasseger(index,type){
    if(type == 'ida'){
        const item =  formSale.dataComodos[index]
        const comodo_pivot_index = formSale.dataComodos.findIndex(it=>it.comodo == item.comodo_relacionado)
        if(comodo_pivot_index > -1){
            formSale.dataComodos[comodo_pivot_index].qtd_comodos_filhos--
        }
        formSale.dataComodos.splice(index,1)
    }else{
        const item =  formSale.dataVolta.dataComodos[index]
        const comodo_pivot_index = formSale.dataVolta.dataComodos.findIndex(it=>it.comodo == item.comodo_relacionado)
        if(comodo_pivot_index > -1){
            formSale.dataVolta.dataComodos[comodo_pivot_index].qtd_comodos_filhos--
        }
        formSale.dataVolta?.dataComodos.splice(index,1)
    }

    calculateTaxa()

}

function removerMeToPassenger(index,type){
    formSale.dataComodos[0].nome = ''
    formSale.dataComodos[0].document = ''
    formSale.dataComodos[0].tipo_doc = ''
    formSale.dataComodos[0].telefone = ''
    formSale.dataComodos[0].nascimento = null
}

function addMeToPassenger(index,type){
    formSale.dataComodos[0].nome = userAuthStore().user.name
    formSale.dataComodos[0].document = userAuthStore().user.comprador.cpf_cnpj
    formSale.dataComodos[0].tipo_doc = identificarCpfOuCnpj(userAuthStore().user.comprador.cpf_cnpj)
    formSale.dataComodos[0].telefone = userAuthStore().user.comprador.telefone
    formSale.dataComodos[0].nascimento =  userAuthStore().user.comprador.nascimento ? new Date( userAuthStore().user.comprador.nascimento+'T00:00:00') : null
}

function addComodoRelated(index,type){
    if(type == 'ida'){
        const item =  formSale.dataComodos[index]
        formSale.dataComodos[index].qtd_comodos_filhos++
        formSale.dataComodos.push({...item, comodo_relacionado: item.comodo, comodos_filhos: 1 })

    }else{
        const item =  formSale.dataVolta.dataComodos[index]
        formSale.dataVolta.dataComodos[index].qtd_comodos_filhos++
        formSale.dataVolta?.dataComodos.push({...item, comodo_relacionado: item.comodo, comodos_filhos: 1,qtd_comodos_filhos: 1, })
    }
    calculateTaxa()
}

function calculateTaxa(){
    formSale.total_taxas = formSale.dataComodos.reduce((i,j)=>i + j.embarque, 0)
    if(filtersSelected.value.type == 'ida-e-volta'){
        formSale.total_taxas += formSale.dataVolta.dataComodos.reduce((i,j)=>i + j.embarque, 0)
    }
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
    })

    validateField('contato.nome', formSale.contato.nome, 'Por favor, insira seu nome e sobrenome.',formSale);
    validateField('contato.email', formSale.contato.email, 'Por favor, insira seu email.',formSale);
    if(formSale.contato.email){
        if(!validarEmail(formSale.contato.email)){
            formSale.errors['contato.email'] = 'Email invalido'
            hasError = true;
        }
    }
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
                window.dataLayer.push({
                    event: 'adicionado_ao_carrinho'
                });
                formPayment.order_id = orderResponse.value.id;
                nextStep()
            }
            loadingStore.stopLoading();
            formSale.processing = false
            scrollToStartDiv()
        }).catch(error=>{
            loadingStore.stopLoading();
            formSale.processing = false
            showErrorNotification(error.response.data.data?.error ?? error.response.data.details ?? error.response.data?.message );
            scrollToStartDiv()
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
                window.dataLayer.push({
                    event: 'adicionado_ao_carrinho'
                });
                showSuccessNotification('Viagem adicionado ao carrinho');
                scrollToStartDiv()
            }
            loadingStore.stopLoading();
            formSale.processing = false
            router.push({name:'home'})
        }).catch(error=>{
            console.log(error)
            formSale.processing = false
            loadingStore.stopLoading();
            scrollToStartDiv()
            showErrorNotification(error.response?.data?.data?.details ?? error.response?.data?.data?.error ?? error.response?.data?.message);
        })
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

onMounted(() => {
    authStore.loadUser()
    if(authStore.isAuthenticated()){
        authStore.getUser().then(()=>{
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
        })
    }

    nextTick(()=>{
        restoreFormSaleFromSession(formSale)
    })

    window.dataLayer.push({
        event: 'informar_dados',
    });

});



</script>

<template>
    <v-card   color="primary" rounded="0"  class="!tw-py-6">
        <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
            <div  class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Informa dados</strong> </div>
        </div>
    </v-card>
    <div class="maxWidth tw-px-3 mt-5" id="form-content" >
        <Steps :step-sale="2"></Steps>
        <v-row   class="!tw-flex-row-reverse">
            <v-col cols="12" md="3">
                <BaseCard title="Pague no pix com desconto" v-if="formSale.trecho">
                    <div class="tw-flex tw-flex-col tw-px-4 tw-py-2">
                        <div class=" tw-font-bold tw-text-gray-800 ">Resumo da viagem</div>
                        <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>

                        <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-2">IDA</div>

                        <v-row  class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                            <v-col cols="6" lg="12" class="tw-flex tw-items-center  ">
                                <Icon  icon="uis:calendar" class="mr-2" width="15"/>{{formSale.trecho?.horario}}
                            </v-col>
                            <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{formatarTempoViagem(formSale.trecho.tempo_viagem)}}
                            </v-col>
                            <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{ formSale.trecho.municipio_origem.nome+'/'+formSale.trecho.municipio_origem.uf }} -> {{ formSale.trecho.municipio_origem.nome+'/'+formSale.trecho.municipio_origem.uf }}
                            </v-col>
                            <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{gerarStringTiposComodos(formSale.dataComodos.map(it=>it.tipo_comodidade))}}
                            </v-col>

                            <v-col  cols="12" class="tw-flex tw-items-center  ">
                                <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{formSale.trecho.embarcacao}}
                            </v-col>
                        </v-row>
                        <div v-if="formSale.dataVolta" class="tw-flex tw-flex-col">
                            <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
                            <div class=" tw-font-bold tw-text-gray-800 tw-text-xs mb-2">VOLTA</div>

                            <v-row  class="!tw-text-gray-500 tw-font-semibold tw-text-xs">
                                <v-col cols="6" lg="12" class="tw-flex tw-items-center  ">
                                    <Icon  icon="uis:calendar" class="mr-2" width="15"/>{{formSale.dataVolta?.trecho.horario}}
                                </v-col>
                                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                    <Icon icon="iconamoon:clock-fill" class="mr-2" width="15"/>{{formatarTempoViagem(formSale.dataVolta.trecho.tempo_viagem)}}
                                </v-col>
                                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                    <Icon icon="flowbite:map-pin-alt-solid" class="mr-2" width="15"/>{{ formSale.dataVolta.trecho.municipio_origem.nome+'/'+formSale.dataVolta.trecho.municipio_origem.uf }} -> {{ formSale.dataVolta.trecho.municipio_origem.nome+'/'+formSale.dataVolta.trecho.municipio_origem.uf }}
                                </v-col>
                                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                    <Icon icon="solar:armchair-bold" class="mr-2" width="15"/>{{gerarStringTiposComodos(formSale.dataComodos.map(it=>it.tipo_comodidade))}}
                                </v-col>
                                <v-col  cols="6" lg="12" class="tw-flex tw-items-center  ">
                                    <Icon icon="mingcute:ship-fill" width="15" class="mr-2" />{{formSale.dataVolta.trecho.embarcacao}}
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
                                    {{formatCurrency(calcularValor(formSale.total_passagems + formSale.total_taxas, null ))}} <span class="tw-whitespace-nowrap w-text-p tw-text-[10px]"> no PIX</span><br>
                                    <p class="tw-text-[10px] tw-text-gray-500">ou a partir de {{formatCurrency(calcularValor(formSale.total_passagems + formSale.total_taxas, null, -0.04))}} no cartão</p>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </BaseCard>
            </v-col>
            <v-col cols="12" md="9">
                <v-form ref="formRef">
                    <BaseCard title="Dados de quem irá viajar (IDA)" >
                        <PassegerForm
                            v-for="(item,index) in formSale.dataComodos"
                            :form="item"
                            :key="index"
                            :index="index"
                            type="ida"
                            @remover="(args)=>removerPasseger(index,'ida')"
                            @remove-me-to-passenger="(args)=>removerMeToPassenger(index,'ida')"
                            @add-me-to-passenger="(args)=>addMeToPassenger(index,'ida')"
                            @addComodoRelated="(args)=>addComodoRelated(index,'ida')"
                            @add-to-contact="(index)=>addPassegerToContact(index,'ida')"
                            @remove-to-contact="removePassegerToContact"
                            @check-minor-age="(date)=>checkMinorAge(date)"/>
                        <v-divider  :thickness="1" class="border-opacity-100 my-3  "  v-if="formSale.dataVolta" ></v-divider>

                        <v-checkbox
                            v-if="formSale.dataVolta"
                            @update:modelValue="(arg)=>{if(arg) adicionarDadosIdaNaVolta(); else removerDadosIdaDaVolta()}"
                            hide-details="auto"
                            class="!tw-text-p tw-mt-3 !tw-text-sx"
                            label="Adcionar dados da ida na volta"
                        >
                        </v-checkbox>
                    </BaseCard>
                    <BaseCard v-if="formSale.dataVolta" title="Dados de quem irá viajar (VOLTA)" class="mt-3">
                        <PassegerForm
                            v-for="(item,index) in formSale.dataVolta?.dataComodos"
                            :form="item" :key="index" :index="index"
                            type="volta"
                            @remover="(args)=>removerPasseger(index,'volta')"
                            @addComodoRelated="(args)=>addComodoRelated(index,'volta')"
                            @add-to-contact="(index)=>addPassegerToContact(index,'volta')"
                            @remove-to-contact="removePassegerToContact"/>
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
                    </BaseCard>
                    <v-container class="!tw-p-0 !tw-mx-0 !tw-bg-white !tw-max-w-full mt-3" rounded="lg">
                        <v-card  variant="outlined" elevation="0" rounded="lg" class="!tw-bg-[#FFF3CD] !tw-border-[#F8EBC6]">
                            <v-card class="px-3 pt-3 pb-2 !tw-bg-transparent !tw-h-full" variant="flat" elevation="0" rounded="lg">
                                <div class="tw-flex tw-items-center tw-mb-2">
                                    <Icon icon="mdi:alert-circle-outline" class="mr-2 tw-text-[#9F8D61]" width="26"/>
                                    <span class="tw-font-bold tw-text-[#9F8D61] tw-text-base">Leia com atenção</span>
                                </div>
                                <v-divider :thickness="1" class="border-opacity-100 my-3" />
                                <span class="tw-text-[#9F8D61] tw-text-justify">
                                    Todos os passageiros devem apresentar documento oficial com foto durante o embarque, salvo aqueles que apresentarem boletim de ocorrência de extravio ou criança até 5 anos que tiverem somente a certidão de nascimento. A ausência deste documento impedirá o embarque e, consequentemente, a realização da viagem.<br><br>
                                    Crianças ou adolescentes menores de 16 anos não podem viajar sozinhos ou acompanhados sem autorização autenticada em cartório.<br>
                                    A ausência deste documento impedirá o embarque e, consequentemente, a realização da viagem.
                                </span>
                            </v-card>
                        </v-card>
                    </v-container>

                    
                    <BaseCard class="tw-mt-3">
                        <v-row>
                            <v-col cols="12" class="tw-flex tw-items-center tw-mb-2">
                                <v-switch
                                    v-model="acceptPrivacy"
                                    :rules="[v => !!v || 'É necessário aceitar os termos de privacidade para continuar.']"
                                    hide-details="auto"
                                    class="!tw-text-xs !tw-mb-0"
                                    density="compact"
                                    color="success"
                                    inset
                                >
                                    <template #label>
                                    Li e aceito os &nbsp;<a href='/politica-de-privacidade' target='_blank' rel='noopener noreferrer' class='tw-text-primary tw-underline'> termos de uso e política de privacidade</a>.
                                    </template>
                                </v-switch>
                            </v-col>
                        </v-row>
                    </BaseCard>
                    
                    <v-col cols="12">
                        <v-btn variant="tonal" color="secondary" rounded  class="!tw-flex lg:!tw-hidden  !tw-font-extrabold px-2 tw-w-full lg:tw-w-fit"  @click="addCart">
                            <Icon icon="fa6-solid:cart-plus" width="20"  class="mr-1 "  /><span class=" !tw-text-xs  ml-1">Adicionar ao carrinho</span>
                        </v-btn>
                        <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
                    </v-col>
                    <v-col cols="12"  class="tw-flex tw-justify-between mt-3">
                        <v-btn variant="outlined" color="secondary" rounded  class="d-lg-flex  !tw-font-extrabold px-2 "  @click="prevStep">
                            <Icon icon="mdi:navigate-before" width="20"  class="mr-1 "  /> <span class=" !tw-text-xs  mr-1"  >Voltar</span>
                        </v-btn>

                        <div class="tw-flex tw-justify-end tw-gap-3 tw-items-center">
                            <v-btn variant="tonal" color="secondary" rounded  class="lg:!tw-flex !tw-hidden  !tw-font-extrabold px-2 tw-w-full lg:tw-w-fit"  @click="addCart">
                                <Icon icon="fa6-solid:cart-plus" width="20"  class="mr-1 "  /><span class=" !tw-text-xs  ml-1">Adicionar ao carrinho</span>
                            </v-btn>
                            <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 "  @click="submitOrder" :disabled="!acceptPrivacy">
                                <span class=" !tw-text-xs tw-text-white ml-1"  >Ir para o pagamento</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
                            </v-btn>
                        </div>
                    </v-col>
                   
                </v-form>
            </v-col>
        </v-row>
    </div>

    <v-dialog v-model="showMinorModal" persistent max-width="420" transition="dialog-bottom-transition">
      <v-card class="!tw-pt-8 !tw-pb-4 !tw-px-8 tw-rounded-xl tw-shadow-lg tw-border tw-border-gray-200">
        <div class="tw-text-gray-700 tw-mb-6 tw-text-base tw-text-justify" v-html="minorWarningText"></div>
        <div class="tw-flex tw-justify-end tw-gap-2">
          <v-btn color="primary" variant="flat" class="tw-font-bold tw-px-6 tw-py-2 tw-text-base" @click="showMinorModal = false">ENTENDI</v-btn>
        </div>
      </v-card>
    </v-dialog>
</template>

<style scoped>

</style>

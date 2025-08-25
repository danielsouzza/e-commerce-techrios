<script setup>

import {Icon} from "@iconify/vue";
import {computed, nextTick, onMounted, reactive, ref} from "vue";
import { useRoute} from "vue-router";
import {routes} from "../../services/fetch.js";
import CardTicket from "../../components/shared/CardTicket.vue";
import CardFilter from "../../components/shared/CardFilter.vue";
import {
    formatarHora,
    formatDate, formatDateToServe,
    formatMoney,
    getMonicipioLabel,
} from "../../Helper/Ultis.js";
import router from "../../routes/index.js";
import {userAuthStore} from "../../store/AuthStore.js";
import { getAppBaseUrl} from "../../services/api.js";
import {showErrorNotification, showInfoNotification, showSuccessNotification} from "../../event-bus.js";
import {useLoadingStore} from "../../store/states.js";
import {clearFormSaleSession, saveFormSaleToSession} from "../../store/SalesSection.js";
import Steps from "../../components/app/Sale/Steps.vue";

const route = useRoute();
const menu = ref(false)
const empresas = ref([])
const filtersData = ref([])
const authStore = userAuthStore()
const nextTravel = ref({
    ida:null,
    volta:null
})
const stepChooseTrip = ref(1)
const loadingStore = useLoadingStore();
const trechosWithTravels = ref({
    trechosIda:null,
    trechosVolta:null
})
const windowWidth = ref(window.innerWidth);
const loadingTrecho = ref(false)
const tripsSelecteds = ref({
    dataIda:null,
    dataVolta:null
})
const showFormNotification = ref(false)
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
const formNotification = reactive({
    email: authStore.user?.email ?? null,
    telefone: authStore.user?.comprador.telefone ?? null,
    url:getAppBaseUrl(),
    municipio_origem_id:null,
    municipio_destino_id:null,
    errors:{},
    processing:false
})
const nextDaysIda = ref([])
const nextDaysVolta = ref([])
const isLargeScreen = computed(()=> windowWidth.value >= 1024)
const updateWidth = () => {
    windowWidth.value = window.innerWidth;
    generateNextDays()
    if(filtersSelected.value.type == 'ida-e-volta'){
        generateNextDays('volta')
    }
};

const updateFilters = () => {
    filtersSelected.value.origem = route.params.origem || null;
    filtersSelected.value.destino = route.params.destino || null;
    filtersSelected.value.type = route.params.type;

    filtersSelected.value.dataIda = route.params.dataIda
        ? new Date(route.params.dataIda + 'T00:00:00')
        : new Date();

    filtersSelected.value.dataVolta = route.params.dataVolta
        ? new Date(route.params.dataVolta + 'T00:00:00')
        : null;

    generateNextDays();
    if (filtersSelected.value.type === 'ida-e-volta') {
        generateNextDays('volta');
    }
};

function generateNextDays( type='ida') {
    let dateCurrent = filtersSelected.value.dataIda
    if(type == 'volta'){
        dateCurrent = filtersSelected.value.dataVolta
    }

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
        if(type == 'ida'){
            if (pastDate < hoje) {
                start++;
            } else {
                break;
            }
        }else{
            if (pastDate < filtersSelected.value.dataIda) {
                start++;
            } else {
                break;
            }
        }

    }

    for (let i = start; i < end; i++) {
        let futureDate = new Date(date);
        futureDate.setDate(date.getDate() + i);

        if(type == 'ida'){
            if (filtersSelected.value.dataVolta && futureDate > filtersSelected.value.dataVolta) {
                break;
            }
        }

        futureDates.push(futureDate);
    }

    if(type == 'ida'){
        nextDaysIda.value = futureDates;
    }else{
        nextDaysVolta.value = futureDates
    }
}

function prevToBack(){
    stepChooseTrip.value = 1
    resetFormSale('volta')
}

async function getTrechos(nextTrip=false, type='ida'){
    nextTravel.value = {
        ida:null,
        volta:null
    }
    loadingTrecho.value = true
    const params = new URLSearchParams()

    if(type == 'ida'){
        params.append('origem', filtersSelected.value.origem || '')
        params.append('destino', filtersSelected.value.destino || '')
        params.append('data_hora', formatDate(filtersSelected.value.dataIda) || '')
    }else{
        params.append('origem', filtersSelected.value.destino || '')
        params.append('destino', filtersSelected.value.origem || '')
        params.append('data_hora', formatDate(filtersSelected.value.dataVolta) || '')
    }

    params.append('intervalo', filtersSelected.value.intervalo || '')
    params.append('tipo_comodidade_id', filtersSelected.value.tipo_comodidade_id || '')
    params.append('quantia', nextTrip ? 1 : filtersSelected.value.quantia || '')
    params.append('empresa', filtersSelected.value.empresa || '')

    if(stepChooseTrip.value == 1 && type == 'volta' || nextTrip){
        params.append('intervalo', '')
        params.append('tipo_comodidade_id',  '')
        params.append('quantia', nextTrip ? 1 :  '')
        params.append('empresa', filtersSelected.value.empresa || '')
    }

    params.append('subdomain', window.subdomain || '')
    if(nextTrip) params.append('data_irrestrita', 1)

    routes["trechos-viagem"](params).then(response => {
        if(nextTrip){
            if(response.data.data.trechos.data.length > 0){
                if(type == 'ida'){
                    nextTravel.value.ida = response.data.data.trechos.data[0]
                    if(filtersSelected.value.type == 'ida-e-volta'){
                        const dateNext = new Date(nextTravel.value.ida.data_embarque)
                        const dateBack = new Date(filtersSelected.value.dataVolta)
                        if(dateNext > dateBack){
                            showInfoNotification(`Não foi encontrado viagem dentro das datas escolhidas, mas foi encontrado uma viagem na data ${formatDate(dateNext)}, no entanto é superior a data da volta`);
                            nextTravel.value.ida = null
                        }
                    }
                }else{
                    nextTravel.value.volta = response.data.data.trechos.data[0]
                }
            }else{
                if(filtersSelected.value.type == "ida-e-volta"  && type == 'volta'){
                    showInfoNotification('Infelizmente não temos viagem de volta para o trecho escolhidos, mas temos viagem somente de ida');
                    filtersSelected.value.type = 'somente-ida'
                    filtersSelected.value.dataVolta = null
                }
            }
        }else {
            let date = filtersSelected.value.dataIda.getDate()
            let first = nextDaysIda.value[0].getDate()
            let last = nextDaysIda.value[nextDaysIda.value.length - 1].getDate()
            if(type == 'ida'){
                trechosWithTravels.value.trechosIda = response.data
                if(filtersSelected.value.type == 'ida-e-volta'){
                    getTrechos(false,'volta')
                }
            }else{
                trechosWithTravels.value.trechosVolta = response.data
                date = filtersSelected.value.dataVolta.getDate()
                first = nextDaysVolta.value[0].getDate()
                last = nextDaysVolta.value[nextDaysVolta.value.length - 1].getDate()
            }

            if(date === first || date === last){
                generateNextDays(type);
            }

            updateUrlPage()

        }

        nextTick(()=>{
            loadingStore.stopLoading();
            if(response.data.data.trechos.data.length == 0 && !nextTrip){
                getTrechos(nextTrip=true,type)
            }else{
                loadingTrecho.value = false
            }
        })


    }).catch(error => {
        console.log(error)
        nextTick(()=>{
            loadingStore.stopLoading();
            loadingTrecho.value = false
        })

        if(!nextTrip){
            if(error.response.data.data?.error || error.response.data?.message ){
                showErrorNotification(error.response.data.data?.error ?? error.response.data?.message);
            }
        }
    })
}

function updateUrlPage() {
    const baseParams = {
        origem: filtersSelected.value.origem,
        destino: filtersSelected.value.destino,
        dataIda: formatDateToServe(filtersSelected.value.dataIda),
        type: filtersSelected.value.type,
    };

    let path = `/escolher-passagem/${baseParams.origem}/${baseParams.destino}/${baseParams.type}/${baseParams.dataIda}`;

    if (baseParams.type === 'ida-e-volta') {
        const dataVolta = formatDateToServe(filtersSelected.value.dataVolta);
        path += `/${dataVolta}`;
    }

// Atualiza a URL manualmente sem recarregar a página ou disparar navegação
    history.pushState({
        ...baseParams,
        path
    }, '', path);

}


function goToNextTrip(type='ida'){
    if(type == 'ida'){
        filtersSelected.value.dataIda = new Date(nextTravel.value.ida.data_embarque)
        nextTravel.value.ida = null
    }else{
        filtersSelected.value.dataVolta = new Date(nextTravel.value.volta.data_embarque)
        nextTravel.value.volta = null
    }
    getTrechos(false,type)
}

function scrollToStartDiv(){
    const minhaDiv = document.getElementById("form-content");
    minhaDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getTrechosWithTravels(type='ida') {
    resetFormSale(type)
    getTrechos(false,type)
}

async function getEmpresas(){
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
    saveFormSaleToSession(formSale)
    router.push({name: 'informa-dados'});

}

function clearFilterSide(){
    filtersSelected.value.quantia = 8
    filtersSelected.value.intervalo = null
    filtersSelected.value.tipo_comodidade_id = null
    filtersSelected.value.empresa = null
}

function saveTrips(item){
    if(stepChooseTrip.value === 1){
        tripsSelecteds.value.dataIda = item.dataIda
        if(filtersSelected.value.type == 'somente-ida'){
            saveTicket()
        }else{
            clearFilterSide()
            stepChooseTrip.value = 2
        }
    }else{
        tripsSelecteds.value.dataVolta = item.dataIda
        saveTicket()
    }
    nextTick(()=>{
        scrollToStartDiv()
    })
}

function saveTicket() {
    const totalIda = calculateTotal(tripsSelecteds.value.dataIda);

    Object.assign(formSale, {
        total_passagems: totalIda.passagens,
        total_taxas: 0,
        trecho: tripsSelecteds.value.dataIda.trecho,
        viagem: tripsSelecteds.value.dataIda.trecho.id_viagem,
        data_hora: tripsSelecteds.value.dataIda.trecho.data_embarque,
        dataComodos: populateComodos(tripsSelecteds.value.dataIda.rooms, tripsSelecteds.value.dataIda.trecho)
    });

    formSale.total_taxas = formSale.dataComodos.length * parseInt(formatMoney(tripsSelecteds.value.dataIda.trecho.taxa_de_embarque))
    if (filtersSelected.value.type === "ida-e-volta") {
        const totalVolta = calculateTotal(tripsSelecteds.value.dataVolta);
        formSale.total_passagems += totalVolta.passagens;

        formSale.dataVolta = {
            trecho: tripsSelecteds.value.dataVolta.trecho,
            viagem: tripsSelecteds.value.dataVolta.trecho.id_viagem,
            dataComodos: populateComodos(tripsSelecteds.value.dataVolta.rooms, tripsSelecteds.value.dataVolta.trecho)
        };
        formSale.total_taxas += formSale.dataVolta.dataComodos.length * parseInt(formatMoney(tripsSelecteds.value.dataVolta.trecho.taxa_de_embarque));
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

        comodos.push({ ...baseComodo, comodo_relacionado: null, comodos_filhos: item.quantidade, qtd_comodos_filhos: item.quantidade,});

        for (let i = 1; i < item.quantidade; i++) {
            comodos.push({ ...baseComodo, comodo_relacionado: item.id, comodos_filhos: 1,qtd_comodos_filhos: 1, });
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

function resetFormSale(type='ida') {
    if(type == 'ida'){
        formSale.trecho = null
        formSale.viagem = null
        formSale.data_hora = null
        formSale.total_passagems = 0.0
        formSale.total_taxas = 0.0

        formSale.dataComodos = [];
        formSale.dataVolta = null;
        generateNextDays()

    }else{
        formSale.dataVolta = null;
    }

    if(filtersSelected.value.type == 'ida-e-volta'){
        generateNextDays('volta')
    }

    clearFormSaleSession()
}

function showMoreticket(){
    filtersSelected.value.quantia += 5
    getTrechosWithTravels()
}

function loadData(){
    updateFilters()
    generateNextDays()
    if(filtersSelected.value.type == 'ida-e-volta'){
        generateNextDays('volta')
    }
    getTrechosWithTravels('ida')
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
    if(stepChooseTrip.value == 1){
        loadData()
        getEmpresas()
    }
    window.addEventListener('resize', updateWidth);
    window.dataLayer.push({
        event: 'escolher_viagem'});

});

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
    <v-card   color="primary" rounded="0"  class="!tw-py-6">
        <div  class=" lg:!tw-mb-[70px] !tw-mb-[70px] maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
            <div class="text-center lg:tw-text-start tw-py-4 px-5 lg:tw-text-lg">
                Passagem de <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem',filtersData)}} </strong> para <strong class="tw-font-bold">{{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}}</strong>
            </div>
        </div>
    </v-card>
    <div class="maxWidth tw-px-3 mt-5 " id="form-content" >
        <CardFilter
            v-model="filtersSelected"
            :is-loading="loadingTrecho"
            @update:modelValue="getTrechosWithTravels()"
            @update:options="(args)=>filtersData = args"
            class=" tw-top-[-100px]  !tw-mb-[-60px] lg:tw-top-[-100px] lg:!tw-mb-[-90px] !tw-mx-5 lg:!tw-mx-0  lg:!tw-block" />
        <Steps :step-sale="1"></Steps>
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
                                <div v-if="stepChooseTrip === 1">
                                    <v-checkbox
                                        v-for="item in trechosWithTravels.trechosIda?.data?.tiposComodidade"
                                        v-model="filtersSelected.tipo_comodidade_id"
                                        :label="item.nome"
                                        hide-details
                                        :value="item.id"
                                    ></v-checkbox>
                                </div>
                                <div v-else>
                                    <v-checkbox
                                        v-for="item in trechosWithTravels.trechosVolta?.data?.tiposComodidade"
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
                                @click="getTrechosWithTravels(stepChooseTrip == 1 ? 'ida':'volta');menu = false"
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
                            @update:modelValue="()=>getTrechosWithTravels(stepChooseTrip == 1 ? 'ida':'volta')"
                            label="Manhã(6h - 11h59)"
                            hide-details
                            value="06:00 11:59"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="filtersSelected.intervalo"
                            @update:modelValue="()=>getTrechosWithTravels(stepChooseTrip == 1 ? 'ida':'volta')"
                            label="Tarde(12h - 17h59)"
                            hide-details
                            value="12:00 17:59"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="filtersSelected.intervalo"
                            @update:modelValue="()=>getTrechosWithTravels(stepChooseTrip == 1 ? 'ida':'volta')"
                            label="Noite(18h -23h59)"
                            hide-details
                            value="18:00 23:59"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="filtersSelected.intervalo"
                            @update:modelValue="()=>getTrechosWithTravels(stepChooseTrip == 1 ? 'ida':'volta')"
                            label="Madrugada(00h - 5h59)"
                            hide-details
                            value="00:00 05:59"
                        ></v-checkbox>
                    </div>

                    <p class="tw-font-semibold tw-px-3 mt-1">Tipo de Assento</p>
                    <div v-if="stepChooseTrip === 1">
                        <v-checkbox
                            v-for="item in trechosWithTravels.trechosIda?.data?.tiposComodidade"
                            v-model="filtersSelected.tipo_comodidade_id"
                            :label="item.nome"
                            @update:modelValue="()=>getTrechosWithTravels()"
                            hide-details
                            :value="item.id"
                        ></v-checkbox>
                    </div>
                    <div v-else>
                        <v-checkbox
                            v-for="item in trechosWithTravels.trechosVolta?.data?.tiposComodidade"
                            v-model="filtersSelected.tipo_comodidade_id"
                            :label="item.nome"
                            @update:modelValue="()=>getTrechosWithTravels('volta')"
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
                            @update:modelValue="()=>getTrechosWithTravels(stepChooseTrip == 1 ? 'ida':'volta')"
                            placeholder="Empresas"
                            class="my-select mt-1"
                            :items="empresas"
                        >

                        </v-autocomplete>
                    </div>
                </v-container>
            </v-card>
            <div class="tw-flex tw-flex-col tw-gap-3 !tw-w-full ">
                <v-card  flat  class="  !tw-px-3 !tw-py-2  lg:!tw-block">
                    <div class="tw-flex tw-gap-10 tw-items-center tw-justify-between tw-p-2 tw-text-[14px] tw-font-semibold">
                        <v-btn v-if="stepChooseTrip == 2" size="small" variant="flat" @click="prevToBack">
                            Voltar para ida
                        </v-btn>
                        <span>Escolha sua viagem de {{stepChooseTrip == 1 ? 'ida':'volta'}}</span>
                    </div>
                </v-card>


                <div class="tw-w-full tw-flex tw-flex-col tw-gap-3 " >
                    <v-tabs-window v-model="stepChooseTrip">
                        <v-tabs-window-item :value="1">
                            <v-card  flat  class=" mb-3 !tw-px-3 !tw-py-2  lg:!tw-block">
                                <div class="tw-flex tw-gap-10 tw-items-center tw-justify-center tw-p-2 tw-text-[12px]">
                                    <v-btn
                                        :variant="filtersSelected.dataIda.getDate() === date.getDate()? 'flat' : 'outlined'"
                                        :color="filtersSelected.dataIda.getDate() === date.getDate()? 'primary' : 'secondary'"
                                        v-for="date in nextDaysIda"
                                        :key="date.getDate()"
                                        @click="filtersSelected.dataIda = date; getTrechosWithTravels()"
                                    >
                                        <span class=" tw-font-semibold tw-text-xs">{{ formatDates(date) }}</span>
                                    </v-btn>
                                </div>
                            </v-card>
                            <template v-if="trechosWithTravels.trechosIda?.data?.trechos?.data.length > 0">
                                <CardTicket
                                    v-for="item in trechosWithTravels.trechosIda.data?.trechos?.data"
                                    :key="item.id_viagem + (item.volta?.id_viagem ?? 0)"
                                    :dataIda="item"
                                    type="ida"
                                    class=" !tw-w-full !tw-h-fit mb-3"
                                    @continue="saveTrips"
                                ></CardTicket>
                            </template>
                            <div v-else-if="nextTravel.ida != null" class="tw-w-full tw-text-center tw-flex tw-flex-col tw-items-center">
                                <Icon icon="ix:anomaly-found" width="60" class=" tw-text-xl tw-text-p"/>

                                <p class="tw-text-p mt-1"> Nenhuma viagem foi encontrada. A próxima viagem de {{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem', filtersData)}} para {{getMonicipioLabel(filtersSelected.destino,'municipiosDestino',filtersData)}} será dia {{formatDate(nextTravel.ida.data_embarque)}} ás {{formatarHora(nextTravel.ida.horario)}}.</p>

                                <v-btn @click="goToNextTrip()" variant="tonal" color="secondary" class="mt-3">Ir para próxima viagem</v-btn>
                            </div>
                            <div class="tw-flex tw-justify-center"  v-else-if="loadingTrecho">
                                <v-progress-circular
                                    width="2"
                                    color="white"
                                    size="90"
                                    indeterminate
                                ></v-progress-circular>
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
                        </v-tabs-window-item>
                        <v-tabs-window-item :value="2" >
                            <v-card  flat  class=" mb-3 !tw-px-3 !tw-py-2  lg:!tw-block">
                                <div class="tw-flex tw-gap-10 tw-items-center tw-justify-center tw-p-2 tw-text-[12px]">
                                    <v-btn
                                        :variant="filtersSelected.dataVolta.getDate() === date.getDate()? 'flat' : 'outlined'"
                                        :color="filtersSelected.dataVolta.getDate() === date.getDate()? 'primary' : 'secondary'"
                                        v-for="date in nextDaysVolta"
                                        :key="date.getDate()"
                                        @click="filtersSelected.dataVolta = date; getTrechosWithTravels('volta')"
                                    >
                                        <span class=" tw-font-semibold tw-text-xs">{{ formatDates(date) }}</span>
                                    </v-btn>
                                </div>
                            </v-card>
                            <template v-if="trechosWithTravels.trechosVolta?.data?.trechos?.data.length > 0">
                                <CardTicket
                                    v-for="item in trechosWithTravels.trechosVolta.data?.trechos?.data"
                                    :key="item.id_viagem + (item.volta?.id_viagem ?? 0)"
                                    :dataIda="item"
                                    type="volta"
                                    class=" !tw-w-full !tw-h-fit "
                                    @continue="saveTrips"
                                ></CardTicket>
                            </template>


                            <div v-else-if="nextTravel.volta != null" class="tw-w-full tw-text-center tw-flex tw-flex-col tw-items-center">
                                <Icon icon="ix:anomaly-found" width="60" class=" tw-text-xl tw-text-p"/>

                                <p class="tw-text-p mt-1"> Nenhuma viagem foi encontrada. A próxima viagem de {{getMonicipioLabel(filtersSelected.destino,'municipiosDestino', filtersData)}} para {{getMonicipioLabel(filtersSelected.origem,'municipiosOrigem',filtersData)}} será dia {{formatDate(nextTravel.volta.data_embarque)}} ás {{formatarHora(nextTravel.volta.horario)}}.</p>

                                <v-btn @click="goToNextTrip('volta')" variant="tonal" color="secondary" class="mt-3">Ir para próxima viagem</v-btn>
                            </div>
                            <div class="tw-flex tw-justify-center"  v-else-if="loadingTrecho">
                                <v-progress-circular
                                    width="2"
                                    color="white"
                                    size="90"
                                    indeterminate
                                ></v-progress-circular>
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
                        </v-tabs-window-item>
                    </v-tabs-window>

                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>

</style>

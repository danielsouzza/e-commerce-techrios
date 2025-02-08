<script setup>

import {Icon} from "@iconify/vue";
import SuperOfferStampTwo from "../ui-components/SuperOfferStampTwo.vue";
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {routes} from "../../services/fetch.js";
import Boat from "./Boat.vue";
import BaseCard from "./BaseCard.vue";
import {
  formatarTempoViagem,
  formatCurrency,
  formatDate,
  formatMoney,
  gerarStringTiposComodos
} from "../../Helper/Ultis.js";
import {showErrorNotification} from "../../event-bus.js";

const props = defineProps({
  modelValue: Object,
  dataIda: Object,
  dataVolta: Object,

})
const emit = defineEmits(['continue','chooseBack'])

const rooms = ref({
  ida:[],
  volta:[]
})
const roomsFree = ref({
  ida:[],
  volta:[]
})
const roomsSelected = ref({
  dataIda:{
    trecho:null,
    selectedsById:[],
    selectedsByType:[],
  },
  dataVolta:{
    trecho:null,
    selectedsById:[],
    selectedsByType:[],
  }
})

const step = ref(1)
const matrizRooms = ref({
  ida:[],
  volta:[]
})
const openRooms = ref(false)
const windowWidth = ref(window.innerWidth)
const isLargeScreen = computed(()=> windowWidth.value >= 1024)

const hasCamarotesAndRede = computed(() => {
  if(step.value === 1){
    return props.dataIda.tipos_comodos.some((item)=> item.id >= 2 && item.id <=4)
  }
  return props.dataVolta.tipos_comodos.some((item)=> item.id >= 2 && item.id <=4)
})

const quantityRoomsFree = computed(() => {
  if(step.value === 1){
    return roomsFree.value.ida.reduce((acc, room) => {
      return acc + room.quantidade
    },0)
  }else {
    return roomsFree.value.volta.reduce((acc, room) => {
      return acc + room.quantidade
    },0)
  }

})
function allRooms (data, rooms) {
  const totalSpaces = data.linhas * data.colunas;
  const linearRooms = Array(totalSpaces).fill(null);

  if (rooms["1"] && rooms["1"].length) {
    for (const comodo of rooms["1"]) {
      try {
        const index = isLargeScreen.value
            ? (comodo.linha - 1) * data.colunas + (comodo.coluna - 1)
            : (comodo.coluna - 1) * data.linhas + (comodo.linha - 1)
        linearRooms[index] = comodo;
      } catch (e) {
        console.error('Erro ao posicionar cômodo:', comodo, e);
      }
    }
  }

  return linearRooms;
}

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  const data = step.value === 1 ? props.dataIda : props.dataVolta
  const roomsStep = step.value === 1 ? rooms.value.ida : rooms.value.volta
  matrizRooms.value = allRooms(data, roomsStep);
};

function getQuantityRoomsFree() {
  const params = new URLSearchParams();
  if(step.value === 1){
    params.append('trecho_id', props.dataIda.id);
    params.append('viagem_id', props.dataIda.id_viagem);
  }else  {
    params.append('trecho_id', props.dataVolta.id);
    params.append('viagem_id', props.dataVolta.id_viagem);
  }

  routes['rooms.free'](params).then((response) => {
    if(step.value === 1){
      roomsFree.value.ida = response.data.data;
    }else{
      roomsFree.value.volta = response.data.data;
    }
  });

}
function getRoomsByTrecho() {
  const params = new URLSearchParams();
  let tipoComodos = []
  if(step.value === 1){
    params.append('trecho_id', props.dataIda.id);
    params.append('viagem_id', props.dataIda.id_viagem);
    tipoComodos = props.dataIda.tipos_comodos.map(tipoComodo => tipoComodo.id)
  }else  {
    params.append('trecho_id', props.dataVolta.id);
    params.append('viagem_id', props.dataVolta.id_viagem);
    tipoComodos = props.dataVolta.tipos_comodos.map(tipoComodo => tipoComodo.id)
  }

  if (tipoComodos.includes(1)){
    routes['rooms.poltronas'](params).then((response) => {
      if(step.value === 1){
        rooms.value.ida = response.data.data;
        matrizRooms.value.ida = allRooms(props.dataIda,rooms.value.ida);
      }else{
        rooms.value.volta = response.data.data;
        matrizRooms.value.volta = allRooms(props.dataVolta,rooms.value.volta);
      }
    });
  }else if(tipoComodos.includes(4)){
    routes['rooms.camarotes'](params).then((response) => {
      if(step.value === 1){
        rooms.value.ida = response.data.data;
      }else{
        rooms.value.volta = response.data.data;
      }
    })
  }
}

function onClickRoom(room, type,typeTravel='dataIda') {
  if(type){
    const selectedsByType = roomsSelected.value[typeTravel].selectedsByType
    const type_comodo = selectedsByType.find(it=>it.type_comodo_id === type)
    if(type_comodo){
      if( type_comodo.quantidade > 0){
        roomsSelected.value[typeTravel].selectedsByType.splice(roomsSelected.value[typeTravel].selectedsByType.indexOf(type_comodo), 1)
      }else{
        roomsSelected.value[typeTravel].selectedsByType.push({ quantidade: 1, type_comodo_id: type })
      }
    }else{
      roomsSelected.value[typeTravel].selectedsByType.push({ quantidade: 1, type_comodo_id: type })
    }
  }else{
    if(roomsSelected.value[typeTravel].selectedsById.includes(room)){
      deleteReserva(room)
    }else{
      postReserva(room)
    }
  }
}

function incrementComodo(type,typeTravel='dataIda') {
  const selectedsByType = roomsSelected.value[typeTravel].selectedsByType
  const type_comodo = selectedsByType.find(it=>it.type_comodo_id === type)
  if(type_comodo){
    type_comodo.quantidade++
  }
}

function decrementComodo(type,typeTravel='dataIda') {
  const selectedsByType = roomsSelected.value[typeTravel].selectedsByType
  const type_comodo = selectedsByType.find(it=>it.type_comodo_id === type)
  if(type_comodo){
    type_comodo.quantidade--
  }

  if(type_comodo.quantidade === 0){
      roomsSelected.value[typeTravel].selectedsByType.splice(roomsSelected.value[typeTravel].selectedsByType.indexOf(type_comodo), 1)

  }
}

function postReserva(room){
  const params = new URLSearchParams();
  params.append('trecho_id', step.value === 1 ? props.dataIda.id : props.dataVolta.id);
  params.append('viagem_id', step.value === 1 ? props.dataIda.id_viagem : props.dataVolta.id_viagem);
  params.append('comodo_id', room.id);
  routes['rooms.reservas'](params).then((response) => {
    if(response.data.success){
      if(step.value === 1){
        roomsSelected.value.dataIda.selectedsById.push(room)
      }else {
        roomsSelected.value.dataVolta.selectedsById.push(room)
      }
    }
  }).catch(error => {
    console.log(error);
    showErrorNotification(error.response.data.message);
    if(step.value === 1){
      roomsSelected.value.dataIda.selectedsById.splice(roomsSelected.value.dataIda.selectedsById.indexOf(room), 1)
    }else {
      roomsSelected.value.dataVolta.selectedsById.splice(roomsSelected.value.dataVolta.selectedsById.indexOf(room), 1)
    }
  })
}

function deleteReserva(room){
  routes['rooms.reservas.delete']({
    data:{
      trecho_id: step.value === 1 ? props.dataIda.id : props.dataVolta.id,
      viagem_id: step.value === 1 ? props.dataIda.id : props.dataVolta.id,
      comodo_ids:[room.id]
    }
  }).then((response) => {
    if(response.data.success){
      if(step.value === 1){
        roomsSelected.value.dataIda.selectedsById.splice(roomsSelected.value.dataIda.selectedsById.indexOf(room), 1)
      }else {
        roomsSelected.value.dataVolta.selectedsById.splice(roomsSelected.value.dataVolta.selectedsById.indexOf(room), 1)
      }
    }
  }).catch(error => {
    if(step.value === 1){
      roomsSelected.value.dataIda.selectedsById.splice(roomsSelected.value.dataIda.selectedsById.indexOf(room), 1)
    }else {
      roomsSelected.value.dataVolta.selectedsById.splice(roomsSelected.value.dataVolta.selectedsById.indexOf(room), 1)
    }
  })
}

async  function initSale(){
  const dataSale = {
    dataIda:null,
    dataVolta:null,
  }
  const tiposComodoEscolhidosIda = roomsSelected.value.dataIda.selectedsByType.reduce((acc, item) => {
    acc[item.type_comodo_id] = item.quantidade;
    return acc;
  }, {});

  const params = {
    'trecho_id': props.dataIda.id,
    'viagem_id': props.dataIda.id_viagem,
    'tiposComodoEscolhidos': tiposComodoEscolhidosIda,
    'comodosAssentosEscolhidos': roomsSelected.value.dataIda.selectedsById.map(item => item.id),
  };

  await routes['rooms.init-vendas'](params).then((response) => {
    const data = response.data.data;
    if(response.data.success){
     dataSale.dataIda = {
       trecho: data.data.trecho,
       rooms: data.data.comodos,
       formas_pagamento: data.formas_pagamento,
     }
    }
  }).catch(error => {
    console.log(error)
  })

  if(step.value === 2){
    const tiposComodoEscolhidosVolta = roomsSelected.value.dataVolta.selectedsByType.reduce((acc, item) => {
      acc[item.type_comodo_id] = item.quantidade;
      return acc;
    }, {});

    const params = {
      'trecho_id': props.dataVolta.id,
      'viagem_id': props.dataVolta.id_viagem,
      'tiposComodoEscolhidos': tiposComodoEscolhidosVolta,
      'comodosAssentosEscolhidos': roomsSelected.value.dataVolta.selectedsById.map(item => item.id),
    };

    await routes['rooms.init-vendas'](params).then((response) => {
      const data = response.data.data;
      if(response.data.success){
        dataSale.dataVolta = {
          trecho: data.data.trecho,
          rooms: data.data.comodos,
          formas_pagamento: data.formas_pagamento,
        }
      }
    }).catch(error => {
      console.log(error)
    })

  }

  emit('continue', dataSale);
}

function onClickBtnSelect(){
  openRooms.value = !openRooms.value;
  if(openRooms.value){
    getRoomsByTrecho()
  }else{
    roomsSelected.value.dataIda = {
      selectedsById:[],
      selectedsByType:[],
    }
    roomsSelected.value.dataVolta = {
      selectedsById:[],
      selectedsByType:[],
    }
  }
}

function formatarHora(dataHora) {
  if (typeof dataHora === "string" && dataHora.includes(' ')) {
    const [data, hora] = dataHora.split(' ');
    if (hora) {
      const [horas, minutos] = hora.split(':');
      const horasFormatadas = String(parseInt(horas, 10)).padStart(2, '0');
      const minutosFormatados = String(parseInt(minutos, 10)).padStart(2, '0');
      return `${horasFormatadas}H${minutosFormatados}`;
    }
  }
  return "00H00";
}

function generateLayout() {
  const linhas = step.value === 1 ? props.dataIda.linhas : props.dataVolta.linhas
  const colunas = step.value === 1 ? props.dataIda.colunas : props.dataVolta.colunas
  if (isLargeScreen.value) {
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${colunas}, 1fr)`,
      gap: "8px",
    }
  }else {
    return {
      display: "grid",
      gap: "8px",
      gridTemplateColumns: `repeat(${linhas}, 1fr)`,
  }
  }
}

function nextStep(){
  if(roomsSelected.value.dataIda.selectedsById.length > 0 || roomsSelected.value.dataIda.selectedsByType.length > 0){
    step.value = 2
    getRoomsByTrecho()
    getQuantityRoomsFree()
  }
}

function beforeStep(){
  step.value = 1
  getRoomsByTrecho()
  getQuantityRoomsFree()
}


watch(()=>props.dataIda.id_viagem,()=>{
  openRooms.value=false
  roomsSelected.value.dataIda = {
    selectedsById:[],
    selectedsByType:[],
  }
  roomsSelected.value.dataVolta = {
    selectedsById:[],
    selectedsByType:[],
  }
})

onMounted(() => {
  window.addEventListener('resize', updateWidth);
  getQuantityRoomsFree()
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth);
});

</script>

<template>
  <BaseCard :active="openRooms">

    <div class="tw-flex tw-flex-col " >
      <div v-if="dataVolta" class="tw-flex  tw-text-primary tw-px-2 tw-justify-between tw-rounded-lg tw-font-bold lg:tw-mr-5">
        <span>Ida</span>
        {{formatDate(dataIda.saida)}}
      </div>
      <div class="lg:tw-flex tw-justify-between tw-items-center ">
        <div class="tw-flex tw-justify-between tw-items-center  mt-3 tw-w-full mr-10">
          <div>
            <v-img
                width="120px"
                height="50px"
                cover
                rounded
                src="https://picsum.photos/350/165?random"
            ></v-img>
          </div>
          <div class="tw-flex lg:tw-ml-5 tw-text-[10px] tw-gap-4 lg:tw-gap-6 lg:tw-text-sm">
            <div>
              Saída <br> <span class="tw-font-bold tw-text-[12px] lg:tw-text-sm">{{formatarHora(dataIda.horario)}}</span>
            </div>
            <div>
              Duração <br> <span class="tw-font-bold tw-text-[12px] lg:tw-text-sm">{{formatarTempoViagem(dataIda.tempo_viagem)}}</span>
            </div>
            <div>
              Tipo <br> <span class="tw-font-bold tw-text-[12px] lg:tw-text-sm">{{gerarStringTiposComodos(dataIda.tipos_comodos)}}</span>
            </div>
          </div>
        </div>

        <v-divider  :thickness="1" class="border-opacity-100 tw-mt-2 lg:!tw-hidden" ></v-divider>

        <div class="tw-flex tw-justify-end tw-items-center tw-w-full  md:tw-w-1/2  lg:tw-ml-10 lg:tw-mr-5">
          <div class="tw-mt-4 tw-text-right ">
            <p class="tw-text-sm tw-text-gray-500 ">De <span class="tw-line-through">R$ 83,00</span> por</p>
            <div><span class="tw-text-xl tw-text-primary tw-font-[900]">{{dataIda.valor}}</span><span class="tw-text-p tw-text-[10px]"> no PIX</span></div>
            <p class="tw-text-[10px] tw-text-gray-500">ou a partir de R$ 65,92 no cartão</p>
          </div>
        </div>
      </div>
    </div>

    <v-divider v-if="dataVolta" :thickness="1" class="border-opacity-100 tw-my-2 " ></v-divider>

    <div class="tw-flex tw-flex-col" v-if="dataVolta">
      <div class="tw-flex  tw-text-primary tw-justify-between tw-px-2 tw-rounded-lg tw-font-bold lg:tw-mr-5">
        <span>Ida</span>
        {{formatDate(dataVolta.saida)}}
      </div>
      <div class="lg:tw-flex tw-justify-between tw-items-center " >
        <div class="tw-flex tw-justify-between tw-items-center  mt-3 tw-w-full mr-10">
          <div>
            <v-img
                width="120px"
                height="50px"
                cover
                rounded
                src="https://picsum.photos/350/165?random"
            ></v-img>
          </div>
          <div class="tw-flex lg:tw-ml-5 tw-text-[10px] tw-gap-4 lg:tw-gap-6 lg:tw-text-sm">
            <div>
              Saída <br> <span class="tw-font-bold tw-text-[12px] lg:tw-text-sm">{{formatarHora(dataVolta.horario)}}</span>
            </div>
            <div>
              Duração <br> <span class="tw-font-bold tw-text-[12px] lg:tw-text-sm">{{formatarTempoViagem(dataVolta.tempo_viagem)}}</span>
            </div>
            <div>
              Tipo <br> <span class="tw-font-bold tw-text-[12px]  lg:tw-text-sm">{{gerarStringTiposComodos(dataVolta.tipos_comodos)}}</span>
            </div>
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-100 tw-mt-2 lg:!tw-hidden" ></v-divider>
        <div class="tw-flex tw-justify-end tw-items-center tw-w-full  md:tw-w-1/2 lg:tw-ml-10 lg:tw-mr-5">
          <div class="tw-mt-4 tw-text-right">
            <p class="tw-text-sm tw-text-gray-500 ">De <span class="tw-line-through">R$ 83,00</span> por</p>
            <div><span class="tw-text-xl tw-text-primary tw-font-[900]">{{dataVolta.valor}}</span><span class="tw-text-p tw-text-[10px]"> no PIX</span></div>
            <p class="tw-text-[10px] tw-text-gray-500">ou a partir de R$ 65,92 no cartão</p>
          </div>
        </div>
      </div>
    </div>


    <v-tabs-window v-model="step" >
      <v-tabs-window-item :value="1">
        <v-divider  :thickness="1" class="border-opacity-100 tw-my-2  " v-show="openRooms" ></v-divider>
        <v-expand-transition>
          <div class="tw-flex tw-flex-col my-3 tw-w-full" v-if="openRooms">
            <div class="lg:tw-flex  tw-items-center justify-center">
              <div class="tw-flex tw-justify-between tw-items-center   lg:tw-gap-3">
                <div class="tw-text-[12px] lg:tw-text-sm">Restam <strong class="tw-font-extrabold">{{quantityRoomsFree}} LUGARES</strong> com esse preço</div>
              </div>
            </div>
            <div class="tw-flex tw-flex-col lg:tw-flex-col-reverse tw-justify-center tw-items-center ">
              <v-row >
                <v-col >
                  <div class="tw-flex  tw-items-center tw-gap-1  tw-text-sm">
                    <div class="my-badge bg-success"></div>
                    Livre
                  </div>
                </v-col>
                <v-col >
                  <div class="tw-flex  tw-items-center tw-gap-1  tw-text-sm">
                    <div class="my-badge !tw-bg-secondary"></div>
                    vendido
                  </div>
                </v-col>
                <v-col>
                  <div class="tw-flex  tw-items-center tw-gap-1  tw-text-sm">
                    <div class="my-badge !tw-bg-yellow-400"></div>
                    selecionado
                  </div>
                </v-col>
              </v-row>
              <v-container class=" lg:!tw-max-w-[800px] tw-max-w-[350px]  tw-flex ">
                <Boat v-if="matrizRooms.ida.length > 0">
                  <div :style="generateLayout()" class="tw-h-full">
                    <div
                        v-for="(comodo, index) in matrizRooms.ida"
                        :key="index"
                        :class="comodo?.id ? (comodo.is_ocupado ? '!tw-bg-secondary tw-cursor-not-allowed' : roomsSelected.dataIda.selectedsById?.includes(comodo) ? '!tw-bg-yellow-400' : 'tw-bg-green-400') : 'tw-bg-gray-200'"
                        class="text-center tw-rounded-[5px] !tw-text-white tw-font-black tw-px-1 tw-py-[2px] tw-text-xs tw-h-[24px] tw-min-w-[30px] tw-cursor-pointer "
                        @click="comodo?.id && !comodo.is_ocupado ? onClickRoom(comodo,null) : ''"
                    >
                      {{ comodo?.id ? (comodo.numeracao < 10 ? '0' + comodo.numeracao : comodo.numeracao) : '' }}
                    </div>
                  </div>
                  <div class="mt-2 lg:tw-hidden " >
                    <div class="tw-flex  lg:tw-justify-start tw-w-full tw-font-bold">Mais viajante?</div>
                    <div class="tw-text-p tw-text-sm">selecione outro lugar.</div>
                  </div>
                </Boat>
                <v-container v-if="hasCamarotesAndRede">
                  <v-row>
                    <template v-for="item in dataIda.tipos_comodos">
                      <v-col v-if="item.id !== 4 && item.id !== 1 " :key="item.id" cols="12"  md="6" lg="4">
                        <v-card
                            flat
                            @click="roomsFree.ida.find(it=>it.tipo_comodidade_id === item.id).quantidade > 0 ? onClickRoom(null,item.id) : ''"
                            :class="roomsSelected.dataIda.selectedsByType?.find(it=>item.id == it.type_comodo_id)?.quantidade > 0 ? '!tw-bg-yellow-400' :
                            roomsFree.ida.find(it=>it.tipo_comodidade_id === item.id).quantidade === 0 ? '!tw-bg-secondary tw-cursor-not-allowed' : '!tw-bg-green-400'
                            "
                        >
                          <v-row class="tw-p-3 !tw-text-white">
                            <v-col cols="8" class=" tw-text-xs">
                              {{item.nome}}
                            </v-col>
                            <v-col cols="4" class=" tw-text-sm tw-flex tw-items-center  tw-justify-end">
                              <Icon icon="el:person" width="15"  class="mr-1 "/>{{roomsFree.ida.find(it=>it.tipo_comodidade_id === item.id).quantidade}}
                            </v-col>
                            <v-col cols="6" class=" tw-text-xs !tw-pt-0 ">
                              Valor
                            </v-col>
                            <v-col cols="6" class="text-right  tw-text-sm tw-font-semibold !tw-pt-0">
                              {{formatCurrency(formatMoney(dataIda.valor))}}
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </template>
                    <v-col v-for="item in rooms.ida[4]" cols="12" md="6" lg="4">
                      <v-card
                          flat
                          @click="!item.is_ocupado ? onClickRoom(item, null) : ''"
                          :class="(item.is_ocupado ? '!tw-bg-secondary tw-cursor-not-allowed' : roomsSelected.dataIda.selectedsById?.includes(item) ? '!tw-bg-yellow-400' : '!tw-bg-green-400')"
                      >
                        <v-row class="tw-p-3 !tw-text-white">
                          <v-col cols="9" class=" tw-text-xs">
                            {{item.nome}}
                          </v-col>
                          <v-col cols="3" class=" tw-text-sm tw-flex tw-items-center  tw-justify-end">
                            <Icon icon="el:person" width="15"  class="mr-1 "/>{{item.quantidade}}
                          </v-col>
                          <v-col cols="6" class=" tw-text-xs !tw-pt-0 ">
                            Valor
                          </v-col>
                          <v-col cols="6" class="text-right  tw-text-sm tw-font-semibold !tw-pt-0">
                            {{formatCurrency(item.comodo_trechos.valor)}}
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-container>
            </div>
            <v-divider  :thickness="1" class="border-opacity-100 tw-my-2 tw-hidden lg:tw-block mt-5 " ></v-divider>
            <v-row >
              <v-col cols="12" md="6">
                <div class="tw-flex tw-justify-center lg:tw-justify-start tw-w-full tw-font-bold">Lugares selecionados</div>
                <div class=" mt-3" v-if="roomsSelected.dataIda.selectedsById?.length > 0">
                  <v-row v-for="room in roomsSelected.dataIda.selectedsById" :key="room.id" class="tw-flex tw-justify-center tw-items-center tw-gap-1 tw-text-xs tw-text-p  !tw-m-0" >
                    <v-col cols="8" class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                      <div v-if="room.tipo_comodidade_id == 1 || room.tipo_comodidade == 1" class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                        <div  class="!tw-bg-yellow-400 text-center tw-rounded-[5px] !tw-text-white  tw-px-1 tw-py-[2px]  my-1">
                          {{room.numeracao < 10 ? '0' + room.numeracao : room.numeracao}}
                        </div>
                        <span >{{room.tipo_comodidade.nome}}</span>
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                        <div  class="!tw-bg-yellow-400 text-center tw-rounded-[5px] !tw-text-white  tw-px-1 tw-py-[2px]  my-1">
                          {{room.nome}}
                        </div>
                      </div>
                    </v-col>
                    <v-col class="tw-flex tw-items-center tw-gap-1 !tw-p-0 tw-justify-end">{{room.comodo_trechos?.valor ? formatCurrency(room.comodo_trechos?.valor) : dataIda.valor}} <Icon @click="onClickRoom(room, null)" icon="mdi:close-box"  width="15"  class="ml-3" /></v-col>
                  </v-row>
                </div>
                <div class=" mt-3" v-if="roomsSelected.dataIda.selectedsByType?.length > 0">
                  <v-row v-for="(room,i) in roomsSelected.dataIda.selectedsByType" :key="i" class="tw-flex tw-justify-between tw-items-center tw-gap-1 tw-text-xs tw-text-p  !tw-m-0" >
                    <v-col cols="3" class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                      <div class="!tw-bg-yellow-400 text-center tw-rounded-[5px] !tw-text-white  tw-px-1 tw-py-[2px]  my-1">
                        {{dataIda.tipos_comodos.find(it=>it.id == room.type_comodo_id).nome}}
                      </div>
                    </v-col>
                    <v-col cols="4" class="tw-flex tw-items-center tw-gap-1 !tw-p-0 tw-justify-end ">  <Icon @click="incrementComodo(room.type_comodo_id )" icon="ph:plus-fill"  width="15"  class="mr-3" /> {{ room.quantidade}} <Icon @click="decrementComodo(room.type_comodo_id )" icon="ph:minus-fill"  width="15"  class="ml-3" /></v-col>
                    <v-col cols="4" class="tw-flex tw-items-center tw-gap-1 !tw-p-0 tw-justify-end">   {{ dataIda.valor}} <Icon @click="onClickRoom(null,room.type_comodo_id)" icon="mdi:close-box"  width="15"  class="ml-3" /> </v-col>
                  </v-row>
                </div>
                <div v-if="roomsSelected.dataIda.selectedsByType?.length === 0 && roomsSelected.dataIda.selectedsById?.length === 0" class="tw-flex  tw-items-center tw-gap-1 tw-text-xs tw-text-p  !tw-m-0">
                  Nenhum lugar selecionado
                </div>
              </v-col>
              <v-col cols="12" md="6" class="tw-hidden lg:tw-block">
                <div class="tw-flex tw-justify-center lg:tw-justify-start tw-w-full tw-font-bold">Mais viajante?</div>
                <div class="tw-text-p tw-text-xs">selecione outro lugar.</div>
                <div v-if="roomsSelected.dataIda.selectedsByType?.length >  0 || roomsSelected.dataIda.selectedsById?.length >  0" class="tw-flex tw-gap-3 mt-5">
                  <v-btn  v-if="!dataVolta" variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="initSale">
                    <span class=" !tw-text-xs tw-text-white"  >Avançar</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
                  </v-btn>
                  <v-btn v-else variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="nextStep">
                    <span class=" !tw-text-xs tw-text-white"  >Escolher volta</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white "  />
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
        <v-divider  :thickness="1" class="border-opacity-100 tw-my-2  " ></v-divider>
        <div v-if="roomsSelected.dataIda.selectedsByType?.length >  0 || roomsSelected.dataIda.selectedsById?.length >  0" class="tw-flex tw-justify-center lg:tw-hidden ">
          <v-btn  v-if="!dataVolta" variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="initSale">
            <span class=" !tw-text-xs tw-text-white"  >Avançar</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
          </v-btn>
          <v-btn v-else variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="nextStep">
            <span class=" !tw-text-xs tw-text-white"  >Escolher volta</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white "  />
          </v-btn>

        </div>
      </v-tabs-window-item>

      <v-tabs-window-item :value="2">
        <v-divider  :thickness="1" class="border-opacity-100 tw-my-2  " v-show="openRooms" ></v-divider>
        <v-expand-transition>
          <div class="tw-flex tw-flex-col my-3 tw-w-full" v-if="openRooms">
            <div class="lg:tw-flex  tw-items-center justify-center">
              <div class="tw-flex tw-justify-between tw-items-center   lg:tw-gap-3">
                <div class="tw-text-[12px] lg:tw-text-sm">Restam <strong class="tw-font-extrabold">{{quantityRoomsFree}} LUGARES</strong> com esse preço</div>
              </div>
            </div>
            <div class="tw-flex tw-flex-col lg:tw-flex-col-reverse tw-justify-center tw-items-center ">
              <v-row >
                <v-col >
                  <div class="tw-flex  tw-items-center tw-gap-1  tw-text-sm">
                    <div class="my-badge bg-success"></div>
                    Livre
                  </div>
                </v-col>
                <v-col >
                  <div class="tw-flex  tw-items-center tw-gap-1  tw-text-sm">
                    <div class="my-badge !tw-bg-secondary"></div>
                    vendido
                  </div>
                </v-col>
                <v-col>
                  <div class="tw-flex  tw-items-center tw-gap-1  tw-text-sm">
                    <div class="my-badge !tw-bg-yellow-400"></div>
                    selecionado
                  </div>
                </v-col>
              </v-row>
              <v-container class=" lg:!tw-max-w-[800px] tw-max-w-[350px]  tw-flex ">
                <Boat v-if="matrizRooms.volta.length > 0">
                  <div :style="generateLayout()" class="tw-h-full">
                    <div
                        v-for="(comodo, index) in matrizRooms.volta"
                        :key="index"
                        :class="comodo?.id ? (comodo.is_ocupado ? '!tw-bg-secondary tw-cursor-not-allowed' : roomsSelected.dataVolta.selectedsById?.includes(comodo) ? '!tw-bg-yellow-400' : 'tw-bg-green-400') : 'tw-bg-gray-200'"
                        class="text-center tw-rounded-[5px] !tw-text-white tw-font-black tw-px-1 tw-py-[2px] tw-text-xs tw-h-[24px] tw-min-w-[30px] tw-cursor-pointer "
                        @click="comodo?.id && !comodo.is_ocupado ? onClickRoom(comodo,null) : ''"
                    >
                      {{ comodo?.id ? (comodo.numeracao < 10 ? '0' + comodo.numeracao : comodo.numeracao) : '' }}
                    </div>
                  </div>
                  <div class="mt-2 lg:tw-hidden " >
                    <div class="tw-flex  lg:tw-justify-start tw-w-full tw-font-bold">Mais viajante?</div>
                    <div class="tw-text-p tw-text-sm">selecione outro lugar.</div>
                  </div>
                </Boat>
                <v-container v-if="hasCamarotesAndRede">
                  <v-row>
                    <template v-for="item in dataVolta.tipos_comodos">
                      <v-col v-if="item.id !== 4 && item.id !== 1 " :key="item.id" cols="12"  md="6" lg="4">
                        <v-card
                            flat
                            @click="roomsFree.volta.find(it=>it.tipo_comodidade_id === item.id)?.quantidade > 0 ? onClickRoom(null,item.id,'dataVolta') : ''"
                            :class="roomsSelected.dataVolta.selectedsByType?.find(it=>item.id == it.type_comodo_id)?.quantidade > 0 ? '!tw-bg-yellow-400' :
                            roomsFree.volta.find(it=>it.tipo_comodidade_id === item.id)?.quantidade === 0 ? '!tw-bg-secondary tw-cursor-not-allowed' : '!tw-bg-green-400'
                            "
                        >
                          <v-row class="tw-p-3 !tw-text-white">
                            <v-col cols="8" class=" tw-text-xs">
                              {{item.nome}}
                            </v-col>
                            <v-col cols="4" class=" tw-text-sm tw-flex tw-items-center  tw-justify-end">
                              <Icon icon="el:person" width="15"  class="mr-1 "/>{{roomsFree.volta.find(it=>it.tipo_comodidade_id === item.id)?.quantidade}}
                            </v-col>
                            <v-col cols="6" class=" tw-text-xs !tw-pt-0 ">
                              Valor
                            </v-col>
                            <v-col cols="6" class="text-right  tw-text-sm tw-font-semibold !tw-pt-0">
                              {{formatCurrency(formatMoney(dataVolta.valor))}}
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </template>
                    <v-col v-for="item in rooms.volta[4]" cols="12" md="6" lg="4">
                      <v-card
                          flat
                          @click="!item.is_ocupado ? onClickRoom(item, null,'dataVolta') : ''"
                          :class="(item.is_ocupado ? '!tw-bg-secondary tw-cursor-not-allowed' : roomsSelected.dataVolta.selectedsById?.includes(item) ? '!tw-bg-yellow-400' : '!tw-bg-green-400')"
                      >
                        <v-row class="tw-p-3 !tw-text-white">
                          <v-col cols="9" class=" tw-text-xs">
                            {{item.nome}}
                          </v-col>
                          <v-col cols="3" class=" tw-text-sm tw-flex tw-items-center  tw-justify-end">
                            <Icon icon="el:person" width="15"  class="mr-1 "/>{{item.quantidade}}
                          </v-col>
                          <v-col cols="6" class=" tw-text-xs !tw-pt-0 ">
                            Valor
                          </v-col>
                          <v-col cols="6" class="text-right  tw-text-sm tw-font-semibold !tw-pt-0">
                            {{formatCurrency(item.comodo_trechos.valor)}}
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-container>
            </div>
            <v-divider  :thickness="1" class="border-opacity-100 tw-my-2 tw-hidden lg:tw-block mt-5 " ></v-divider>
            <v-row >
              <v-col cols="12" md="6">
                <div class="tw-flex tw-justify-center lg:tw-justify-start tw-w-full tw-font-bold">Lugares selecionados</div>
                <div class=" mt-3" v-if="roomsSelected.dataVolta.selectedsById?.length > 0">
                  <v-row v-for="room in roomsSelected.dataVolta.selectedsById" :key="room.id" class="tw-flex tw-justify-center tw-items-center tw-gap-1 tw-text-xs tw-text-p  !tw-m-0" >
                    <v-col cols="8" class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                      <div v-if="room.tipo_comodidade_id == 1 || room.tipo_comodidade == 1" class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                        <div  class="!tw-bg-yellow-400 text-center tw-rounded-[5px] !tw-text-white  tw-px-1 tw-py-[2px]  my-1">
                          {{room.numeracao < 10 ? '0' + room.numeracao : room.numeracao}}
                        </div>
                        <span >{{room.tipo_comodidade.nome}}</span>
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                        <div  class="!tw-bg-yellow-400 text-center tw-rounded-[5px] !tw-text-white  tw-px-1 tw-py-[2px]  my-1">
                          {{room.nome}}
                        </div>
                      </div>
                    </v-col>
                    <v-col class="tw-flex tw-items-center tw-gap-1 !tw-p-0 tw-justify-end">{{room.comodo_trechos?.valor ? formatCurrency(room.comodo_trechos?.valor) : dataVolta.valor}} <Icon @click="onClickRoom(room, null)" icon="mdi:close-box"  width="15"  class="ml-3" /></v-col>
                  </v-row>
                </div>
                <div class=" mt-3" v-if="roomsSelected.dataVolta.selectedsByType?.length > 0">
                  <v-row v-for="(room,i) in roomsSelected.dataVolta.selectedsByType" :key="i" class="tw-flex tw-justify-between tw-items-center tw-gap-1 tw-text-xs tw-text-p  !tw-m-0" >
                    <v-col cols="3" class="tw-flex tw-items-center tw-gap-1 !tw-p-0">
                      <div class="!tw-bg-yellow-400 text-center tw-rounded-[5px] !tw-text-white  tw-px-1 tw-py-[2px]  my-1">
                        {{dataVolta.tipos_comodos.find(it=>it.id == room.type_comodo_id).nome}}
                      </div>
                    </v-col>
                    <v-col cols="4" class="tw-flex tw-items-center tw-gap-1 !tw-p-0 tw-justify-end ">  <Icon @click="incrementComodo(room.type_comodo_id,'dataVolta')" icon="ph:plus-fill"  width="15"  class="mr-3" /> {{ room.quantidade}} <Icon @click="decrementComodo(room.type_comodo_id, 'dataVolta')" icon="ph:minus-fill"  width="15"  class="ml-3" /></v-col>
                    <v-col cols="4" class="tw-flex tw-items-center tw-gap-1 !tw-p-0 tw-justify-end">   {{ dataVolta.valor}} <Icon @click="onClickRoom(null,room.type_comodo_id,'dataVolta')" icon="mdi:close-box"  width="15"  class="ml-3" /> </v-col>
                  </v-row>
                </div>
                <div v-if="roomsSelected.dataVolta.selectedsByType?.length === 0 && roomsSelected.dataVolta.selectedsById?.length === 0" class="tw-flex  tw-items-center tw-gap-1 tw-text-xs tw-text-p  !tw-m-0">
                  Nenhum lugar selecionado
                </div>
              </v-col>
              <v-col cols="12" md="6" class="tw-hidden lg:tw-block">
                <div class="tw-flex tw-justify-center lg:tw-justify-start tw-w-full tw-font-bold">Mais viajante?</div>
                <div class="tw-text-p tw-text-xs">selecione outro lugar.</div>
                <div v-if="roomsSelected.dataVolta.selectedsByType?.length >  0 || roomsSelected.dataVolta.selectedsById?.length >  0" class="tw-flex tw-gap-3 mt-5">
                  <v-btn variant="outlined"  color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="beforeStep">
                    <Icon icon="mdi:navigate-before" width="20"    /><span class=" !tw-text-xs "  >voltar</span>
                  </v-btn>
                  <v-btn variant="flat"  color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="initSale">
                    <span class=" !tw-text-xs tw-text-white"  >Avançar</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
                  </v-btn>

                </div>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
        <v-divider  :thickness="1" class="border-opacity-100 tw-my-2  " ></v-divider>
        <div v-if="roomsSelected.dataVolta.selectedsByType?.length >  0 || roomsSelected.dataVolta.selectedsById?.length >  0" class="tw-flex tw-justify-center lg:tw-hidden ">
          <v-btn variant="flat" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="initSale">
            <span class=" !tw-text-xs tw-text-white"  >Avançar</span><Icon icon="mdi:navigate-next" width="20"  class="ml-1 tw-text-white"  />
          </v-btn>

        </div>
      </v-tabs-window-item>

      <div class="lg:tw-flex tw-justify-between tw-items-center lg:tw-flex-row-reverse">
        <v-btn :variant="!openRooms ? 'flat': 'outlined'" color="success" rounded  class="d-lg-flex  !tw-font-extrabold px-2 py-1" size="xs" @click="onClickBtnSelect">
          <Icon icon="icon-park-outline:ticket" width="20"  class="mr-1 " :class="!openRooms ? 'tw-text-white' : ''" /><span class=" !tw-text-xs " :class="!openRooms ? 'tw-text-white' : ''" >{{!openRooms ? 'Selecionar' : 'Cancelar'}}</span>
        </v-btn>
        <v-divider  :thickness="1" class="border-opacity-100 tw-my-2 lg:!tw-hidden" ></v-divider>
        <div class="tw-flex tw-justify-center tw-items-center tw-gap-1  py-2">
          <div class="!tw-rounded-[3px] !tw-text-[10px] tw-text-secondary tw-bg-secondary/10 tw-flex tw-p-2 tw-items-center tw-font-bold"><Icon icon="lets-icons:print" width="15"  class="mr-1 tw-text-black" />PASSAGEM IMPRESSA</div>
          <div class="!tw-rounded-[3px] !tw-text-[10px] tw-text-secondary tw-bg-secondary/10 tw-flex tw-p-2 tw-items-center tw-font-bold"><Icon icon="tdesign:qrcode" width="15"  class="mr-1 tw-text-black" />PASSAGEM NO CELULAR</div>
        </div>
      </div>
    </v-tabs-window>

  </BaseCard>

</template>

<style scoped>
.my-badge {
  width: 20px;
  height: 20px;
  background-color: #000;
  border-radius: 30%;
  display: inline-block;
}


</style>
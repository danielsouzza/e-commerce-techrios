<script setup>

import {computed, onMounted, ref} from "vue";
import {routes} from "../../services/fetch.js";
import {Icon} from "@iconify/vue";
import {formatCurrency} from "../../Helper/Ultis.js";

const props = defineProps({
  auth: Object,
  color: {
    type: String,
    default: 'green-400',

  },
})

const  myOrders = ref( [])
const  headers = [
  {
    title: 'codigo',
    value: 'codigo',
  },
  { title: 'Viagem', value: 'viagem' },
  { title: 'Data', value: 'data' },
  { title: 'Status', value: 'status' },
]


const orders = computed(()=>{
  const items = []
  myOrders.value.data?.forEach((item,index)=>{
    item.passagens_agrupadas.forEach( passage=>{
      items.push({
        codigo: item.id+passage.viagem.id,
        viagem: passage.trecho.municipio_origem.nome +" - "+ passage.trecho.municipio_destino.nome,
        data:passage.viagem.saida,
        status: item.status,
        detalhes:{
          boat: passage.viagem.embarcacao,
          passageiros:passage.passagem_pedidos,
          valor:passage.passagem_pedidos.reduce((acc, item)=>acc+item.valor,0),
          taxa:passage.passagem_pedidos.reduce((acc, item)=>acc+item.taxa_embarque,0),
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

onMounted(()=>{
  getOrder()
})


</script>

<template>
  <v-container class=" !tw-p-0 !tw-mx-0">
    <v-card variant="flat" elevation="0" rounded="lg" color="secondary"  >
      <v-data-table
          :headers="headers"
          :items="orders"
          expand-on-click
          show-expand

          class="!tw-bg-transparent my-table tw-text-white "
          item-value="codigo">


        <template v-slot:expanded-row="{ headers, item }">
          <td :colspan="5">
            <div class="row sp-details">
              <v-row class="tw-px-4 tw-py-3 tw-text-p">
                <v-col  cols="12" lg="6">
                  <v-row>
                    <v-col cols="12" class="tw-flex tw-items-center tw-font-semibold">
                      <Icon icon="mingcute:ship-fill" width="20" class="mr-3" />{{item.detalhes.boat.nome}}
                    </v-col>
                    <v-col cols="12" class="tw-flex tw-items-center tw-gap-3 py-0">
                      <Icon icon="icon-park-outline:ticket"  width="20"/>
                      <span class="tw-font-semibold">{{item.detalhes.passageiros.length}} {{item.detalhes.passageiros.length > 1 ? 'passagens' : 'passagem'}}</span>
                      <span class="tw-flex tw-items-center !tw-py-2 !tw-font-black tw-text-sm !tw-text-primary tw-justify-end">{{formatCurrency(item.detalhes.valor)}}</span>
                    </v-col>
                     <v-col cols="12" class="tw-flex tw-items-center tw-gap-3 py-0">
                       <Icon icon="icon-park-outline:doc-search-two"  width="20"/>
                      <span class="tw-font-semibold">Taxa de serviço</span>
                      <span class="tw-flex tw-items-center !tw-py-2  tw-text-sm  tw-justify-end">{{formatCurrency(item.detalhes.taxa)}}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col  cols="12" lg="6">
                  <div v-for="(it,i) in item.detalhes.passageiros" class="tw-flex ">
                    <Icon icon="famicons:person-outline"  width="20"/>
                    <div class="ml-3">
                      <div class="tw-font-bold tw-flex tw-items-center tw-gap-2">Passageiro {{i+1}} <span @click="getTicketPdf(it)" class="tw-flex tw-text-blue-500 tw-items-center tw-cursor-pointer">Baixar<Icon  icon="icon-park-outline:tickets-checked"  width="20" /></span></div>
                      <div>{{it.passageiro.nome}}</div>
                      <div>Doc: {{it.passageiro.ndoc}}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>
              <v-divider  :thickness="1" class="border-opacity-100 my-3 " ></v-divider>
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
  border-radius: 16px 0 0 0 !important;
  text-wrap: nowrap !important;
}

.my-table::v-deep(tbody tr:nth-child(1) td:nth-last-child(1) ) {
  background-color: #f9f9f9;
  border-radius: 0 16px 0 0 !important;
  text-wrap: nowrap !important;
}


.my-table::v-deep(thead) {
  color: white !important;

}
</style>
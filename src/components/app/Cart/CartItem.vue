<script setup>

import {formatCurrency} from "../../../Helper/Ultis.js";
import {computed, ref} from "vue";
import {Icon} from "@iconify/vue";
import {routes} from "../../../services/fetch.js";

const props = defineProps({
  data:Object
})

const openRooms = ref(false);

const valorTotal = computed(()=>{
  const valor = props.data.passagem_pedidos.reduce((acc, item)=>acc+item.valor,0)
  const taxa  = props.data.passagem_pedidos.reduce((acc, item)=>acc+item.taxa_embarque,0)
  return valor + taxa;
})


function onOpenRooms(){
  openRooms.value = !openRooms.value
}


function removerRoom(params){
  console.log(params)
  routes["order.delete"](params.pedido,params).then(response => {
    console.log(response)
  })
}

</script>

<template>
  <v-card variant="outlined" rounded="lg" class="!tw-p-4 !tw-border-secondary">
    <div class="tw-flex  mt-3 tw-w-full ">

      <div class="tw-mr-5">
        <v-img
            width="120px"
            height="50px"
            cover
            rounded
            src="https://picsum.photos/350/165?random"
        ></v-img>
      </div>
      <v-row>
        <v-col cols="6" class="pb-0 !tw-font-bold">
          {{data.trecho.municipio_origem.nome +" - "+ data.trecho.municipio_destino.nome}}
          <br><span class="tw-font-normal">{{ data.viagem.saida }}</span>
        </v-col>
        <v-col cols="6" class="pb-0 ! !tw-font-black tw-text-lg !tw-text-primary text-end">
          {{formatCurrency(valorTotal)}}
        </v-col>
        <v-col cols="12" class="py-0">
          <v-divider  :thickness="1" class="border-opacity-100 tw-mt-2 " ></v-divider>
        </v-col>
        <v-col  class="tw-flex  tw-items-center tw-gap-3 ">
          <Icon icon="icon-park-outline:ticket"  width="20"/>
          <span class="tw-font-semibold">{{data.passagem_pedidos.length}} {{data.passagem_pedidos.length > 1 ? 'passagens' : 'passagem'}}</span>
        </v-col>
        <v-col  class="tw-flex  tw-items-center justify-end tw-gap-3 ">
          <v-btn @click="onOpenRooms" variant="tonal" color="info"><Icon icon="weui:eyes-on-outlined" width="25"  class="mr-1 "/>Cômodos</v-btn>
        </v-col>
      </v-row>
    </div>
    <v-expand-transition>
      <v-row v-if="openRooms">
        <v-col cols="12" class="pb-0">
          <v-divider  :thickness="1" class="border-opacity-100  my-3 "  ></v-divider>
        </v-col>
        <v-col v-for="item in data.passagem_pedidos" cols="12" class="pt-0">
          <v-card variant="tonal" color="primary" >
            <div  class="  tw-px-2 tw-py-[2px] tw-h-full  my-1 tw-flex tw-items-center tw-justify-between">
              {{item.comodo.numeracao}} -  {{item.passageiro?.nome}}
              <Icon
                  v-if="!item.deleted_at"
                  @click="removerRoom({pedido:item.pedido_id,comodo_id:item.comodo.id,})"
                  icon="mdi:close-box" width="25"  class="mr-1 "/>
              <span v-else >Removido</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-expand-transition>
  </v-card>
</template>

<style scoped>

</style>
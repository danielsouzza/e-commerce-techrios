<script setup>

import {Icon} from "@iconify/vue";
defineProps({
    stepSale: {
        type: Number,
        default: 1
    }
})
</script>

<template>
    <div class="lg:tw-flex tw-items-center !tw-my-10  tw-hidden">
        <v-btn variant="outlined" :color="stepSale > 1 ? 'success': 'secondary'" rounded >
            <Icon icon="mingcute:ship-line" class="ml-2 tw-text-xl" />
            SELECIONE A SUA VIAGEM
        </v-btn>

        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

        <v-btn variant="outlined" :color="stepSale > 2 ? 'success' : stepSale === 2 ? 'secondary' : 'grey100'" rounded>
            <Icon icon="fluent:data-usage-edit-20-regular" class="ml-2 tw-text-xl"/>
            INFORMAR DADOS
        </v-btn>

        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

        <v-btn variant="outlined" :color="stepSale > 3 ? 'success' : stepSale === 3 ? 'secondary' : 'grey100'" rounded>
            <Icon icon="fluent:wallet-credit-card-20-regular" class="ml-2 tw-text-xl"/>
            FORMA DE PAGAMENTO
        </v-btn>

        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>

        <v-btn variant="outlined" :color="stepSale > 4 ? 'success' : stepSale === 4 ? 'secondary' : 'grey100'" rounded>
            <Icon icon="icon-park-outline:ticket" class="ml-2 tw-text-xl"/>
            CONFIRMAÇÃO DA VIAGEM
        </v-btn>
    </div>
</template>

<style scoped>

</style>

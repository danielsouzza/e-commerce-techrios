<script setup>
import { Icon } from "@iconify/vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <v-card color="primary" rounded="0" class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary">
        <strong class="tw-font-bold">Política de Exclusão de Dados</strong>
      </div>
    </div>
  </v-card>
  <v-container class=" tw-px-3">
    <v-row class="tw-mt-8 tw-gap-6">
      <v-col cols="12" md="8" class="tw-mx-auto">
        <v-card class="tw-mb-6 tw-shadow-lg tw-rounded-xl">
          <div class="tw-p-6">
            <div class="tw-flex tw-items-center tw-mb-2">
              <Icon icon="mdi:delete-outline" width="28" class="tw-mr-2 tw-text-primary" />
              <h2 class="tw-font-bold tw-text-lg tw-text-primary">Política de Exclusão de Dados</h2>
            </div>
            <v-divider class="tw-my-2" />
            <p class="tw-text-justify tw-mb-2">
              A Yjara Viagens respeita a privacidade dos seus usuários e está comprometida com a proteção dos seus dados pessoais. Esta Política de Exclusão de Dados descreve como tratamos as solicitações de exclusão de informações pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
            <p class="tw-mb-2"><strong>1. Direito de Exclusão</strong></p>
            <p class="tw-text-justify tw-mb-2">
              Você, titular dos dados, tem o direito de solicitar a exclusão dos seus dados pessoais armazenados por nós, a qualquer momento, de forma gratuita e transparente.
            </p>
            <p class="tw-mb-2"><strong>2. Como Solicitar a Exclusão</strong></p>
            <p class="tw-text-justify">
              A solicitação de exclusão de dados pessoais deve ser feita por meio do preenchimento de um formulário disponível em nosso site. Para isso, o titular deverá informar os seguintes dados:
            </p>
            <ul class="tw-list-disc tw-ml-6 tw-mb-2">
              <li>Nome completo;</li>
              <li>Telefone de contato;</li>
              <li>Endereço de e-mail utilizado no cadastro.</li>
            </ul>
            <p class="tw-text-justify tw-mb-2">
              Após o envio do formulário, nossa equipe irá analisar e processar a solicitação dentro do prazo legal.
            </p>
            <p class="tw-mb-2"><strong>3. Prazos</strong></p>
            <p class="tw-text-justify tw-mb-2">
              Após a solicitação de exclusão, confirmaremos o recebimento e processaremos o pedido dentro de até 15 dias úteis, conforme previsto em lei.
            </p>
            <p class="tw-mb-2"><strong>4. Dados que Podem Ser Retidos</strong></p>
            <p class="tw-text-justify">
              Em alguns casos, poderemos reter determinados dados mesmo após uma solicitação de exclusão, quando houver:
            </p>
            <ul class="tw-list-disc tw-ml-6 tw-mb-2">
              <li>Cumprimento de obrigações legais ou regulatórias;</li>
              <li>Exercício regular de direitos em processos judiciais, administrativos ou arbitrais;</li>
              <li>Prevenção de fraudes ou segurança dos sistemas.</li>
            </ul>
            <p class="tw-text-justify tw-mb-2">
              Nesses casos, manteremos apenas os dados estritamente necessários e pelo tempo mínimo exigido.
            </p>
            <p class="tw-mb-2"><strong>5. Exclusão Automática</strong></p>
            <p class="tw-text-justify tw-mb-2">
              Dados pessoais inativos por um período superior a 5 anos poderão ser eliminados automaticamente, salvo obrigação legal de retenção.
            </p>
            <p class="tw-mb-2"><strong>6. Atualizações</strong></p>
            <p class="tw-text-justify">
              Esta política pode ser atualizada periodicamente para refletir mudanças na legislação ou em nossas práticas de privacidade. Recomendamos a leitura frequente desta página.
            </p>
          </div>
        </v-card>
        <RouterLink :to="{ name: 'excluir-dados' }" class="tw-mt-6">
            <v-btn color="secondary" variant="outlined" rounded>
              <v-icon left>mdi-cancel</v-icon>
              Eu quero excluir meus dados
            </v-btn>
          </RouterLink>
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-12 tw-mb-8">
            
          <Icon icon="mdi:party-popper" width="48" class="tw-text-primary tw-mb-2" />
          <div class="tw-text-3xl tw-font-extrabold tw-text-primary tw-mb-1">Obrigado!</div>
          <div class="tw-text-lg tw-text-gray-700 tw-font-medium">A equipe Yjara Viagens agradece a sua confiança.</div>
          
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
</style> 
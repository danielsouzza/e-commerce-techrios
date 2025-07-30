<script setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { showSuccessNotification, showErrorNotification } from "../event-bus.js"
import { validarEmail } from "../Helper/Ultis.js"
import { routes } from "../services/fetch.js"

const router = useRouter()
const formRef = ref()

const form = reactive({
  name: "",
  telefone: "",
  email: "",
  errors: {},
  processing: false
})

function validationEmail(email) {
  return validarEmail(email) ? true : 'Email inválido'
}

function validationPhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return 'Telefone deve ter 10 ou 11 dígitos'
  }
  return true
}

function validationName(name) {
  if (!name || name.trim().length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres'
  }
  return true
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()

  if (!valid) {
    showErrorNotification('Por favor, corrija os erros no formulário')
    return
  }

  form.processing = true
  form.errors = {}

  try {
    // Preparar dados para envio
    const payload = {
      name: form.name.trim(),
      telefone: form.telefone, // Remove formatação, envia apenas números
      email: form.email.trim()
    }

    // Fazer requisição para a API
    const response = await routes['opt-out'](payload)

    showSuccessNotification('Sua solicitação de opt-out foi processada com sucesso!')

    // Limpar formulário
    form.name = ""
    form.telefone = ""
    form.email = ""

    // Redirecionar para home após alguns segundos
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 2000)

  } catch (error) {
    console.error('Erro ao processar opt-out:', error)

    // Tratar erros específicos da API
    if (error.response?.data?.errors) {
      form.errors = error.response.data.errors
      showErrorNotification('Por favor, corrija os erros no formulário')
    } else if (error.response?.data?.message) {
      showErrorNotification(error.response.data.message)
    } else {
      showErrorNotification('Erro ao processar sua solicitação. Tente novamente.')
    }
  } finally {
    form.processing = false
  }
}

function formatPhone(value) {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

function onPhoneInput(event) {
  const value = event.target.value
  form.telefone = formatPhone(value)
}
</script>

<template>
  <div class="tw-flex tw-justify-center tw-items-center  tw-py-8">
    <v-card class="tw-w-full tw-max-w-md tw-mx-4">
      <v-card-title class="text-center tw-py-6">
        <div class="tw-text-2xl tw-font-bold text-secondary">
            Quero excluir meus dados
        </div>
        <div class="tw-text-sm tw-text-gray-600 tw-mt-2">
         Exclua seus dados de nossa plataforma
        </div>
      </v-card-title>

      <v-form ref="formRef" @submit.prevent="handleSubmit" class="tw-px-6 tw-pb-6">
        <div class="tw-space-y-4">
          <div>
            <div class="text-subtitle-1 text-medium-emphasis tw-mb-2">Nome Completo</div>
            <v-text-field
              v-model="form.name"
              :rules="[validationName]"
              :error-messages="form.errors.name"
              density="compact"
              color="secondary"
              hide-details="auto"
              placeholder="Digite seu nome completo"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              required
            />
          </div>

          <div>
            <div class="text-subtitle-1 text-medium-emphasis tw-mb-2">Telefone</div>
            <v-text-field
              v-model="form.telefone"
              :rules="[validationPhone]"
              :error-messages="form.errors.telefone"
              density="compact"
              color="secondary"
              hide-details="auto"
              placeholder="(00) 00000-0000"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
              maxlength="15"
               v-mask="'(##) #####-####'"

              required
            />
          </div>

          <div>
            <div class="text-subtitle-1 text-medium-emphasis tw-mb-2">Email</div>
            <v-text-field
              v-model="form.email"
              :rules="[validationEmail]"
              :error-messages="form.errors.email"
              density="compact"
              color="secondary"
              hide-details="auto"
              placeholder="Digite seu email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              type="email"
              required
            />
          </div>
        </div>

        <div class="tw-mt-6 tw-p-4 tw-bg-orange-50 tw-rounded-lg tw-border tw-border-orange-200">
          <div class="tw-flex tw-items-start tw-space-x-2">
            <v-icon color="orange" size="20" class="tw-mt-0.5">mdi-information-outline</v-icon>
            <div class="tw-text-sm tw-text-gray-700">
              <strong>Importante:</strong> Após a solicitação de exclusão, confirmaremos o recebimento e processaremos o pedido dentro de até 15 dias úteis, conforme previsto em lei.
            </div>
          </div>
        </div>

        <v-btn
          type="submit"
          :loading="form.processing"
          :disabled="form.processing"
          color="secondary"
          size="large"
          rounded
          variant="outlined"
          block
          class="tw-mt-6"
        >
          Solicitar exclusão
        </v-btn>

        <v-card-text class="text-center tw-mt-4">
          <RouterLink :to="{ name: 'home' }">
            <div class="text-blue text-decoration-none tw-text-sm">
              <v-icon icon="mdi-chevron-left" size="small"></v-icon>
              Voltar para a página inicial
            </div>
          </RouterLink>
        </v-card-text>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
.v-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>

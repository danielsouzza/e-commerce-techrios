<template>
  <div class="pix-container">
    <div class="pix-row">
      <div class="pix-col pix-col-left">
        <img src="/assets/images/page_pix/celular.fw.png" class="pix-img-celular img-fluid" alt="Celular Pix" />
      </div>
      <div class="pix-col pix-col-center">
        <img src="/assets/images/page_pix/yjara-pix.fw.png" class="pix-logo" alt="Yjara Viagens" />
        <p class="pix-text">AGORA VOCÊ PODE COMPRAR SUA PASSAGEM PELO</p>
        <h2 class="pix-title-whatsapp">WHATSAPP</h2>
        <p class="pix-text">E PAGAR PELO</p>
        <h2 class="pix-title-pix">PIX</h2>
        <p class="pix-text">UTILIZE O QR CODE ABAIXO OU SELECIONE A CHAVE DESEJADA</p>
        <div class="pix-qrcode-btns">
          <span class="pix-qrcode">
            <img src="/assets/images/page_pix/qrcode.fw.png" alt="QR Code Pix" />
          </span>
          <div class="pix-btns">
            <div class="pix-btn-tooltip-wrapper" @mouseleave="resetTooltip">
              <button
                class="pix-btn"
                @mouseenter="showTooltip = true"
                @mouseleave="showTooltip = false"
                @click="copyCnpj"
              >
                {{ cnpj }}
              </button>
              <span
                v-show="showTooltip"
                class="pix-tooltip"
              >{{ tooltip }}</span>
            </div>
            <input type="hidden" :value="cnpj" ref="cnpjInput" />
            <button class="pix-btn" disabled>E-mail</button>
            <button class="pix-btn" disabled>Telefone</button>
          </div>
        </div>
      </div>
      <div class="pix-col pix-col-right">
        <img src="/assets/images/page_pix/lancha.fw.png" class="pix-img-lancha" alt="Lancha" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const cnpj = '08.464.939.0001-19'
const tooltip = ref('Click para copiar')
const cnpjInput = ref(null)
const showTooltip = ref(false)

function copyCnpj() {
  if (cnpjInput.value) {
    cnpjInput.value.type = 'text'
    cnpjInput.value.select()
    document.execCommand('copy')
    cnpjInput.value.type = 'hidden'
    tooltip.value = 'Copiado!!'
    showTooltip.value = true
  }
}
function resetTooltip() {
  tooltip.value = 'Click para copiar'
  showTooltip.value = false
}
</script>

<style scoped>
.pix-container {
  min-height: 100vh;
  padding: 0 100px;
  background: #2293ad;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pix-row {
  display: flex;

  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.pix-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.pix-col-left, .pix-col-right {
  flex: 1;
}
.pix-col-center {
  margin-left: 50px;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
}
.pix-logo {
  width: 230px;
  margin-bottom: 32px;
}
.pix-img-celular {
  max-width: 100%;
  height: auto;
}
.pix-img-lancha {
  max-width: 220px;
  width: 100%;
}
.pix-title-whatsapp, .pix-title-pix {
  font-weight: 900;
  font-size: 75px;
  line-height: 85%;
  margin: 0;
  color: #fff;
}
.pix-title-pix {
  margin-bottom: 16px;
}
.pix-text {
  font-weight: 400;
  font-size: 25px;
  margin: 0;
  color: #fff;
}
.pix-qrcode-btns {
  display: flex;
  align-items: flex-start;
  margin-top: 24px;
}
.pix-qrcode {
  border: 10px solid #fff;
  border-radius: 5px;
  background: #fff;
  display: inline-block;
  margin-right: 24px;
}
.pix-qrcode img {
  width: 160px;
  height: 160px;
}
.pix-btns {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  min-width: 240px;
}
.pix-btn {
  background: linear-gradient(180deg, #fff 0%, #78c3d2 100%);
  border: 0;
  font-size: 20px;
  font-weight: 900;
  color: #248BAA;
  height: 48px;
  border-radius: 10px;
  padding: 0 16px;
  margin-bottom: 0;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pix-btn:not(:last-child) {
  margin-bottom: 12px;
}
.pix-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}
.pix-btn-tooltip-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.pix-tooltip {
  position: absolute;
  left: 105%;
  top: 50%;
  transform: translateY(-50%);
  background: #222;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  pointer-events: none;
}
.img-fluid {
  max-width: 100%;
  height: auto;
  
}
@media (max-width: 1100px) {
  .pix-row {
    flex-direction: column;
    align-items: center;
  }
  .pix-col-left, .pix-col-right {
    display: none;
  }
  .pix-col-center {
    width: 100%;
    align-items: center;
  }
}
@media (max-width: 700px) {
  .pix-title-whatsapp, .pix-title-pix {
    font-size: 32px;
  }
  .pix-text {
    font-size: 16px;
  }
  .pix-logo {
    width: 180px;
  }
  .pix-qrcode img {
    width: 80px;
    height: 80px;
  }
  .pix-btns {
    min-width: 120px;
    height: 80px;
  }
  .pix-btn {
    font-size: 14px;
    height: 32px;
  }
}
</style> 
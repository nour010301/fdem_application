
<template>
  <div class="futuristic-bg">
    <!-- Animated Matrix Grid Background -->
    <div class="matrix-bg">
      <div v-for="n in 24" :key="n" class="matrix-row" :style="{ animationDelay: (n * 0.12) + 's' }">
        <span
          v-for="m in 32"
          :key="m"
          class="matrix-dot"
          :style="{ animationDelay: ((n + m) * 0.07) + 's' }"
        ></span>
      </div>
      <div class="aurora-gradient"></div>
      <div class="floating-particles">
        <span
          v-for="p in 18"
          :key="p"
          class="particle"
          :style="particleStyle(p)"
        ></span>
      </div>
    </div>
    <div class="futuristic-form-container">
      <!-- Plain Logo Image (no extra wrappers or spans or CSS) -->
      <div style="display: flex; justify-content: center; margin-bottom: 1.3rem;">
        <img :src="cosiderLogo" alt="Cosider Logo" style="max-width: 290px; max-height: 290px;" />
      </div>
      <h1 class="futuristic-title">
        <span>Connectez-vous</span>
        <span class="brand">fdem</span>
      </h1>
      <form @submit.prevent="handleLogin" novalidate>
        <div class="futuristic-form-group">
          <label for="username">Nom d’utilisateur</label>
          <div class="futuristic-input-wrapper">
            <input
              id="username"
              v-model="username"
              type="text"
              :class="{ 'input-error': usernameError }"
              autocomplete="username"
              required
              placeholder="Entrez votre nom d’utilisateur"
              @focus="playFocus"
              @focusin="scanline('user')"
              @blur="scanline('')"
            />
            <span class="scanline" :class="{ active: scanActive === 'user' }"></span>
          </div>
          <p v-if="usernameError" class="futuristic-field-error">{{ usernameError }}</p>
        </div>
        <div class="futuristic-form-group">
          <label for="password">Mot de passe</label>
          <div class="futuristic-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :class="{ 'input-error': passwordError }"
              autocomplete="current-password"
              required
              placeholder="Entrez votre mot de passe"
              @focus="playFocus"
              @focusin="scanline('pass')"
              @blur="scanline('')"
            />
            <span class="futuristic-eye" @click="showPassword = !showPassword" :title="showPassword ? 'Masquer' : 'Afficher'">
              <svg v-if="!showPassword" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="#43E97B" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3" stroke="#43E97B" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="#43E97B" stroke-width="2" d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .42-.09.82-.24 1.18"/>
                <path stroke="#43E97B" stroke-width="2" d="m1 1 22 22"/>
              </svg>
            </span>
            <span class="scanline" :class="{ active: scanActive === 'pass' }"></span>
          </div>
          <p v-if="passwordError" class="futuristic-field-error">{{ passwordError }}</p>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="futuristic-btn"
          @mousedown="liquidRipple"
          ref="liquidBtn"
        >
          <span v-if="loading" class="futuristic-loader"></span>
          <span v-else>Se connecter</span>
          <span class="btn-liquid"></span>
        </button>
        <span class="btn-particles" ref="btnParticles"></span>
        <p v-if="error" class="futuristic-error">{{ error }}</p>
      </form>
      <audio ref="focusSound" src="https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae7e8.mp3" preload="auto"></audio>
      <audio ref="rippleSound" src="https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae7e8.mp3" preload="auto"></audio>
    </div>

    <!-- OTP Modal -->
    <div v-if="showOtpModal" class="otp-modal-backdrop">
      <div class="otp-modal">
        <div class="otp-modal-header">
          <h3>Vérification en deux étapes</h3>
          <button @click="closeOtpModal" class="close-btn">&times;</button>
        </div>
        <div class="otp-modal-body">
          <p>Un code à 6 chiffres a été envoyé à votre email.</p>
          <div class="otp-input-group">
            <label for="otp-code">Code de vérification</label>
            <input
              id="otp-code"
              v-model="otpCode"
              type="text"
              maxlength="6"
              placeholder="000000"
              :class="{ 'input-error': otpError }"
              @keyup.enter="handleOtpSubmit"
            />
          </div>
          <p v-if="otpError" class="otp-error">{{ otpError }}</p>
          <button
            @click="handleOtpSubmit"
            :disabled="otpLoading"
            class="otp-submit-btn"
          >
            <span v-if="otpLoading" class="otp-loader"></span>
            <span v-else>Vérifier</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import cosiderLogo from '../assets/cosiderLogo.png'
import instance from '../axios.ts'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const usernameError = ref('')
const passwordError = ref('')
const showPassword = ref(false)
const scanActive = ref('')
const focusSound = ref<HTMLAudioElement | null>(null)
const rippleSound = ref<HTMLAudioElement | null>(null)
const liquidBtn = ref<HTMLElement | null>(null)
const btnParticles = ref<HTMLElement | null>(null)

// OTP Modal state
const showOtpModal = ref(false)
const otpCode = ref('')
const otpError = ref('')
const otpLoading = ref(false)

// For lively particles
// const particleStates = ref(
//   Array.from({ length: 18 }, (_, i) => ({
//     angle: Math.random() * Math.PI * 2,
//     speed: 0.008 + Math.random() * 0.012,
//     radius: 38 + Math.random() * 22,
//     baseX: 50 + Math.random() * 30 - 15,
//     baseY: 50 + Math.random() * 30 - 15,
//     size: 6 + Math.random() * 10,
//     dur: 7 + Math.random() * 6,
//     phase: Math.random() * Math.PI * 2,
//   }))
// )

const particleStates = ref(
  Array.from({ length: 18 }, (_, ) => ({
    angle: Math.random() * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.012,
    radius: 38 + Math.random() * 22,
    baseX: 50 + Math.random() * 30 - 15,
    baseY: 50 + Math.random() * 30 - 15,
    size: 6 + Math.random() * 10,
    dur: 7 + Math.random() * 6,
    phase: Math.random() * Math.PI * 2,
  }))
)



function animateParticles() {
  const now = Date.now() / 1000
  particleStates.value.forEach((p, i) => {
    p.angle += p.speed
    // lively, elliptical orbits with a little bounce
    p.baseX += Math.sin(now * 0.2 + i) * 0.01
    p.baseY += Math.cos(now * 0.18 + i) * 0.01
  })
  requestAnimationFrame(animateParticles)
}
onMounted(() => {
  animateParticles()
})

const handleLogin = async () => {
  error.value = ''
  usernameError.value = ''
  passwordError.value = ''

  let valid = true
  if (!username.value.trim()) {
    usernameError.value = 'Veuillez entrer votre nom d’utilisateur'
    valid = false
  }
  if (!password.value.trim()) {
    passwordError.value = 'Veuillez entrer votre mot de passe'
    valid = false
  }
  if (!valid) return

  loading.value = true

  try {
    // Step 1: Send username and password
    await instance.post('/api/login-step1/', {
      username: username.value,
      password: password.value
    })

    // Show OTP modal
    showOtpModal.value = true
    loading.value = false

  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      error.value = "Nom d'utilisateur ou mot de passe incorrect."
    } else {
      error.value = 'Erreur de connexion. Veuillez réessayer.'
    }
    loading.value = false
  }
}


function playFocus() {
  if (focusSound.value) {
    focusSound.value.currentTime = 0
    focusSound.value.volume = 0.13
    focusSound.value.play().catch(() => {})
  }
}
function playRipple() {
  if (rippleSound.value) {
    rippleSound.value.currentTime = 0
    rippleSound.value.volume = 0.09
    rippleSound.value.play().catch(() => {})
  }
}
function scanline(which: string) {
  scanActive.value = which
}

// Button Liquid Ripple + Particle Burst
// function liquidRipple(e: MouseEvent) {
//   playRipple()
//   const btn = liquidBtn.value
//   if (!btn) return
//   let ripple = btn.querySelector('.liquid-ripple')
//   if (ripple) ripple.remove()
//   ripple = document.createElement('span')
//   ripple.className = 'liquid-ripple'
//   const rect = btn.getBoundingClientRect()
//   const size = Math.max(rect.width, rect.height)
//   btn.appendChild(ripple)
//   setTimeout(() => ripple && ripple.remove(), 700)
  
//   const burst = btnParticles.value
//   if (burst) {
//     burst.classList.remove('burst')
//     void burst.offsetWidth 
//     burst.classList.add('burst')
//   }
// }
function liquidRipple(_e: MouseEvent) {
  playRipple()
  const btn = liquidBtn.value
  if (!btn) return
  let ripple = btn.querySelector('.liquid-ripple')
  if (ripple) ripple.remove()
  ripple = document.createElement('span')
  ripple.className = 'liquid-ripple'
  // const rect = btn.getBoundingClientRect()
  // const size = Math.max(rect.width, rect.height)
  btn.appendChild(ripple)
  setTimeout(() => ripple && ripple.remove(), 700)
  
  const burst = btnParticles.value
  if (burst) {
    burst.classList.remove('burst')
    void burst.offsetWidth 
    burst.classList.add('burst')
  }
}
// Animated particles for background
const handleOtpSubmit = async () => {
  otpError.value = ''
  
  if (!otpCode.value.trim() || otpCode.value.length !== 6) {
    otpError.value = 'Veuillez entrer le code à 6 chiffres'
    return
  }

  otpLoading.value = true

  try {
    // Step 2: Send username and OTP code
    const response = await instance.post('/api/login-step2/', {
      username: username.value,
      code: otpCode.value
    })

    const { access, refresh } = response.data

    // Save tokens in localStorage
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)

    playRipple()
    showOtpModal.value = false

    // Redirect to the home page after animation
    setTimeout(() => {
      router.push({ name: 'Accueil' })
    }, 900)

  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      otpError.value = 'Code incorrect ou expiré'
    } else {
      otpError.value = 'Erreur de vérification. Veuillez réessayer.'
    }
  } finally {
    otpLoading.value = false
  }
}

const closeOtpModal = () => {
  showOtpModal.value = false
  otpCode.value = ''
  otpError.value = ''
}

function particleStyle(n: number) {
  const p = particleStates.value[n - 1]
  const x = p.baseX + Math.cos(p.angle + p.phase) * p.radius
  const y = p.baseY + Math.sin(p.angle + p.phase) * (p.radius * 0.7)
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${p.size}px`,
    height: `${p.size}px`,
    animationDuration: `${p.dur}s`
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* --- Keep all previous styles, but REMOVE all logo/orb/holo/beam-related selectors! --- */
/* No .holo-logo, .holo-orb, .orb-glass, .holo-beam, .holo-shine, etc. */

/* Use a dark blues gradient for background, like sidebar */
.futuristic-bg {
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, #16213e 75%, #1a237e 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  position: relative;
}

/* Matrix, aurora remain for animation, but update colors below */
.matrix-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.matrix-row {
  display: flex;
  height: 2.5vh;
  justify-content: center;
  align-items: center;
  animation: matrixRowWave 4s infinite alternate;
}
@keyframes matrixRowWave {
  0% { transform: translateY(0);}
  50% { transform: translateY(-8px);}
  100% { transform: translateY(0);}
}
.matrix-dot {
  width: 4px;
  height: 4px;
  margin: 0 7px;
  border-radius: 50%;
  background: rgba(144,202,249,0.10);
  animation: matrixDotAnim 2.5s infinite alternate;
}
@keyframes matrixDotAnim {
  0% { opacity: 0.18; }
  50% { opacity: 0.7; }
  100% { opacity: 0.18; }
}
.aurora-gradient {
  position: absolute;
  left: 0; top: 0; width: 100%; height: 100%;
  background: linear-gradient(120deg, #1a237e55 0%, #2196F377 70%, #43E97B22 100%);
  opacity: 0.55;
  z-index: 1;
  pointer-events: none;
  animation: auroraShift 8s infinite alternate, auroraHue 16s infinite alternate;
  filter: blur(12px);
}
@keyframes auroraShift {
  0% { transform: translateY(0);}
  100% { transform: translateY(-24px);}
}
@keyframes auroraHue {
  0% { filter: hue-rotate(0deg);}
  100% { filter: hue-rotate(40deg);}
}

.floating-particles {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0; left: 0;
  z-index: 2;
  pointer-events: none;
}
.particle {
  position: absolute;
  background: linear-gradient(135deg, #2196F3 0%, #90caf9 100%);
  border-radius: 50%;
  opacity: 0.15;
  animation: particleFloat linear infinite;
}
@keyframes particleFloat {
  0% { filter: blur(0px);}
  50% { filter: blur(4px);}
  100% { filter: blur(0px);}
}

/* --- MODERNIZED FORM --- */
.futuristic-form-container {
  z-index: 10;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  padding: 2.7rem 2.2rem 2.2rem 2.2rem;
  background: linear-gradient(135deg, #16213ee9 75%, #1a237eea 100%);
  border: 2.5px solid #232f4bcc;
  border-radius: 32px;
  box-shadow: 0 8px 40px 0 #16213e33, 0 2px 16px 0 #2196f366;
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  box-sizing: border-box;
  overflow: visible;
  margin-top: 2vh;
}

/* Title styles (unchanged) */
.futuristic-title {
  text-align: center;
  margin-bottom: 2.1rem;
  color: #90caf9;
  font-size: 2.1rem;
  font-weight: 780;
  letter-spacing: 1.2px;
  position: relative;
  text-shadow: 0 2px 10px #1a237e66, 0 1px 0px #232f4b;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}
.brand {
  color: #2196F3;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px #2196f388;
  font-size: 2.1rem;
}

/* Inputs - blue accent */
.futuristic-form-group {
  margin-bottom: 1.35rem;
  z-index: 4;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #90caf9;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.futuristic-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.futuristic-input-wrapper input {
  width: 100%;
  padding: 0.7rem 2.2rem 0.7rem 1.1rem;
  border: none;
  border-bottom: 2.5px solid #2196F3;
  border-radius: 0;
  font-size: 1.07rem;
  background: rgba(34,47,75,0.18);
  color: #e3eafc;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  outline: none;
  font-family: inherit;
  box-shadow: 0 1px 2px 0 rgba(33,47,75,0.10);
  backdrop-filter: blur(2px);
  position: relative;
  z-index: 2;
}
.futuristic-input-wrapper input:focus {
  border-color: #90caf9;
  background: rgba(26,35,126,0.14);
  box-shadow: 0 0 10px 0 #2196F366;
}
.input-error {
  border-color: #E53935 !important;
  background: rgba(229,57,53,0.06);
}
.futuristic-input-wrapper input::placeholder {
  color: #90caf9a0;
  opacity: 1;
}
.futuristic-eye {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  opacity: 0.85;
  z-index: 3;
  transition: opacity 0.2s;
}
.futuristic-eye:hover {
  opacity: 1;
}
/* Scanline Animation: blue shades */
.scanline {
  position: absolute;
  left: 0; bottom: 0;
  width: 100%;
  height: 2.5px;
  background: linear-gradient(90deg, #2196F3 0%, #90caf9 100%);
  opacity: 0;
  transform: scaleX(0);
  transition: opacity 0.2s, transform 0.4s cubic-bezier(.77,0,.18,1);
  z-index: 4;
  pointer-events: none;
}
.scanline.active {
  opacity: 1;
  transform: scaleX(1);
  animation: scanSweep 1.1s cubic-bezier(.77,0,.18,1);
}
@keyframes scanSweep {
  0% { opacity: 0; transform: scaleX(0);}
  30% { opacity: 1; transform: scaleX(1.1);}
  100% { opacity: 1; transform: scaleX(1);}
}

.futuristic-field-error {
  color: #E53935;
  font-size: 0.97rem;
  margin-top: 0.3rem;
  margin-bottom: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(229,57,53,0.09);
}

/* Button: blue gradient, blue shadows, like active nav-link */
.futuristic-btn {
  width: 100%;
  padding: 1.05rem;
  background: linear-gradient(90deg, #2196F3 0%, #16213e 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.18rem;
  cursor: pointer;
  margin-top: 0.7rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7em;
  position: relative;
  overflow: hidden;
  z-index: 4;
  box-shadow: 0 2px 18px 0 #2196f366, 0 2px 8px 0 #16213e44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  outline: none;
  animation: morphGradient 3.5s infinite alternate;
}
@keyframes morphGradient {
  0% { background: linear-gradient(90deg, #2196F3 0%, #16213e 100%);}
  50% { background: linear-gradient(120deg, #90caf9 0%, #232f4b 100%);}
  100% { background: linear-gradient(90deg, #2196F3 0%, #16213e 100%);}
}
.futuristic-btn:active {
  background: linear-gradient(90deg, #232f4b 0%, #1a237e 100%);
  transform: scale(0.98);
}
.futuristic-btn:disabled {
  background: #4e5c7e;
  cursor: not-allowed;
  opacity: 0.7;
}
/* Button liquid/shine blue */
.btn-liquid {
  position: absolute;
  left: 0; top: 0; width: 100%; height: 100%;
  border-radius: 12px;
  pointer-events: none;
  background: linear-gradient(120deg, #2196F366 0%, #90caf966 100%);
  opacity: 0.3;
  filter: blur(8px);
  z-index: 0;
  animation: btnLiquidGlow 2.5s infinite alternate;
}
@keyframes btnLiquidGlow {
  0% { opacity: 0.2; }
  100% { opacity: 0.5; }
}
/* Liquid Ripple - blue glow */
.liquid-ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #2196F3 60%, transparent 100%);
  transform: scale(0);
  animation: liquidRippleAnim 0.7s linear;
  pointer-events: none;
  z-index: 10;
}
@keyframes liquidRippleAnim {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
/* Particle Burst on Button - blue */
.btn-particles {
  position: absolute;
  left: 50%; top: 50%;
  width: 0; height: 0;
  pointer-events: none;
  z-index: 20;
}
.btn-particles.burst::before,
.btn-particles.burst::after {
  content: '';
  position: absolute;
  left: -12px; top: -12px;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #2196F3 0%, #90caf9 80%, transparent 100%);
  opacity: 0.8;
  animation: burstAnim 0.7s linear;
}
.btn-particles.burst::after {
  left: -20px; top: -20px;
  width: 40px; height: 40px;
  opacity: 0.35;
  animation-delay: 0.08s;
}
@keyframes burstAnim {
  0% { opacity: 0.65; transform: scale(0);}
  80% { opacity: 0.18; transform: scale(1.5);}
  100% { opacity: 0; transform: scale(2);}
}

.futuristic-loader {
  border: 2.5px solid #16213e;
  border-top: 2.5px solid #2196F3;
  border-radius: 50%;
  width: 1.1em;
  height: 1.1em;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.futuristic-error {
  color: #E53935;
  margin-top: 1.25rem;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: rgba(229,57,53,0.07);
  border-radius: 4px;
  padding: 0.5em 0.7em;
  box-shadow: 0 1.5px 4px 0 #232f4b22;
  z-index: 4;
}

@media (max-width: 600px) {
  .futuristic-form-container {
    padding: 1.3rem 0.5rem 1.1rem 0.5rem;
    border-radius: 18px;
    max-width: 98vw;
  }
  .futuristic-title {
    font-size: 1.3rem;
  }
}

/* OTP Modal Styles */
.otp-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(22, 33, 62, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.otp-modal {
  background: linear-gradient(135deg, #16213ee9 75%, #1a237eea 100%);
  border: 2px solid #232f4bcc;
  border-radius: 20px;
  padding: 3rem;
  max-width: 550px;
  width: 90%;
  min-height: 350px;
  box-shadow: 0 8px 40px 0 #16213e33;
  color: #e3eafc;
}

.otp-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.otp-modal-header h3 {
  color: #90caf9;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #90caf9;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.otp-modal-body p {
  color: #bbdefb;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.5;
}

.otp-input-group {
  margin-bottom: 1.5rem;
}

.otp-input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #90caf9;
  font-weight: 600;
}

.otp-input-group input {
  width: 100%;
  padding: 1.2rem;
  border: 2px solid #2196F3;
  border-radius: 8px;
  background: rgba(34, 47, 75, 0.3);
  color: #e3eafc;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.3em;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.otp-input-group input:focus {
  border-color: #90caf9;
  box-shadow: 0 0 10px 0 #2196F366;
}

.otp-error {
  color: #E53935;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.otp-submit-btn {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(90deg, #2196F3 0%, #16213e 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s;
  margin-top: 1rem;
}

.otp-submit-btn:hover {
  background: linear-gradient(90deg, #90caf9 0%, #232f4b 100%);
}

.otp-submit-btn:disabled {
  background: #4e5c7e;
  cursor: not-allowed;
  opacity: 0.7;
}

.otp-loader {
  border: 2px solid #16213e;
  border-top: 2px solid #2196F3;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.7s linear infinite;
}

</style>

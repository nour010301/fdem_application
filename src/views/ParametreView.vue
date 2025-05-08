
<template>
  <div class="param-settings-page">
    <div class="decor-accent"></div>
    <h1 class="title">Paramètres</h1>
    
    <!-- Contact Information Section -->
    <section class="info-card glass">
      <h2 class="section-title">
        Informations de contact
      </h2>
      <div class="info-row">
        <span class="info-label">Gmail :</span>
        <span class="info-value">yourname@gmail.com</span>
      </div>
      <div class="info-row">
        <span class="info-label">Numéro de téléphone :</span>
        <span class="info-value">+213 6 00 00 00 00</span>
      </div>
    </section>

    <!-- File Rules Section -->
    <section class="info-card glass">
      <h2 class="section-title">
        Règles de fichiers
      </h2>
      <div class="info-row">
        <span class="info-label">Types de fichiers acceptés :</span>
        <span class="info-value accent">pdf, dwg, docx</span>
      </div>
      <div class="info-row">
        <span class="info-label">Taille maximale autorisée :</span>
        <span class="info-value">20 MB</span>
      </div>
      <div class="info-row">
        <span class="info-label">Format recommandé du nom de fichier :</span>
        <span class="info-value">[code]-[date]-[type].pdf</span>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
// Static display page
</script>

<style scoped>
.param-settings-page {
  max-width: 960px;
  margin: 0.5rem auto 0 auto;
  padding: 1.2rem 2.5rem;
  background: linear-gradient(117deg, #181e3e 57%, #283a77 140%);
  border-radius: 2.2em;
  border: 2px solid #23305b;
  min-height: 88vh;
  box-shadow: 0 18px 90px 4px rgba(20,33,65,0.26);
  position: relative;
  z-index: 1;
}

.decor-accent {
  width: 80px;
  height: 5px;
  background: linear-gradient(90deg, #3ff780, #2196f3 60%, #5e69ff 100%);
  border-radius: 99px;
  margin: 0 auto 2rem auto;
  box-shadow: 0 2px 14px #2196f355;
}

.title {
  color: #90caf9;
  font-size: 2.9em;
  font-weight: 900;
  letter-spacing: 0.04em;
  margin-bottom: 2.85rem;
  text-align: center;
  text-shadow: 0 8px 32px #1a237e88, 0 1.5px 0 #212427;
}

.info-card {
  position: relative;
  background: linear-gradient(112deg, #1c2a55e6 68%, #223baed7 160%);
  border-radius: 1.7em;
  padding: 2.7em 2.4em 2.2em 2.4em;
  margin-bottom: 2.6rem;
  border: 1.6px solid #2196f388;
  box-shadow: 0 2px 40px 0 #181e3e39;
  overflow: hidden;
  transition: box-shadow 0.25s;
}
.info-card.glass {
  backdrop-filter: blur(9px) saturate(140%);
  -webkit-backdrop-filter: blur(9px) saturate(140%);
  background: linear-gradient(112deg, #19224a80 74%, #1849b36c 160%);
  border: 2.2px solid #2196f377;
  box-shadow: 0 8px 48px 0 #2196f31a, 0 1.5px 6px 0 #3ff78022;
}

.info-card:before {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 1.9em;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(125deg, #3ff78088, #2196f388 46%, #90caf966 100%);
  opacity: 0.085;
  filter: blur(2.5px);
}

.section-title {
  color: #90caf9;
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 2.2em;
  letter-spacing: 0.012em;
  border-left: 5px solid #3ff780;
  padding-left: 1.3em;
  text-shadow: 0 3px 20px #1a237e1a;
  background: linear-gradient(90deg, #1a237e10 50%, transparent 100%);
  border-radius: 0.3em;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 2.6em;
  margin-bottom: 2.1em;
  font-size: 1.34em;
}
.info-label {
  font-weight: 600;
  color: #e2f0fb;
  min-width: 270px;
  letter-spacing: 0.01em;
  font-size: 1em;
}
.info-value {
  color: #ffffff;
  font-weight: 400;
  font-size: 1em;
  text-shadow: 0 0.5px 1px #1a237e44;
}
.info-value.accent {
  color: #3ff780;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 16px #3ff78033;
}
@media (max-width: 1200px) {
  .param-settings-page {
    max-width:98vw;
    padding: 2.3rem 0.7rem;
    border-radius: 1.3em;
  }
  .info-card {
    padding: 2em 1.2em 1em 1.2em;
    border-radius: 1em;
  }
  .info-row {
    font-size: 1.05em;
    gap: 1em;
  }
}
@media (max-width: 700px) {
  .param-settings-page {
    /* Mobile styles */
    max-width: 99vw;
    padding: 1.1rem 0.1rem;
    border-radius: 0.6em;
  }
  .decor-accent {
    width: 54px;
    margin-bottom: 1.3rem;
  }
  .title {
    font-size: 2em;
    margin-bottom: 1.2rem;
  }
  .info-card {
    padding: 1.2em 0.7em 0.8em 0.7em;
    margin-bottom: 1.2em;
  }
  .section-title {
    font-size: 1em;
    padding-left: 0.8em;
    margin-bottom: 1em;
  }
  .info-row {
    flex-direction: column;
    gap: 0.31em;
    margin-bottom: 0.7em;
    font-size: 0.95em;
  }
  .info-label {
    min-width: unset;
    font-size: 1em;
  }
}
</style>

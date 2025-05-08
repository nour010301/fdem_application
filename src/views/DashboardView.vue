<template>
  <div class="dashboard-root">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Tableau de bord</h1>
      <div class="dashboard-search">
        <input type="search" placeholder="🔎 Rechercher un document..." />
      </div>
    </div>
    <div class="dashboard-grid">
      <!-- Global Stats Cards -->
      <div class="stat-card glass">
        <div class="stat-label">Total documents</div>
        <div class="stat-value accent-blue">256</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">PDF</div>
        <div class="stat-value">140</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">DWG</div>
        <div class="stat-value">90</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">DOCX</div>
        <div class="stat-value">26</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">En erreur ou manquant</div>
        <div class="stat-value accent-red">4</div>
      </div>

      <!-- Placeholder for Graph -->
      <div class="chart-card glass">
        <div class="chart-title">Répartition par structure/type (graphique)</div>
        <div class="chart-placeholder">
          <span>📊</span>
          <em>Graphique à venir...</em>
        </div>
      </div>
    </div>

    <!-- Recent Documents Row -->
    <div class="dashboard-section">
      <h2 class="section-title">Derniers documents ajoutés</h2>
      <div class="recent-docs-list">
        <div class="doc-item">
          <span class="doc-type pdf">PDF</span>
          Cahier des charges - Projet X
          <span class="doc-date">19 juin 2024</span>
        </div>
        <div class="doc-item">
          <span class="doc-type dwg">DWG</span>
          Plan archi. Bâtiment Z
          <span class="doc-date">18 juin 2024</span>
        </div>
        <div class="doc-item">
          <span class="doc-type docx">DOCX</span>
          Rapport bilan annuel
          <span class="doc-date">16 juin 2024</span>
        </div>
      </div>
    </div>

    <!-- User Activity Feed -->
    <div class="dashboard-section">
      <h2 class="section-title">Dernières actions des utilisateurs</h2>
      <div class="activity-list">
        <div class="activity-item">
          <span class="activity-icon added">➕</span>
          <span><b>Souad</b> a ajouté <b>Plan DWG</b></span>
          <span class="activity-date">il y a 3 min</span>
        </div>
        <div class="activity-item">
          <span class="activity-icon deleted">🗑️</span>
          <span><b>Youcef</b> a supprimé <b>Ancien rapport</b></span>
          <span class="activity-date">il y a 28 min</span>
        </div>
        <div class="activity-item">
          <span class="activity-icon edited">✏️</span>
          <span><b>Lina</b> a modifié <b>Cahier des charges</b></span>
          <span class="activity-date">il y a 1 h</span>
        </div>
      </div>
    </div>

    <!-- Expired/To Archive, Alerts -->
    <div class="dashboard-section warnings-card glass">
      <h2 class="section-title warn-title">Documents à archiver / expirés</h2>
      <ul class="warnings-list">
        <li>
          <b>Contrat-Client2021.pdf</b> : Expiré le 14/06/2024 <span class="exp-badge">Expiré</span>
        </li>
        <li>
          <b>NoteProjetX.docx</b> : Expire bientôt <span class="exp-badge soon">À archiver</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Still static/demo, waiting for backend connectivity
</script>

<style scoped>
.dashboard-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 3rem max(2vw, 25px);
  box-sizing: border-box;
  border-radius: 0;
  background: linear-gradient(120deg,#181e3e 60%, #243a77 120%);
  box-shadow: none;
  position: relative;
  z-index: 1;
  /* Do NOT force overflow-x: hidden, allows horizontal scrolling if any content would overflow */
}

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.2em;
}

.dashboard-title {
  color: #90caf9;
  font-size: 2.3em;
  font-weight: 900;
  letter-spacing: 0.02em;
  margin-bottom: 0.2em;
  text-shadow: 0 6px 32px #1a237e77, 0 1px 0 #212427;
}

.dashboard-search input[type="search"] {
  padding: 0.7em 1.7em 0.7em 0.9em;
  border-radius: 1em;
  border: 1.4px solid #2196f360;
  background: linear-gradient(90deg, #1a237e50 10%, #243a7740 100%);
  color: #c6e2fa;
  font-size: 1.08em;
  width: 260px;
  min-width: 170px;
  max-width: 100%;
  outline: none;
  transition: border-color 0.22s;
  box-shadow: 0px 2px 9px 0 #1a237e0e;
}
.dashboard-search input[type="search"]:focus {
  border-color: #2196F3;
  background: #232f4b90;
  color: #fff;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.3rem;
  margin-bottom: 2.3rem;
  width: 100%;
  /* If grid overflows in X, allow scroll (e.g., small screens) */
  overflow-x: auto;
  box-sizing: border-box;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(115deg,#223361cc 65%, #26377eaa 120%);
  padding: 1.6em 1.8em;
  border-radius: 1.2em;
  box-shadow: 0 0.8px 14px 0 #283b7a29;
  border: 1.2px solid #2196f345;
  align-items: flex-start;
  min-width: 0;
  word-break: break-word;
}
.stat-card.glass {
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
}
.stat-label {
  font-weight: 600;
  font-size: 1.07em;
  color: #90caf9;
  margin-bottom: 0.5em;
}
.stat-value {
  font-size: 1.9em;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.025em;
  margin-bottom: 0.05em;
}
.stat-value.accent-blue {
  color: #2196F3;
  text-shadow: 0 7px 18px #2196f344, 0 1px 0 #3ff78013;
}
.stat-value.accent-red {
  color: #ff6b6b;
  text-shadow: 0 2px 12px #ff6b6b29;
}

.chart-card {
  min-height: 170px;
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.chart-title {
  font-weight: bold;
  color: #90caf9;
  margin-bottom: 0.6em;
  font-size: 1.04em;
}
.chart-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1.1em;
  color: #bbb;
  font-size: 1.3em;
  font-style: italic;
  justify-content: center;
  opacity: 0.75;
}

.dashboard-section {
  margin-bottom: 2.5em;
  background: linear-gradient(99deg,#232f4bdd 90%, #243a7710 130%);
  border-radius: 1.3em;
  padding: 2em;
  box-shadow: 0 1.5px 16px 0 #18306a33;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}

.section-title {
  color: #90caf9;
  font-size: 1.25em;
  font-weight: 800;
  border-left: 4px solid #3ff780;
  padding-left: 0.9em;
  margin-bottom: 1.4em;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 9px #1a237e25;
}

.recent-docs-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.doc-item {
  display: flex;
  align-items: center;
  gap: 1.2em;
  background: #181e3e55;
  border-radius: 0.8em;
  padding: 0.7em 1em;
  color: #e2f0fb;
  font-size: 1.08em;
  border: 1px solid #2196f325;
  box-shadow: 0 1px 6px 0 #1a237e22;
  min-width: 0;
  word-break: break-word;
}
.doc-type {
  border-radius: 0.5em;
  color: #fff;
  font-weight: bold;
  font-size: 0.98em;
  padding: 0.2em 0.8em;
  margin-right: 0.4em;
  background: #2196f3bb;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 8px #1a237e44;
}
.doc-type.pdf { background: #2196F3; }
.doc-type.dwg { background: #3ff780; color: #212; }
.doc-type.docx { background: #ffb74d; color: #212; }

.doc-date {
  margin-left: auto;
  color: #b5d6fa;
  font-size: 0.93em;
  font-style: italic;
  font-weight: 400;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 1em;
  background: #22336166;
  border-radius: 0.8em;
  padding: 0.7em 1em;
  color: #e9fafc;
  font-size: 1.07em;
  border: 1px solid #2196f318;
  box-shadow: 0 1px 6px 0 #1a237e19;
  min-width: 0;
  word-break: break-word;
}
.activity-icon {
  font-size: 1.45em;
  padding-right: 0.3em;
  filter: drop-shadow(0 0 8px #1a237e24);
}
.activity-icon.added { color: #3ff780;}
.activity-icon.deleted { color: #ff6b6b;}
.activity-icon.edited { color: #90caf9;}

.activity-date {
  margin-left: auto;
  color: #b5d6fa;
  font-size: 0.93em;
  font-style: italic;
  font-weight: 400;
}

.warnings-card {
  background: linear-gradient(102deg, #2e3d52ee 79%, #1a237e55 140%);
  color: #ffebee;
  box-shadow: 0 0.5px 8px 0 #ff6b6b38;
  border: 1.6px solid #ff6b6b56;
}
.warn-title {
  color: #ffbebe;
  border-left: 4px solid #ff6b6b;
}
.warnings-list {
  margin: 0.7em 0 0 0.5em;
  padding-left: 1em;
}
.exp-badge {
  background: #ff6b6b;
  color: #fff;
  border-radius: 0.5em;
  font-size: 0.85em;
  padding: 0.1em 0.7em;
  margin-left: 1.1em;
}
.exp-badge.soon {
  background: #ffb74d;
  color: #273;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .dashboard-root {
    padding: 1.4rem 0.22rem;
  }
  .dashboard-header {
    flex-direction: column;
    gap: 1.2em;
    align-items: stretch;
  }
  .dashboard-search input[type="search"] {
    width: 100%;
    min-width: 0;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 700px) {
  .dashboard-root {
    padding: 0.6rem 0.02rem;
  }
  .dashboard-title {
    font-size: 1.18em;
  }
  .dashboard-section,
  .chart-card {
    padding: 1.1em 0.6em;
    border-radius: 0.5em;
    font-size: 0.90em;
  }
  .doc-item,
  .activity-item {
    font-size: 0.9em;
    border-radius: 0.36em;
    padding: 0.5em 0.4em;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 0.7em;
  }
}
</style>
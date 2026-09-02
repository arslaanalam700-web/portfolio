/**
 * ARSLAAN ALAM PORTFOLIO - LIVE DATA LAB & PLAYGROUND
 * Interactive Analytics Simulation, Real-time SVG Chart Generator & Dynamic SQL Engine
 */

(function () {
  const labTabs = document.querySelectorAll('.lab-tab');
  const labTerminalSelect = document.getElementById('lab-terminal');
  const labSeasonSelect = document.getElementById('lab-season');
  const labGranularitySelect = document.getElementById('lab-granularity');
  const labLoadSlider = document.getElementById('lab-load-slider');
  const labLoadValDisplay = document.getElementById('lab-load-val');
  const labThresholdSlider = document.getElementById('lab-threshold-slider');
  const labThresholdValDisplay = document.getElementById('lab-threshold-val');

  // KPI Elements
  const kpiCapacity = document.getElementById('kpi-capacity');
  const kpiCongestion = document.getElementById('kpi-congestion');
  const kpiOli = document.getElementById('kpi-oli');
  const chartWrapper = document.getElementById('lab-chart-svg');
  const sqlPreview = document.getElementById('sql-code-preview');

  if (!labLoadSlider) return;

  let currentTab = 'ferry';

  // Sound trigger helper if available
  function playTickSound() {
    if (window.PortfolioAudio && typeof window.PortfolioAudio.tick === 'function') {
      window.PortfolioAudio.tick();
    }
  }

  function updateFerrySimulation() {
    const terminal = labTerminalSelect ? labTerminalSelect.value : 'Jack Layton Ferry Terminal';
    const season = labSeasonSelect ? labSeasonSelect.value : 'Summer';
    const granularity = labGranularitySelect ? labGranularitySelect.value : 'Hourly';
    const load = parseInt(labLoadSlider.value, 10);
    const threshold = parseInt(labThresholdSlider.value, 10);

    if (labLoadValDisplay) labLoadValDisplay.textContent = `${load.toLocaleString()} pax`;
    if (labThresholdValDisplay) labThresholdValDisplay.textContent = `${threshold}%`;

    // Capacity calculations
    let baseCapacity = 3200;
    if (terminal.includes('Centre Island')) baseCapacity = 4000;
    if (terminal.includes('Hanlan')) baseCapacity = 2400;
    if (terminal.includes('Ward')) baseCapacity = 2100;

    let seasonMultiplier = 1.0;
    if (season === 'Summer') seasonMultiplier = 1.35;
    else if (season === 'Winter') seasonMultiplier = 0.55;
    else seasonMultiplier = 0.9;

    const adjustedLoad = Math.round(load * seasonMultiplier);
    const utilRatio = Math.min(130, Math.round((adjustedLoad / baseCapacity) * 100));
    
    // Congestion Pressure Index (0-100)
    let congestionIndex = Math.min(100, Math.max(12, Math.round((utilRatio / threshold) * 72)));
    let peakOLI = (adjustedLoad / baseCapacity).toFixed(2);

    // Update KPI Displays
    if (kpiCapacity) {
      kpiCapacity.textContent = `${utilRatio}%`;
      kpiCapacity.style.color = utilRatio > threshold ? '#ef4444' : '#38bdf8';
    }
    if (kpiCongestion) {
      kpiCongestion.textContent = `${congestionIndex}/100`;
      kpiCongestion.style.color = congestionIndex > 80 ? '#f59e0b' : '#10b981';
    }
    if (kpiOli) {
      kpiOli.textContent = `${peakOLI}x`;
      kpiOli.style.color = peakOLI >= 1.0 ? '#ef4444' : '#e2e8f0';
    }

    // Generate dynamic SVG chart
    renderFerryChart(utilRatio, threshold, granularity);

    // Update Dynamic SQL query preview
    renderSqlQuery(terminal, season, granularity, threshold, adjustedLoad);
  }

  function renderFerryChart(utilRatio, threshold, granularity) {
    if (!chartWrapper) return;

    const pointsCount = granularity === '15-min' ? 16 : (granularity === 'Hourly' ? 12 : 7);
    const width = 680;
    const height = 170;
    const padding = 25;

    // Generate pseudo-realistic time-series curve based on user load
    const data = [];
    for (let i = 0; i < pointsCount; i++) {
      // bell curve peaking in afternoon
      const normalizedX = (i - pointsCount / 2) / (pointsCount / 3);
      const bell = Math.exp(-0.5 * normalizedX * normalizedX);
      const randomNoise = (Math.sin(i * 1.5) * 0.15) + (Math.cos(i * 2.2) * 0.08);
      const val = Math.max(10, Math.min(125, Math.round(utilRatio * (0.35 + bell * 0.75 + randomNoise))));
      data.push(val);
    }

    const stepX = (width - padding * 2) / (pointsCount - 1);
    let pathD = `M ${padding} ${height - padding - (data[0] / 130) * (height - padding * 2)}`;
    let areaD = `M ${padding} ${height - padding} L ${padding} ${height - padding - (data[0] / 130) * (height - padding * 2)}`;

    for (let i = 1; i < pointsCount; i++) {
      const x = padding + i * stepX;
      const y = height - padding - (data[i] / 130) * (height - padding * 2);
      pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    const lastX = padding + (pointsCount - 1) * stepX;
    areaD += ` L ${lastX.toFixed(1)} ${height - padding} Z`;

    const thresholdY = height - padding - (threshold / 130) * (height - padding * 2);

    const svgHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.03" />
          </linearGradient>
        </defs>

        <!-- Baseline Grid -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="${padding}" y1="${thresholdY}" x2="${width - padding}" y2="${thresholdY}" stroke="#ef4444" stroke-dasharray="4 4" stroke-width="1.5" />
        <text x="${width - padding}" y="${thresholdY - 5}" fill="#ef4444" font-size="10" text-anchor="end" font-family="monospace">Capacity Alert Limit (${threshold}%)</text>

        <!-- Area Fill -->
        <path d="${areaD}" fill="url(#areaGradient)" />

        <!-- Line Path -->
        <path d="${pathD}" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" />

        <!-- Data Node Points -->
        ${data.map((val, i) => {
          const cx = (padding + i * stepX).toFixed(1);
          const cy = (height - padding - (val / 130) * (height - padding * 2)).toFixed(1);
          const isOver = val >= threshold;
          return `<circle cx="${cx}" cy="${cy}" r="${isOver ? 4.5 : 3}" fill="${isOver ? '#ef4444' : '#06b6d4'}" stroke="#07090e" stroke-width="1.5" />`;
        }).join('')}
      </svg>
    `;

    chartWrapper.innerHTML = svgHTML;
  }

  function renderSqlQuery(terminal, season, granularity, threshold, load) {
    if (!sqlPreview) return;

    const termKey = terminal.split(' ')[0].toLowerCase();
    const intervalStr = granularity === '15-min' ? '15 MINUTE' : (granularity === 'Hourly' ? '1 HOUR' : '1 DAY');

    const sql = `-- Real-Time Query: Jack Layton Ferry Terminal Analytics Model (2015-2025)
WITH IntervalTraffic AS (
    SELECT 
        DATE_TRUNC('${granularity.toLowerCase()}', scan_timestamp) AS window_slot,
        terminal_id,
        COUNT(ticket_id) AS passenger_volume,
        ROUND(COUNT(ticket_id)::NUMERIC / MAX(terminal_capacity) * 100, 2) AS capacity_util_pct
    FROM ferry_redemptions
    WHERE season_tag = '${season}'
      AND terminal_name ILIKE '%${termKey}%'
    GROUP BY 1, 2
)
SELECT 
    window_slot,
    passenger_volume,
    capacity_util_pct,
    CASE 
        WHEN capacity_util_pct >= ${threshold} THEN 'CRITICAL_CONGESTION'
        WHEN capacity_util_pct >= 70 THEN 'MODERATE_LOAD'
        ELSE 'OPTIMAL'
    END AS operational_flag,
    AVG(capacity_util_pct) OVER (
        ORDER BY window_slot ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
    ) AS rolling_oli_metric
FROM IntervalTraffic
ORDER BY window_slot DESC;`;

    sqlPreview.textContent = sql;
  }

  function updateMusicSimulation() {
    const genre = labTerminalSelect ? labTerminalSelect.value : 'Pop & Electronic';
    const metricA = parseInt(labLoadSlider.value, 10);
    const metricB = parseInt(labThresholdSlider.value, 10);

    if (labLoadValDisplay) labLoadValDisplay.textContent = `${metricA} streams/hr`;
    if (labThresholdValDisplay) labThresholdValDisplay.textContent = `${metricB}% energy`;

    const momentum = Math.min(99, Math.round((metricA / 4500) * 85 + (metricB / 100) * 15));
    const retention = Math.round(70 + (metricB * 0.25));
    const acousticDiv = (0.35 + (metricA % 50) * 0.01).toFixed(2);

    if (kpiCapacity) {
      kpiCapacity.textContent = `${momentum}/100`;
      kpiCapacity.style.color = '#38bdf8';
    }
    if (kpiCongestion) {
      kpiCongestion.textContent = `${retention}%`;
      kpiCongestion.style.color = '#10b981';
    }
    if (kpiOli) {
      kpiOli.textContent = `${acousticDiv} idx`;
      kpiOli.style.color = '#f59e0b';
    }

    renderMusicChart(metricA, metricB);
    renderMusicPipeline(genre, metricA, metricB);
  }

  function renderMusicChart(volume, energy) {
    if (!chartWrapper) return;
    const tracks = ['Track 01 (Top Peak)', 'Track 02 (Trending)', 'Track 03 (Viral Break)', 'Track 04 (Steady Hit)', 'Track 05 (New Entry)'];
    const maxVal = 100;

    let barsHTML = '<div class="mini-viz-container" style="width: 100%; padding: 0.5rem 0;">';
    tracks.forEach((track, idx) => {
      const pct = Math.min(100, Math.max(25, Math.round((volume / 4500) * 90 - idx * 12 + (energy * 0.15))));
      barsHTML += `
        <div class="mini-bar-row">
          <span class="mini-bar-label">${track}</span>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="mini-bar-val">${pct}%</span>
        </div>
      `;
    });
    barsHTML += '</div>';

    chartWrapper.innerHTML = barsHTML;
  }

  function renderMusicPipeline(genre, volume, energy) {
    if (!sqlPreview) return;
    const pythonCode = `# UK Top 50 Chart Analytics ETL Pipeline (Python + Pandas + Plotly)
import pandas as pd
import plotly.express as px

def extract_music_metrics(dataset_url: str):
    df = pd.read_csv(dataset_url)
    filtered = df[(df['energy_score'] >= ${energy / 100}) & (df['hourly_stream_rate'] >= ${volume})]
    
    # Calculate weighted momentum score
    filtered['momentum_idx'] = (
        0.65 * filtered['popularity'] + 
        0.35 * filtered['danceability'] * 100
    )
    
    fig = px.scatter(
        filtered, x='energy_score', y='danceability',
        size='popularity', color='chart_peak',
        title=f'UK Top 50 Trend Dispersion - Filtered Load: {${volume}}'
    )
    return filtered.sort_values(by='momentum_idx', ascending=False)`;

    sqlPreview.textContent = pythonCode;
  }

  // Bind Listeners
  if (labLoadSlider) {
    labLoadSlider.addEventListener('input', () => {
      playTickSound();
      if (currentTab === 'ferry') updateFerrySimulation();
      else updateMusicSimulation();
    });
  }

  if (labThresholdSlider) {
    labThresholdSlider.addEventListener('input', () => {
      playTickSound();
      if (currentTab === 'ferry') updateFerrySimulation();
      else updateMusicSimulation();
    });
  }

  if (labTerminalSelect) {
    labTerminalSelect.addEventListener('change', () => {
      playTickSound();
      if (currentTab === 'ferry') updateFerrySimulation();
      else updateMusicSimulation();
    });
  }

  if (labSeasonSelect) {
    labSeasonSelect.addEventListener('change', () => {
      playTickSound();
      if (currentTab === 'ferry') updateFerrySimulation();
      else updateMusicSimulation();
    });
  }

  if (labGranularitySelect) {
    labGranularitySelect.addEventListener('change', () => {
      playTickSound();
      if (currentTab === 'ferry') updateFerrySimulation();
      else updateMusicSimulation();
    });
  }

  // Switch tabs in lab
  labTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      labTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-lab-tab');
      playTickSound();

      const labelTerminal = document.getElementById('label-terminal-param');
      const labelGranularity = document.getElementById('label-granularity-param');
      const kpiLabel1 = document.getElementById('kpi-label-1');
      const kpiLabel2 = document.getElementById('kpi-label-2');
      const kpiLabel3 = document.getElementById('kpi-label-3');
      const chartTitle = document.getElementById('lab-chart-title');
      const codeBadge = document.getElementById('lab-code-badge');

      if (currentTab === 'music') {
        if (labelTerminal) labelTerminal.textContent = 'Music Genre Focus';
        if (labelGranularity) labelGranularity.textContent = 'Chart Scope';
        if (kpiLabel1) kpiLabel1.textContent = 'Momentum Score';
        if (kpiLabel2) kpiLabel2.textContent = 'Retention Rate';
        if (kpiLabel3) kpiLabel3.textContent = 'Acoustic Index';
        if (chartTitle) chartTitle.textContent = 'UK Top 50 Track Popularity Velocity';
        if (codeBadge) codeBadge.textContent = 'PYTHON ETL';
        updateMusicSimulation();
      } else {
        if (labelTerminal) labelTerminal.textContent = 'Ferry Terminal Station';
        if (labelGranularity) labelGranularity.textContent = 'Time Granularity';
        if (kpiLabel1) kpiLabel1.textContent = 'Capacity Utilization';
        if (kpiLabel2) kpiLabel2.textContent = 'Congestion Pressure';
        if (kpiLabel3) kpiLabel3.textContent = 'Peak OLI';
        if (chartTitle) chartTitle.textContent = 'Capacity Utilization vs. Granular Time Windows';
        if (codeBadge) codeBadge.textContent = 'SQL GENERATOR';
        updateFerrySimulation();
      }
    });
  });

  // Initial Run
  updateFerrySimulation();
})();

/**
 * ARSLAAN ALAM - PORTFOLIO CORE CONTROLLER
 * Animations, Audio Synth, Command Palette, Interactive Terminal & UI Effects
 */

// --- 1. Synthesized Web Audio Engine (Zero External Audio Files) ---
window.PortfolioAudio = (function () {
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('portfolio-sound') === 'true';

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal = 0.05) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  return {
    get enabled() { return isSoundEnabled; },
    toggle() {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('portfolio-sound', isSoundEnabled ? 'true' : 'false');
      if (isSoundEnabled) {
        initAudio();
        this.success();
      }
      return isSoundEnabled;
    },
    tick() {
      playTone(1200, 'sine', 0.03, 0.02);
    },
    pop() {
      playTone(600, 'sine', 0.06, 0.04);
    },
    success() {
      if (!isSoundEnabled) return;
      playTone(523.25, 'triangle', 0.1, 0.04);
      setTimeout(() => playTone(659.25, 'triangle', 0.15, 0.04), 80);
    }
  };
})();

// --- 2. Main DOM Controller ---
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const cmdPaletteBtn = document.getElementById('cmd-palette-btn');
  const cmdModalBackdrop = document.getElementById('cmd-modal-backdrop');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdResultsList = document.getElementById('cmd-results-list');
  const roleTypeElement = document.getElementById('role-type-target');
  const toastContainer = document.getElementById('toast-container');

  // --- Theme Management ---
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
      updateThemeIcon(next);
      window.PortfolioAudio.pop();
      showToast(`Theme switched to ${next === 'dark' ? 'Obsidian Dark' : 'Slate Light'}`);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('svg');
    if (icon) {
      if (theme === 'light') {
        icon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
      } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
      }
    }
  }

  // --- Sound Toggle Management ---
  function updateSoundIcon(enabled) {
    if (!soundIcon) return;
    if (enabled) {
      soundIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    } else {
      soundIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    }
  }
  updateSoundIcon(window.PortfolioAudio.enabled);

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const enabled = window.PortfolioAudio.toggle();
      updateSoundIcon(enabled);
      showToast(enabled ? 'Tactile Audio Feedback ON' : 'Audio Muted');
    });
  }

  // --- Typewriter Role Animation ---
  const roles = [
    'Software Developer',
    'Data Analyst',
    'AI/ML Enthusiast',
    'Python & SQL Engineer',
    'Problem Solver (DSA)'
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 90;

  function typeRole() {
    if (!roleTypeElement) return;
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      roleTypeElement.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 45;
    } else {
      roleTypeElement.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 90;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typeSpeed = 1800; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400; // Pause before typing new word
    }

    setTimeout(typeRole, typeSpeed);
  }
  typeRole();

  // --- Custom Magnetic Cursor ---
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');

  if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.opacity = '1';
      cursor.style.opacity = '1';
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactives = document.querySelectorAll('a, button, input, select, textarea, .skill-pill, .lab-tab');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        window.PortfolioAudio.tick();
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // --- Interactive Skills Inspector Data & Logic ---
  const skillSnippets = {
    'Python': {
      title: 'Python (Pandas, Plotly, Streamlit, NumPy)',
      desc: 'Applied in Ferry Analytics & Music Dashboards for ETL pipelines and statistical modeling.',
      code: `<span class="code-comment"># Production Data Pipeline & Dynamic Metric Aggregation</span>
<span class="code-keyword">import</span> pandas <span class="code-keyword">as</span> pd
<span class="code-keyword">import</span> plotly.express <span class="code-keyword">as</span> px

<span class="code-keyword">def</span> <span class="code-func">calculate_congestion_indices</span>(df: pd.DataFrame) -> pd.DataFrame:
    df[<span class="code-string">'utilization_ratio'</span>] = (df[<span class="code-string">'passengers'</span>] / df[<span class="code-string">'max_capacity'</span>]) * <span class="code-keyword">100</span>
    df[<span class="code-string">'rolling_oli'</span>] = df[<span class="code-string">'utilization_ratio'</span>].<span class="code-func">rolling</span>(window=<span class="code-keyword">3</span>).<span class="code-func">mean</span>()
    <span class="code-keyword">return</span> df[df[<span class="code-string">'utilization_ratio'</span>] > <span class="code-keyword">85.0</span>]`
    },
    'SQL': {
      title: 'SQL & Database Query Optimization',
      desc: 'Complex aggregation, window functions, CTEs, and relational modeling across MySQL & PostgreSQL.',
      code: `<span class="code-comment">-- Analytical Window Calculation for Peak Hour Congestion</span>
<span class="code-keyword">WITH</span> TerminalStats <span class="code-keyword">AS</span> (
    <span class="code-keyword">SELECT</span> 
        terminal_id, 
        DATE_TRUNC(<span class="code-string">'hour'</span>, scan_time) <span class="code-keyword">AS</span> hour_bucket,
        <span class="code-func">COUNT</span>(ticket_id) <span class="code-keyword">AS</span> passenger_count,
        <span class="code-func">AVG</span>(turnstile_speed) <span class="code-keyword">AS</span> avg_speed
    <span class="code-keyword">FROM</span> ferry_redemptions
    <span class="code-keyword">GROUP BY</span> <span class="code-keyword">1</span>, <span class="code-keyword">2</span>
)
<span class="code-keyword">SELECT</span> *,
       <span class="code-func">DENSE_RANK</span>() <span class="code-keyword">OVER</span> (<span class="code-keyword">ORDER BY</span> passenger_count <span class="code-keyword">DESC</span>) <span class="code-keyword">AS</span> peak_rank
<span class="code-keyword">FROM</span> TerminalStats;`
    },
    'Java': {
      title: 'Java & Object Oriented Programming',
      desc: 'Robust OOP design, class inheritance, abstraction, exception handling, and DSA problem solving.',
      code: `<span class="code-comment">// OOP Architecture: Intelligent Data Source Adapter</span>
<span class="code-keyword">public class</span> <span class="code-func">DataPipelineEngine</span> {
    <span class="code-keyword">private final</span> List&lt;MetricObserver&gt; observers = <span class="code-keyword">new</span> ArrayList&lt;&gt;();
    
    <span class="code-keyword">public synchronized void</span> <span class="code-func">dispatchMetrics</span>(DataSet batch) {
        <span class="code-keyword">for</span> (MetricObserver obs : observers) {
            obs.<span class="code-func">onMetricComputed</span>(batch.getMetrics());
        }
    }
}`
    },
    'Power BI': {
      title: 'Power BI & Business Intelligence',
      desc: 'KPI metric modeling, DAX measures, interactive executive dashboards at Unified Mentor.',
      code: `<span class="code-comment">// DAX Custom Measure: Dynamic Congestion Pressure Indicator</span>
Congestion Pressure Index = 
VAR TotalScans = [Total Ticket Redemptions]
VAR TerminalMaxCap = SELECTEDVALUE(Terminal[MaxCapacity], 3000)
RETURN
    DIVIDE(TotalScans, TerminalMaxCap, 0) * 100`
    },
    'Streamlit': {
      title: 'Streamlit Interactive Web Apps',
      desc: 'Rapid deployment of real-time interactive analytics interfaces with reactive state and widgets.',
      code: `<span class="code-comment"># Streamlit Reactive Dashboard Controller</span>
<span class="code-keyword">import</span> streamlit <span class="code-keyword">as</span> st

st.<span class="code-func">set_page_config</span>(page_title=<span class="code-string">"Ferry Analytics"</span>, layout=<span class="code-string">"wide"</span>)
selected_terminal = st.sidebar.<span class="code-func">selectbox</span>(<span class="code-string">"Select Station"</span>, stations)
granularity = st.sidebar.<span class="code-func">radio</span>(<span class="code-string">"Granularity"</span>, [<span class="code-string">"15-min"</span>, <span class="code-string">"Hourly"</span>, <span class="code-string">"Daily"</span>])
st.<span class="code-func">plotly_chart</span>(create_traffic_visual(selected_terminal, granularity))`
    },
    'JavaScript': {
      title: 'Modern JavaScript (ES6+)',
      desc: 'DOM manipulation, async data handling, event dispatchers, canvas animations, and reactive UI.',
      code: `<span class="code-comment">// Real-Time Dynamic Stream Observer Pattern</span>
<span class="code-keyword">class</span> <span class="code-func">StreamObserver</span> {
  <span class="code-func">constructor</span>(endpoint) {
    <span class="code-keyword">this</span>.endpoint = endpoint;
  }
  <span class="code-keyword">async</span> <span class="code-func">fetchLiveKPIs</span>() {
    <span class="code-keyword">const</span> res = <span class="code-keyword">await</span> <span class="code-func">fetch</span>(<span class="code-keyword">this</span>.endpoint);
    <span class="code-keyword">return</span> <span class="code-keyword">await</span> res.<span class="code-func">json</span>();
  }
}`
    },
    'DSA & OOP': {
      title: 'Data Structures, Algorithms & Problem Solving',
      desc: 'Hands-on problem solving on LeetCode; arrays, trees, graphs, dynamic programming, space-time optimization.',
      code: `<span class="code-comment">// Optimized Two-Pointer Interval Overlap Algorithm (O(N log N))</span>
<span class="code-keyword">public int</span> <span class="code-func">findMinFerryBays</span>(<span class="code-keyword">int</span>[][] intervals) {
    Arrays.<span class="code-func">sort</span>(intervals, (a, b) -> Integer.<span class="code-func">compare</span>(a[0], b[0]));
    PriorityQueue&lt;Integer&gt; pq = <span class="code-keyword">new</span> PriorityQueue&lt;&gt;();
    <span class="code-keyword">for</span> (<span class="code-keyword">int</span>[] interval : intervals) {
        <span class="code-keyword">if</span> (!pq.isEmpty() && pq.peek() &lt;= interval[0]) pq.<span class="code-func">poll</span>();
        pq.<span class="code-func">add</span>(interval[1]);
    }
    <span class="code-keyword">return</span> pq.size();
}`
    },
    'Google Gemini 3.5 Flash': {
      title: 'Google Gemini 3.5 Flash & High-Speed LLM Inference',
      desc: 'Used in BrewMind Café for low-latency reasoning, claim-level source citations, and conversational state tracking.',
      code: `<span class="code-comment"># Gemini 3.5 Flash Inference with Grounding & Citation Audits</span>
<span class="code-keyword">from</span> google <span class="code-keyword">import</span> genai
<span class="code-keyword">from</span> google.genai <span class="code-keyword">import</span> types

client = genai.<span class="code-func">Client</span>()
response = client.models.<span class="code-func">generate_content</span>(
    model=<span class="code-string">"gemini-3.5-flash"</span>,
    contents=user_prompt,
    config=types.<span class="code-func">GenerateContentConfig</span>(
        system_instruction=<span class="code-string">"Synthesize evidence strictly from retrieved chunks. Cite claim spans."</span>,
        temperature=<span class="code-keyword">0.2</span>
    )
)`
    },
    'Hybrid RAG & RRF': {
      title: 'Hybrid RAG Pipeline (ChromaDB Vector + BM25 Lexical + RRF)',
      desc: 'Combines dense semantic vector retrieval with sparse lexical BM25 matching fused via Reciprocal Rank Fusion (k=60).',
      code: `<span class="code-comment"># Reciprocal Rank Fusion (RRF) combining ChromaDB and BM25</span>
<span class="code-keyword">def</span> <span class="code-func">reciprocal_rank_fusion</span>(vector_results, lexical_results, k=<span class="code-keyword">60</span>):
    rrf_scores = {}
    <span class="code-keyword">for</span> rank, doc_id <span class="code-keyword">in</span> <span class="code-func">enumerate</span>(vector_results):
        rrf_scores[doc_id] = rrf_scores.<span class="code-func">get</span>(doc_id, <span class="code-keyword">0</span>) + <span class="code-keyword">1.0</span> / (k + rank + <span class="code-keyword">1</span>)
    <span class="code-keyword">for</span> rank, doc_id <span class="code-keyword">in</span> <span class="code-func">enumerate</span>(lexical_results):
        rrf_scores[doc_id] = rrf_scores.<span class="code-func">get</span>(doc_id, <span class="code-keyword">0</span>) + <span class="code-keyword">1.0</span> / (k + rank + <span class="code-keyword">1</span>)
    <span class="code-keyword">return</span> <span class="code-func">sorted</span>(rrf_scores.items(), key=<span class="code-keyword">lambda</span> x: x[<span class="code-keyword">1</span>], reverse=<span class="code-keyword">True</span>)`
    },
    '5-Agent Architecture': {
      title: '5-Agent Self-Correction System (Planner, Retriever, Writer, Verifier, Editor)',
      desc: 'Multi-agent orchestration loop with claim-level validation and automated error correction.',
      code: `<span class="code-comment"># Multi-Agent State Machine with Self-Correction Feedback Loop</span>
<span class="code-keyword">async def</span> <span class="code-func">run_5_agent_pipeline</span>(query: str):
    plan = <span class="code-keyword">await</span> planner_agent.<span class="code-func">decompose</span>(query)
    evidence = <span class="code-keyword">await</span> retriever_agent.<span class="code-func">search_hybrid</span>(plan.subqueries)
    draft = <span class="code-keyword">await</span> writer_agent.<span class="code-func">draft_with_citations</span>(evidence)
    
    <span class="code-comment"># Self-Correction Loop</span>
    audit = <span class="code-keyword">await</span> verifier_agent.<span class="code-func">validate_claims</span>(draft, evidence)
    <span class="code-keyword">if not</span> audit.is_grounded:
        draft = <span class="code-keyword">await</span> writer_agent.<span class="code-func">refine</span>(draft, audit.issues)
        
    <span class="code-keyword">return await</span> editor_agent.<span class="code-func">polish</span>(draft)`
    },
    'Cross-Encoder Neural Reranking': {
      title: 'Cross-Encoder Neural Reranking (all-MiniLM-L6-v2)',
      desc: 'Re-scores candidate chunks with fine-grained cross-attention to maximize MRR and Precision@k.',
      code: `<span class="code-comment"># Cross-Encoder Neural Reranking using SentenceTransformers</span>
<span class="code-keyword">from</span> sentence_transformers <span class="code-keyword">import</span> CrossEncoder

reranker = <span class="code-func">CrossEncoder</span>(<span class="code-string">'cross-encoder/ms-marco-MiniLM-L-6-v2'</span>)
pairs = [[user_query, doc.page_content] <span class="code-keyword">for</span> doc <span class="code-keyword">in</span> candidate_docs]
scores = reranker.<span class="code-func">predict</span>(pairs)
reranked_docs = [doc <span class="code-keyword">for</span> _, doc <span class="code-keyword">in</span> <span class="code-func">sorted</span>(<span class="code-func">zip</span>(scores, candidate_docs), reverse=<span class="code-keyword">True</span>)]`
    },
    'Power BI': {
      title: 'Power BI Executive Dashboards & Custom DAX',
      desc: 'Developed 4+ interactive dashboards monitoring 15+ KPIs, reducing reporting latency by 30% at Unified Mentor.',
      code: `<span class="code-comment">// Custom DAX Measure: 7-Day Rolling Capacity Utilization Ratio</span>
Capacity_Utilization_7D_Avg = 
CALCULATE(
    DIVIDE(
        SUM(Ferry_Ticket_Sales[Total_Tickets_Redeemed]),
        SUM(Ferry_Capacity[Total_Maximum_Capacity]),
        0
    ),
    DATESINPERIOD(Dim_Calendar[Date], LASTDATE(Dim_Calendar[Date]), -7, DAY)
)`
    },
    'DSA & OOP': {
      title: 'Data Structures, Algorithms & Problem Solving',
      desc: 'Active practitioner on LeetCode; arrays, trees, graphs, dynamic programming, space-time optimization.',
      code: `<span class="code-comment">// Optimized Interval Overlap Scheduling Algorithm (O(N log N))</span>
<span class="code-keyword">public int</span> <span class="code-func">findMinFerryBays</span>(<span class="code-keyword">int</span>[][] intervals) {
    Arrays.<span class="code-func">sort</span>(intervals, (a, b) -> Integer.<span class="code-func">compare</span>(a[0], b[0]));
    PriorityQueue&lt;Integer&gt; pq = <span class="code-keyword">new</span> PriorityQueue&lt;&gt;();
    <span class="code-keyword">for</span> (<span class="code-keyword">int</span>[] interval : intervals) {
        <span class="code-keyword">if</span> (!pq.isEmpty() && pq.peek() &lt;= interval[0]) pq.<span class="code-func">poll</span>();
        pq.<span class="code-func">add</span>(interval[1]);
    }
    <span class="code-keyword">return</span> pq.size();
}`
    },
    'Machine Learning': {
      title: 'AI / Machine Learning Foundations (OCI AI Associate)',
      desc: 'Supervised learning models, regression, clustering, prompt engineering, generative AI job simulations.',
      code: `<span class="code-comment"># Scikit-Learn Predictive Model for Passenger Overload</span>
<span class="code-keyword">from</span> sklearn.ensemble <span class="code-keyword">import</span> GradientBoostingRegressor

model = <span class="code-func">GradientBoostingRegressor</span>(n_estimators=<span class="code-keyword">150</span>, learning_rate=<span class="code-keyword">0.05</span>)
model.<span class="code-func">fit</span>(X_train, y_train)
y_pred = model.<span class="code-func">predict</span>(X_test)`
    },
    'Google ADK & RAG': {
      title: 'Google ADK & RAG Architecture',
      desc: 'Applied in BrewMind Cafe (https://brewmind-cafe.streamlit.app/) for multi-source knowledge grounding.',
      code: `<span class="code-comment"># BrewMind AI: Google ADK Agent with Grounded RAG Retrieval</span>
<span class="code-keyword">from</span> google.adk <span class="code-keyword">import</span> Agent, Tool
<span class="code-keyword">from</span> brewmind_agent.rag <span class="code-keyword">import</span> query_knowledge_base

<span class="code-keyword">class</span> <span class="code-func">BrewMindConcierge</span>(Agent):
    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self):
        super().<span class="code-func">__init__</span>(
            model=<span class="code-string">"gemini-3.5-flash"</span>,
            system_instruction=<span class="code-string">"Recommend beverages strictly grounded in menu and allergen matrix."</span>
        )`
    },
    'FastAPI & APIs': {
      title: 'FastAPI & Pydantic REST Backend',
      desc: 'High-throughput asynchronous API endpoints powering AI concierge chat, product comparison, and cart preview.',
      code: `<span class="code-comment"># FastAPI AI Recommendation Endpoint with Pydantic Schemas</span>
<span class="code-keyword">from</span> fastapi <span class="code-keyword">import</span> FastAPI
<span class="code-keyword">from</span> pydantic <span class="code-keyword">import</span> BaseModel, Field

app = <span class="code-func">FastAPI</span>(title=<span class="code-string">"BrewMind AI API"</span>)

<span class="code-keyword">class</span> <span class="code-func">RecommendationRequest</span>(BaseModel):
    mood: str = <span class="code-func">Field</span>(..., example=<span class="code-string">"energized"</span>)
    dietary: list[str] = [<span class="code-string">"dairy-free"</span>]
    budget_inr: float = <span class="code-keyword">250.0</span>`
    }
  };

  const skillPills = document.querySelectorAll('.skill-pill');
  const inspectTitle = document.getElementById('inspector-title');
  const inspectDesc = document.getElementById('inspector-desc');
  const inspectCode = document.getElementById('inspector-code');

  skillPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const skillName = pill.getAttribute('data-skill');
      skillPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      window.PortfolioAudio.tick();

      if (skillSnippets[skillName]) {
        if (inspectTitle) inspectTitle.textContent = skillSnippets[skillName].title;
        if (inspectDesc) inspectDesc.textContent = skillSnippets[skillName].desc;
        if (inspectCode) inspectCode.innerHTML = skillSnippets[skillName].code;
      }
    });
  });

  // --- Command Palette (Cmd+K / Ctrl+K) ---
  const commands = [
    { label: 'Jump to Featured Projects', section: '#projects', icon: '📁', badge: 'Section' },
    { label: 'Explore Interactive Data Lab', section: '#data-lab', icon: '🧪', badge: 'Playground' },
    { label: 'View Technical Skills & Code Inspector', section: '#skills', icon: '⚡', badge: 'Section' },
    { label: 'View Experience & Education Milestones', section: '#experience', icon: '🎓', badge: 'Timeline' },
    { label: 'View Certifications & Achievements', section: '#certifications', icon: '🏆', badge: 'Section' },
    { label: 'Contact Arslaan (Direct Message)', section: '#contact', icon: '✉️', badge: 'Action' },
    { label: 'Download Resume PDF', action: 'download_resume', icon: '📄', badge: 'Download' },
    { label: 'View ATS Optimized Resume (96+ Score)', action: 'view_ats_resume', icon: '✨', badge: 'ATS Resume' },
    { label: 'Launch BrewMind Cafe (Live Streamlit App)', action: 'open_brewmind', icon: '☕', badge: 'Live App' },
    { label: 'Copy Email Address (arslaanalam700@example.com)', action: 'copy_email', icon: '📋', badge: 'Copy' },
    { label: 'Copy Phone Number (+91 8881607359)', action: 'copy_phone', icon: '📞', badge: 'Copy' },
    { label: 'Toggle Dark / Light Mode', action: 'toggle_theme', icon: '🌓', badge: 'Theme' },
    { label: 'Toggle Audio Sound Effects', action: 'toggle_sound', icon: '🔊', badge: 'Sound' }
  ];

  let selectedCmdIndex = 0;
  let filteredCommands = [...commands];

  function openCmdPalette() {
    if (!cmdModalBackdrop) return;
    cmdModalBackdrop.classList.add('active');
    if (cmdSearchInput) {
      cmdSearchInput.value = '';
      cmdSearchInput.focus();
    }
    filteredCommands = [...commands];
    selectedCmdIndex = 0;
    renderCmdResults();
    window.PortfolioAudio.pop();
  }

  function closeCmdPalette() {
    if (!cmdModalBackdrop) return;
    cmdModalBackdrop.classList.remove('active');
  }

  function renderCmdResults() {
    if (!cmdResultsList) return;
    cmdResultsList.innerHTML = '';

    if (filteredCommands.length === 0) {
      cmdResultsList.innerHTML = '<li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No commands found matching query.</li>';
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const li = document.createElement('li');
      li.className = `cmd-item ${idx === selectedCmdIndex ? 'selected' : ''}`;
      li.innerHTML = `
        <div class="cmd-item-left">
          <span>${cmd.icon}</span>
          <span>${cmd.label}</span>
        </div>
        <span class="cmd-item-badge">${cmd.badge}</span>
      `;

      li.addEventListener('mouseenter', () => {
        selectedCmdIndex = idx;
        renderCmdSelection();
      });

      li.addEventListener('click', () => executeCommand(cmd));
      cmdResultsList.appendChild(li);
    });
  }

  function renderCmdSelection() {
    const items = cmdResultsList.querySelectorAll('.cmd-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedCmdIndex);
    });
  }

  function executeCommand(cmd) {
    closeCmdPalette();
    window.PortfolioAudio.success();

    if (cmd.section) {
      const target = document.querySelector(cmd.section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (cmd.action === 'download_resume') {
      const link = document.createElement('a');
      link.href = 'Arslaan_Alam_Resume.pdf';
      link.download = 'Arslaan_Alam_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading Arslaan Alam Resume PDF...');
    } else if (cmd.action === 'view_ats_resume') {
      window.open('resume_ats_optimized.html', '_blank');
      showToast('Opening ATS-Optimized Resume (Score: 96/100)...');
    } else if (cmd.action === 'open_brewmind') {
      window.open('https://brewmind-cafe.streamlit.app/', '_blank');
      showToast('Opening BrewMind Cafe on Streamlit Cloud...');
    } else if (cmd.action === 'copy_email') {
      navigator.clipboard.writeText('arslaanalam700@example.com');
      showToast('Copied Email: arslaanalam700@example.com');
    } else if (cmd.action === 'copy_phone') {
      navigator.clipboard.writeText('+91 8881607359');
      showToast('Copied Phone: +91 8881607359');
    } else if (cmd.action === 'toggle_theme') {
      if (themeToggleBtn) themeToggleBtn.click();
    } else if (cmd.action === 'toggle_sound') {
      if (soundToggleBtn) soundToggleBtn.click();
    }
  }

  if (cmdPaletteBtn) {
    cmdPaletteBtn.addEventListener('click', openCmdPalette);
  }

  if (cmdModalBackdrop) {
    cmdModalBackdrop.addEventListener('click', (e) => {
      if (e.target === cmdModalBackdrop) closeCmdPalette();
    });
  }

  // Keyboard Navigation for Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModalBackdrop && cmdModalBackdrop.classList.contains('active')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    } else if (e.key === 'Escape' && cmdModalBackdrop && cmdModalBackdrop.classList.contains('active')) {
      closeCmdPalette();
    } else if (cmdModalBackdrop && cmdModalBackdrop.classList.contains('active')) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex + 1) % filteredCommands.length;
        renderCmdSelection();
        window.PortfolioAudio.tick();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderCmdSelection();
        window.PortfolioAudio.tick();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedCmdIndex]) {
          executeCommand(filteredCommands[selectedCmdIndex]);
        }
      }
    }
  });

  if (cmdSearchInput) {
    cmdSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filteredCommands = commands.filter(c => c.label.toLowerCase().includes(q) || c.badge.toLowerCase().includes(q));
      selectedCmdIndex = 0;
      renderCmdResults();
    });
  }

  // --- Copy Buttons in Contact Hub ---
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetText = btn.getAttribute('data-copy');
      if (targetText) {
        navigator.clipboard.writeText(targetText);
        btn.textContent = 'Copied!';
        window.PortfolioAudio.success();
        showToast(`Copied to clipboard: ${targetText}`);
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 2000);
      }
    });
  });

  // --- Contact Form Submission ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const msg = document.getElementById('contact-message').value;

      if (!name || !email || !msg) {
        showToast('Please fill out all required fields.');
        return;
      }

      window.PortfolioAudio.success();
      showToast('Thank you! Launching email client to send message to Arslaan...');
      
      const mailtoUrl = `mailto:arslaanalam700@example.com?subject=${encodeURIComponent('Portfolio Inquiry from ' + name)}&body=${encodeURIComponent(msg + '\n\nSender Email: ' + email)}`;
      window.open(mailtoUrl, '_blank');
      contactForm.reset();
    });
  }

  // --- Toast Notification Engine ---
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // --- Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal-init');
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => scrollObserver.observe(el));

  // --- Animated Numbers Counter ---
  const counterElements = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        function step(currentTime) {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const currentVal = Math.floor(progress * target);
          el.textContent = `${prefix}${currentVal}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        }

        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));
});

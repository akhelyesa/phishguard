<a id="readme-top"></a>

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML-FF6600?style=for-the-badge)](https://xgboost.ai/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<h1>PhishGuard</h1>

<p>
  Local AI phishing email detector — paste a suspicious message, get a risk score,
  an explanation, and URL threat signals before you click.
</p>

<p>
  <a href="#about-the-project"><strong>Explore the docs »</strong></a>
  <br /><br />
  <a href="#getting-started">Getting Started</a>
  ·
  <a href="#usage">Usage</a>
  ·
  <a href="#roadmap">Roadmap</a>
</p>

</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#architecture">Architecture</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation-local-dev">Installation (local dev)</a></li>
        <li><a href="#installation-docker">Installation (Docker)</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#training-the-model">Training the Model</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## About The Project

PhishGuard is a **local-first** phishing triage tool. You paste an email (subject + body), and the system returns:

- A **risk score** (0–100)
- A **classification** (`safe` / `suspicious` / `phishing`)
- A short **explanation**
- **Highlighted cue phrases** and **SHAP top contributors** (which features pushed the score)
- **URL threat analysis** for links found in the message

It is designed as a personal second opinion — not a replacement for Gmail/Outlook filters or antivirus — and is meant to run on your machine (dev servers or Docker), not as a public cloud service.

<!-- Optional: add a screenshot -->
<!-- ![PhishGuard dashboard](images/screenshot.png) -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

| Area | What you get |
|------|----------------|
| **Email analysis** | Subject + body (+ optional URLs) → score, label, explanation |
| **Explainability** | SHAP top contributing features + highlighted danger words in the UI |
| **URL checks** | Rule-based signals (HTTPS, IP hosts, shorteners, login keywords, etc.) |
| **ML pipeline** | TF-IDF + handcrafted features → XGBoost (LR & Random Forest baselines for comparison) |
| **Dashboard** | React UI: risk meter, highlights, link panel, recent checks |
| **API** | FastAPI: `POST /analyze/email`, `POST /analyze/url` |
| **Docker** | `docker compose` runs API + UI together |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [Python](https://www.python.org/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [scikit-learn](https://scikit-learn.org/) / [XGBoost](https://xgboost.ai/) / [SHAP](https://shap.readthedocs.io/)
* [Pandas](https://pandas.pydata.org/)
* [React](https://react.dev/) + [Vite](https://vite.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Docker](https://www.docker.com/) / Docker Compose

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Architecture

Clean Architecture layout — each layer has one job:

```text
phishguard/
├── backend/
│   ├── app/
│   │   ├── api/          # HTTP routers only
│   │   ├── core/         # Business logic (email analyzer, URL checker)
│   │   ├── ml/           # Feature extraction, training, prediction, SHAP
│   │   ├── schemas/      # Pydantic request/response models
│   │   └── main.py       # FastAPI entry point
│   ├── data/             # Training CSVs (large archives kept local)
│   └── requirements.txt
├── frontend/             # React dashboard
└── docker-compose.yml
```

* **api** → receives JSON, returns JSON
* **core** → orchestrates analysis policy
* **ml** → features, model, SHAP (no HTTP)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

### Prerequisites

* [Python 3.11+](https://www.python.org/downloads/)
* [Node.js 20+](https://nodejs.org/) (for local frontend)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional, for one-command run)
* A trained model at `backend/app/ml/models/phishing_model.pkl` (included in this repo; retrain with the steps below if you change features)

### Installation (local dev)

1. **Clone the repo**

   ```sh
   git clone https://github.com/akhelyesa/phishguard.git
   cd phishguard
   ```

2. **Backend**

   ```sh
   python -m venv venv
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   # macOS / Linux
   # source venv/bin/activate

   cd backend
   pip install -r requirements.txt
   # PowerShell
   $env:PYTHONPATH = "."
   # bash: export PYTHONPATH=.
   uvicorn app.main:app --reload
   ```

   API: [http://127.0.0.1:8000](http://127.0.0.1:8000) · Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

3. **Frontend** (new terminal)

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

   UI: [http://127.0.0.1:5173](http://127.0.0.1:5173)

### Installation (Docker)

From the project root (stop local uvicorn/npm first if ports are busy):

```sh
docker compose up --build
```

* UI: [http://localhost:8080](http://localhost:8080)
* API: [http://localhost:8000](http://localhost:8000)
* Health: [http://localhost:8000/health](http://localhost:8000/health)

Rebuild after model or backend changes:

```sh
docker compose up --build
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Usage

### Dashboard

1. Open the UI (Vite or Docker).
2. Paste subject + body (or paste a raw email into the form).
3. Click **Analyze** — review the risk meter, explanation, SHAP contributors, and link results.

### API examples

**Analyze email**

```http
POST /analyze/email
Content-Type: application/json

{
  "subject": "URGENT: account suspended",
  "body": "Verify immediately at http://evil.example/login",
  "urls": null
}
```

**Analyze URL**

```http
POST /analyze/url
Content-Type: application/json

{
  "url": "http://192.168.1.10/login/verify"
}
```

Interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Security note (local use)

This tool is intended for **local personal use**. Do not paste highly sensitive mail into a shared machine. Input size limits are enforced via Pydantic. Dependency scans:

```sh
# from project root, venv active
python -m pip_audit -r backend/requirements.txt

cd frontend
npm run audit
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Training the Model

Training data expects columns: `text_combined`, `label` (`0` = safe, `1` = phishing).

Default dataset path: `backend/data/archive/phishing_email.csv` (kept local — not in git; large files).

```sh
cd backend
# venv active, PYTHONPATH=.
python -m app.ml.trainer
```

The trainer:

1. Fits the feature extractor (TF-IDF + handcrafted features, including capital-letter ratio)
2. Prints **Logistic Regression** and **Random Forest** holdout metrics (baselines only)
3. Trains and saves **XGBoost** (+ extractor) to `backend/app/ml/models/phishing_model.pkl`

### Improving with your own misses (`my_extra.csv`)

Planned workflow:

1. Use PhishGuard on real mail
2. Log wrong predictions into `my_extra.csv` (`text_combined,label`)
3. After ~50+ rows, merge with the main CSV and retrain

*(Automatic merge of `my_extra.csv` in the trainer is on the roadmap — today it loads the main CSV only.)*

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Roadmap

- [x] ML pipeline (features → train → predict)
- [x] FastAPI email + URL endpoints
- [x] React dashboard (meter, highlights, URL panel)
- [x] SHAP top contributors in API + UI
- [x] LR / RF baseline comparison at train time
- [x] Docker Compose
- [ ] Merge `my_extra.csv` into training automatically
- [ ] Optional: richer SHAP heatmap in the UI
- [ ] Optional: domain-age / reputation APIs (if ever needed)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License

This project is provided for personal / educational use. Add a `LICENSE` file if you want a specific open-source license (e.g. MIT).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contact

**akhelyesa**

Project Link: [https://github.com/akhelyesa/phishguard](https://github.com/akhelyesa/phishguard)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Acknowledgments

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) — README structure inspiration
* [Img Shields](https://shields.io/) — badges
* Kaggle phishing email datasets / Enron-style legitimate mail for training data
* FastAPI, scikit-learn, XGBoost, and SHAP communities

<p align="right">(<a href="#readme-top">back to top</a>)</p>

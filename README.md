<a id="readme-top"></a>

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML-FF6600?style=for-the-badge)](https://xgboost.ai/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<h1>PhishGuard</h1>

<p>
  Paste a suspicious email. Get a risk score, a short explanation,
  and a check on any links before you click.
</p>

<p>
  Runs on your own computer. Not published as a public web service.
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
    <li><a href="#whats-in-this-repo">Whats in this repo</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation-docker">Installation (Docker)</a></li>
        <li><a href="#installation-local-dev">Installation (local dev)</a></li>
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

## About The Project

PhishGuard helps you double-check emails that feel off. Paste the subject and body. You get:

- A **risk score** from 0 to 100
- A label: **safe**, **suspicious**, or **phishing**
- A short **explanation** in normal language
- **Highlighted phrases** that look like scam cues
- A short list of **what pushed the score** (SHAP: which features raised or lowered risk)
- A **URL check** for links in the message

This is a personal second opinion. It does not replace Gmail, Outlook, or antivirus.

<!-- Optional: add a screenshot -->
<!-- ![PhishGuard dashboard](images/screenshot.png) -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

| Area | What you get |
|------|----------------|
| **Email analysis** | Subject + body (+ optional URLs) → score, label, explanation |
| **Explainability** | Flagged words in the text + SHAP feature list |
| **URL checks** | HTTPS, IP hosts, shorteners, login-style words, and similar signals |
| **ML pipeline** | Text features + counts → XGBoost (LR and Random Forest printed for comparison when training) |
| **Dashboard** | Risk meter, highlights, link panel, recent checks |
| **API** | `POST /analyze/email`, `POST /analyze/url` |
| **Docker** | One command for API + UI |

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

Each folder has one job:

```text
phishguard/
├── backend/
│   ├── app/
│   │   ├── api/          # HTTP routers only
│   │   ├── core/         # Business logic (email analyzer, URL checker)
│   │   ├── ml/           # Feature extraction, training, prediction, SHAP
│   │   ├── schemas/      # Request and response shapes
│   │   └── main.py       # FastAPI entry point
│   ├── data/             # Training CSVs (large files stay local)
│   └── requirements.txt
├── frontend/             # React dashboard
└── docker-compose.yml
```

* **api** receives and returns JSON
* **core** runs the analysis rules
* **ml** owns features, the model, and SHAP

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Whats in this repo

| Item | In the repo? | Notes |
|------|----------------|--------|
| Source code (backend + frontend) | Yes | Full app |
| Trained model (`backend/app/ml/models/phishing_model.pkl`) | Yes | Enough to **run** PhishGuard |
| Training CSV dataset | **No** | Too large for GitHub; not required to use the app |

**You do not need the training CSV to use PhishGuard.** Clone the repo, start Docker or local dev, and paste an email. The included `.pkl` model scores messages for you.

The CSV is only needed if you want to **retrain** the model (see [Training the Model](#training-the-model)).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (easiest way to run)
* Or [Python 3.11+](https://www.python.org/downloads/) and [Node.js 20+](https://nodejs.org/) for local development
* Trained model at `backend/app/ml/models/phishing_model.pkl` (included in this repo)

### Installation (Docker)

From the project root. Stop local uvicorn/npm first if ports 8000 or 8080 are busy. The first build may take several minutes.

```sh
git clone https://github.com/akhelyesa/phishguard.git
cd phishguard
docker compose up --build
```

* UI: [http://localhost:8080](http://localhost:8080)
* API: [http://localhost:8000](http://localhost:8000)
* Health: [http://localhost:8000/health](http://localhost:8000/health)

After backend or model changes, run `docker compose up --build` again.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### Dashboard

1. Open the UI (Docker or Vite).
2. Paste subject and body (or paste a raw email into the form).
3. Click **Analyze**. Check the score, explanation, flagged phrases, and links.

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

Use this on your own machine. Avoid pasting highly sensitive mail on a shared PC. Oversized pastes are rejected. To scan dependencies:

```sh
python -m pip_audit -r backend/requirements.txt
cd frontend
npm run audit
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Training the Model

Optional. Only needed if you change features or want to rebuild the model from labeled emails.

**Not required to run the app** — the shipped `.pkl` already works for analysis.

### Dataset format

CSV columns must be:

* `text_combined` — subject + body as one string
* `label` — `0` (safe) or `1` (phishing)

Default path expected by the trainer:

`backend/data/archive/phishing_email.csv`

That folder is **gitignored** (datasets are too large for GitHub). Create `backend/data/archive/` locally and place the file there.

### Where to get a dataset

* Download a **Kaggle phishing email** dataset that uses (or can be renamed to) `text_combined` and `label`.
* Or build a small CSV yourself (example):

```csv
text_combined,label
"Meeting moved to 3pm. See you then.",0
"URGENT: Your account is suspended. Verify now at http://evil.example/login",1
```

A tiny handmade CSV is fine for learning how training works, but a weak model. Prefer a real labeled dataset for serious retraining.

### Train

```sh
cd backend
# venv active, PYTHONPATH=.
python -m app.ml.trainer
```

The trainer:

1. Builds features from the email text
2. Prints Logistic Regression and Random Forest holdout scores for comparison
3. Saves the XGBoost model to `backend/app/ml/models/phishing_model.pkl`

Restart the API (or rebuild Docker) after retraining so it loads the new model.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] ML pipeline (features → train → predict)
- [x] FastAPI email + URL endpoints
- [x] React dashboard (meter, highlights, URL panel)
- [x] SHAP contributors in API + UI
- [x] LR / RF baseline comparison at train time
- [x] Docker Compose

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Personal / educational use. Add a `LICENSE` file if you want a named license (for example MIT).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

**akhelyesa**

Project Link: [https://github.com/akhelyesa/phishguard](https://github.com/akhelyesa/phishguard)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) for README structure
* Kaggle phishing email datasets / Enron-style legitimate mail for training data
* FastAPI, scikit-learn, XGBoost, and SHAP communities

<p align="right">(<a href="#readme-top">back to top</a>)</p>

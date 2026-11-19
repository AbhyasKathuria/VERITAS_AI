from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.endpoints import (
    health, analyze, datasets, models, experiments, robustness, graph, reports
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="An Explainable and Robust Machine Learning Framework for Fake Review Detection Across Traditional and Modern AI-Generated Reviews",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all versioned routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(analyze.router, prefix=f"{settings.API_V1_STR}/analyze", tags=["Analyze"])
app.include_router(datasets.router, prefix=f"{settings.API_V1_STR}/datasets", tags=["Datasets"])
app.include_router(models.router, prefix=f"{settings.API_V1_STR}/models", tags=["Models"])
app.include_router(experiments.router, prefix=f"{settings.API_V1_STR}/experiments", tags=["Experiments"])
app.include_router(robustness.router, prefix=f"{settings.API_V1_STR}/robustness", tags=["Robustness"])
app.include_router(graph.router, prefix=f"{settings.API_V1_STR}/graph", tags=["Graph"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "active",
        "docs": f"{settings.API_V1_STR}/docs",
        "endpoints": [
            f"{settings.API_V1_STR}/analyze/review",
            f"{settings.API_V1_STR}/analyze/batch",
            f"{settings.API_V1_STR}/datasets",
            f"{settings.API_V1_STR}/models",
            f"{settings.API_V1_STR}/experiments",
            f"{settings.API_V1_STR}/robustness/evaluate",
            f"{settings.API_V1_STR}/graph/100",
            f"{settings.API_V1_STR}/reports"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import APIRouter
from typing import Dict, Any
from ml.graph.graph_engine import graph_engine

router = APIRouter()

@router.get("/{node_id}")
def get_graph_ego_network(node_id: int):
    """Retrieves the 1-hop multi-relational ego network for visualization and fraud analysis."""
    data = graph_engine.get_node_ego_network(node_id)
    return data

@router.get("/summary/stats")
def get_graph_statistics():
    """Returns global YelpChi graph structural statistics."""
    return {
        "dataset_name": "YelpChi Multi-Relational Graph",
        "num_nodes": graph_engine.num_nodes,
        "relations": [
            {"name": "R-U-R (Shared Reviewer)", "edges": graph_engine.net_rur.nnz if graph_engine.mat_loaded else 49315},
            {"name": "R-T-R (Temporal Burst)", "edges": graph_engine.net_rtr.nnz if graph_engine.mat_loaded else 573616},
            {"name": "R-S-R (Star Rating)", "edges": graph_engine.net_rsr.nnz if graph_engine.mat_loaded else 3402743},
            {"name": "Homogeneous Unified", "edges": graph_engine.homo.nnz if graph_engine.mat_loaded else 3894066}
        ],
        "is_loaded": graph_engine.mat_loaded
    }

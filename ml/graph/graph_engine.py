"""
VERITAS AI: Multi-Relational Graph Learning & Evidence Network Engine
Loads YelpChi heterogeneous network and provides neighborhood aggregation & ego-network extraction.
"""

import os
import json
import zipfile
import numpy as np
import scipy.io
from scipy import sparse
from pathlib import Path
from typing import Dict, List, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DIR = BASE_DIR / "ml" / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "ml" / "data" / "processed"

class YelpChiGraphEngine:
    """Manages the YelpChi multi-relational review fraud graph."""

    def __init__(self):
        self.mat_loaded = False
        self.features = None
        self.labels = None
        self.net_rur = None
        self.net_rtr = None
        self.net_rsr = None
        self.homo = None
        self.num_nodes = 0
        self._load_graph()

    def _load_graph(self):
        zip_path = RAW_DIR / "YelpChi.zip"
        if not zip_path.exists():
            print(f"[WARN] YelpChi.zip not found at {zip_path}. Graph engine in standby.")
            return

        try:
            print("[GRAPH] Loading YelpChi.mat into memory...")
            with zipfile.ZipFile(zip_path, "r") as z:
                with z.open("YelpChi.mat") as f:
                    mat = scipy.io.loadmat(f)

            self.features = mat["features"] # (45954, 32)
            self.labels = mat["label"].flatten() # (45954,)
            self.net_rur = mat["net_rur"].tocsr()
            self.net_rtr = mat["net_rtr"].tocsr()
            self.net_rsr = mat["net_rsr"].tocsr()
            self.homo = mat["homo"].tocsr()
            self.num_nodes = self.features.shape[0]
            self.mat_loaded = True
            print(f"[GRAPH LOADED] {self.num_nodes} nodes, {self.homo.nnz} edges.")
        except Exception as e:
            print(f"[WARN] Failed to load YelpChi graph: {e}")

    def get_node_ego_network(self, node_id: int, max_neighbors: int = 15) -> Dict[str, Any]:
        """
        Extracts 1-hop multi-relational ego network for visualization and forensic inspection.
        Returns nodes and links formatted for D3 / force-directed graph rendering.
        """
        if not self.mat_loaded or node_id >= self.num_nodes:
            # Fallback for synthetic/sample demonstrations
            return self._generate_sample_ego_network(node_id)

        target_label = int(self.labels[node_id])
        target_feat = self.features[node_id].toarray().flatten() if sparse.issparse(self.features) else self.features[node_id]

        nodes = [
            {
                "id": f"review_{node_id}",
                "label": f"Target Review #{node_id}",
                "type": "target_review",
                "is_fraud": bool(target_label == 1),
                "degree": int(self.homo[node_id].nnz)
            }
        ]
        links = []

        # Find R-U-R neighbors (same reviewer)
        rur_neighbors = self.net_rur[node_id].indices[:max_neighbors]
        for nb in rur_neighbors:
            if nb == node_id:
                continue
            nb_id = f"review_{nb}"
            nodes.append({
                "id": nb_id,
                "label": f"Co-User Review #{nb}",
                "type": "co_user_review",
                "is_fraud": bool(self.labels[nb] == 1),
                "degree": int(self.homo[nb].nnz)
            })
            links.append({
                "source": f"review_{node_id}",
                "target": nb_id,
                "relation": "R-U-R (Shared Reviewer)"
            })

        # Find R-T-R neighbors (temporal cluster)
        rtr_neighbors = self.net_rtr[node_id].indices[:max_neighbors]
        for nb in rtr_neighbors:
            if nb == node_id or any(n["id"] == f"review_{nb}" for n in nodes):
                continue
            nb_id = f"review_{nb}"
            nodes.append({
                "id": nb_id,
                "label": f"Temporal Burst Review #{nb}",
                "type": "temporal_review",
                "is_fraud": bool(self.labels[nb] == 1),
                "degree": int(self.homo[nb].nnz)
            })
            links.append({
                "source": f"review_{node_id}",
                "target": nb_id,
                "relation": "R-T-R (Temporal Burst)"
            })

        # Calculate neighbor spam ratio
        other_nodes = [n for n in nodes if n["id"] != f"review_{node_id}"]
        neighbor_fraud_count = sum(1 for n in other_nodes if n.get("is_fraud"))
        neighbor_fraud_ratio = float(neighbor_fraud_count / max(1, len(other_nodes)))

        return {
            "node_id": node_id,
            "target_is_fraud": bool(target_label == 1),
            "total_graph_nodes": self.num_nodes,
            "degree_centrality": int(self.homo[node_id].nnz),
            "neighbor_fraud_ratio": round(neighbor_fraud_ratio, 3),
            "nodes": nodes,
            "links": links
        }

    def _generate_sample_ego_network(self, node_id: int) -> Dict[str, Any]:
        """Provides a mathematically valid template ego network when explicit node ID is absent."""
        nodes = [
            {"id": "rev_target", "label": "Evaluated Review", "type": "target_review", "is_fraud": False, "degree": 4},
            {"id": "user_1", "label": "Reviewer Account", "type": "reviewer", "is_fraud": False, "degree": 3},
            {"id": "prod_1", "label": "Product / Business", "type": "product", "is_fraud": False, "degree": 12},
            {"id": "rev_hist_1", "label": "Prior Review #1", "type": "prior_review", "is_fraud": False, "degree": 2},
            {"id": "rev_hist_2", "label": "Prior Review #2", "type": "prior_review", "is_fraud": False, "degree": 2},
        ]
        links = [
            {"source": "rev_target", "target": "user_1", "relation": "authored_by"},
            {"source": "rev_target", "target": "prod_1", "relation": "evaluated"},
            {"source": "user_1", "target": "rev_hist_1", "relation": "authored"},
            {"source": "user_1", "target": "rev_hist_2", "relation": "authored"}
        ]
        return {
            "node_id": node_id,
            "target_is_fraud": False,
            "total_graph_nodes": 45954,
            "degree_centrality": 4,
            "neighbor_fraud_ratio": 0.0,
            "nodes": nodes,
            "links": links
        }

graph_engine = YelpChiGraphEngine()

CREATE TABLE IF NOT EXISTS camera (
  edge varchar NOT NULL,
  protocol varchar NOT NULL,
  source varchar NOT NULL,
  PRIMARY KEY (edge, protocol, source)
);

CREATE INDEX IF NOT EXISTS camera_edge_idx ON camera (edge);

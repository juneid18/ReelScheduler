ReelScheduler/
├── frontend/                # React + TypeScript frontend
│   ├── public/              # Static assets
│   ├── src/                 # Frontend source code
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── test-videos/         # Local test videos
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
│
├── docker/                  # Docker configuration
│   ├── docker-compose.yml   # Docker Compose config
│   └── mongo-init.js        # MongoDB initialization script
│
└── README.md                # Project documentation

import type { SkillGroup } from './types'

export const skills: SkillGroup[] = [
  {
    name: 'IA et LLM',
    items: [
      'Systèmes multi-agents',
      'LangGraph',
      'LangChain',
      'RAG',
      'MCP',
      'NLP',
      'Prompt engineering',
      'PyTorch',
      'scikit-learn',
      'TensorFlow Lite',
    ],
    learning: ['Hugging Face Transformers', 'Keras'],
  },
  {
    name: 'Données',
    items: ['Python', 'pandas', 'SQL', 'PostgreSQL', 'Oracle', 'InfluxDB', 'ChromaDB', 'MQTT'],
    learning: ['Spark', 'Kafka', 'Power BI'],
  },
  {
    name: 'Développement',
    items: ['FastAPI', 'Flask', 'Node.js', 'Express', 'Django REST', 'React', 'Vite', 'Playwright'],
  },
  {
    name: 'Cloud et DevOps',
    items: ['AWS', 'Docker', 'Docker Compose', 'Git', 'GitHub Actions', 'Linux', 'Nginx', 'Gunicorn'],
  },
  {
    name: 'Sécurité et conformité',
    items: ['KYC / LCB-FT', 'Traçabilité des IA', 'Loi CNDP', 'EBIOS RM', 'Security Onion', 'Sécurité réseau'],
  },
]

/**
 * Homelab : feuille de route, services, liens publics en lecture seule, sessions enregistrées.
 */

export type PhaseStatus = 'terminée' | 'en cours' | 'à venir';

export interface Phase {
  name: string;
  status: PhaseStatus;
  /** Ce que contient la phase, en une phrase. Vide = à compléter. */
  content: string;
}

export interface Service {
  name: string;
  /** Rôle du service, ex. « supervision », « reverse proxy ». */
  role: string;
  /** État du service, affiché en pastille. */
  status: 'en place' | 'en cours';
}

export interface MakeTarget {
  name: string;
  tool: string;
  role: string;
  /** Extrait du journal réel de cette étape, rejoué par « make » dans le terminal. Vide = rien à rejouer. */
  log: string[];
}

export interface Recording {
  title: string;
  description: string;
  /** Lien vers l'enregistrement asciinema (ou fichier .cast dans public/). */
  url: string;
}

export const phases: Phase[] = [
  { name: 'Phase 1', status: 'terminée', content: 'Infrastructure as Code, Linux, Kubernetes' },
  { name: 'Phase 2', status: 'en cours', content: 'Pipelines, conteneurs, déploiement continu' },
  { name: 'Phase 3', status: 'à venir', content: 'Métriques, logs, alerting' },
  { name: 'Phase 4', status: 'à venir', content: 'Réseau, identité, secrets, politiques, sauvegardes' },
  { name: 'Phase 5', status: 'à venir', content: 'Incidents, runbooks, restauration' },
];

export const services: Service[] = [
  { name: 'Proxmox VE', role: 'hyperviseur : machines virtuelles Debian', status: 'en place' },
  { name: 'Terraform', role: 'création des VM depuis le code', status: 'en place' },
  { name: 'Ansible', role: 'configuration des nœuds (utilisateurs, SSH, pare-feu)', status: 'en place' },
  { name: 'kubeadm', role: 'cluster Kubernetes : 1 control plane, 2 workers', status: 'en place' },
  { name: 'Calico', role: 'réseau des pods', status: 'en place' },
  { name: 'MetalLB', role: 'adresses IP des services LoadBalancer', status: 'en place' },
  { name: 'local-path', role: 'stockage persistant', status: 'en place' },
  { name: 'Traefik', role: 'reverse proxy et ingress', status: 'en cours' },
  { name: 'Trivy', role: 'scan de vulnérabilités des images', status: 'en cours' },
  { name: 'ArgoCD', role: 'déploiement continu GitOps', status: 'en cours' },
];

export const makeTargets: MakeTarget[] = [
  {
    name: 'infra',
    tool: 'Terraform',
    role: "crée les 3 VM sur Proxmox et génère l'inventaire Ansible",
    log: ['Plan: 4 to add, 0 to change, 0 to destroy.', 'Apply complete! Resources: 4 added, 0 changed, 0 destroyed.'],
  },
  {
    name: 'configure',
    tool: 'Ansible',
    role: 'prépare les nœuds, initialise le control plane et fait rejoindre les workers',
    log: [
      'k8s-cp-1     : ok=33 changed=19 unreachable=0 failed=0',
      'k8s-worker-1 : ok=27 changed=15 unreachable=0 failed=0',
      'k8s-worker-2 : ok=27 changed=15 unreachable=0 failed=0',
    ],
  },
  {
    name: 'platform',
    tool: 'Helm',
    role: 'installe le réseau des pods, le LoadBalancer et le stockage',
    log: [],
  },
  {
    name: 'test',
    tool: 'Smoke test',
    role: 'vérifie les 3 nœuds Ready, le DNS interne, un service LoadBalancer et le stockage persistant',
    log: [],
  },
];

export const destroyLog = ['Destroy complete! Resources: 4 destroyed.'];

export const homelabLinks = {
  /** Page de statut publique (ex. Uptime Kuma derrière un tunnel). */
  status: '',
  /** Tableau de bord Grafana public en lecture seule. */
  grafana: '',
  /** Dépôt du code d'infrastructure (Terraform, Ansible…). */
  repo: 'https://github.com/Stefy237/Homelab',
};

export const recordings: Recording[] = [];

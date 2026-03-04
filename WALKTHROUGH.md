# EOD Handover: Advanced DevOps Setup for talent-metric

This document provides everything needed to manage the advanced DevOps setup for the talent-metric application.

## 🚀 CI/CD Pipeline (GitHub Actions)
Fully automated build and deployment pipeline located in `.github/workflows/deploy.yml`.

### Required GitHub Secrets
Add these secrets to your GitHub repository:
- `AWS_ROLE_ARN`: The ARN of the IAM Role for GitHub Actions (OIDC).
- `AWS_REGION`: e.g., `us-east-1`.

> [!NOTE]
> Since we are using **GitHub OIDC**, you do NOT need to store `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`. This is the most secure method.

### Unified GitOps Deployment Flow
Our pipeline follows a **GitOps pattern**, where the repository remains the source of truth for the cluster state.

1.  **Build**: Backend and Frontend images are built and pushed to ECR with the Git SHA as a tag.
2.  **Manifest Update**: The pipeline automatically runs `sed` to update the image tags in `k8s/dev-setup.yaml` or `k8s/prod-setup.yaml`.
3.  **Audit Trail**: The pipeline **commits and pushes** these changes back to your branch (marked with `[skip ci]`). This gives you a perfect history of exactly which version is deployed.
4.  **Deployment**: Finally, it runs `kubectl apply` to sync the cluster with the newly updated manifests.

- **Dev**: Triggered on push to `dev`.
- **Prod**: Triggered on push to `main` (requires manual approval in GitHub Actions).

---

## 🛡️ Kubernetes Hardening & Security
We've implemented industry-standard security and reliability measures.

### 1. Scaling & Availability (Advanced)
- **Horizontal Pod Autoscaler (HPA)**:
  - **Prod Backend**: Scales from 2 to 10 replicas based on 60% CPU utilization.
  - **Prod Frontend**: Scales from 2 to 5 replicas based on 70% CPU utilization.
- **Pod Disruption Budget (PDB)**:
  - Ensures at least 1 pod of backend and frontend is ALWAYS available during maintenance or node upgrades.

### 2. Security (IRSA & Secrets)
- **IRSA (IAM Roles for Service Accounts)**: Pods use specific IAM roles to access AWS resources, eliminating the need for hardcoded keys in the cluster.
- **AWS Secrets Manager**: Integration via `SecretProviderClass`. Passwords and JWT secrets are fetched dynamically from AWS.

### 3. Isolation (Network Policies)
- **Database**: Only accessible from the Backend.
- **Backend**: Only accessible from the Frontend.

---

## 🛠️ Deployment Instructions (Manual)
If you need to apply changes manually:

```powershell
# For Dev environment
kubectl apply -f k8s/dev-setup.yaml

# For Prod environment
kubectl apply -f k8s/prod-setup.yaml
```

---

## 📝 Ongoing Maintenance
1. **Secrets**: Update secrets in AWS Secrets Manager (`talent-metric/dev/secrets` or `talent-metric/prod/secrets`).
2. **Cluster Name**: If your cluster name is NOT `talent-metric-cluster`, update it in `.github/workflows/deploy.yml`.
3. **Ingress Host**: Ensure your DNS provider points `dev.talent-metric.athivaone.com` and `talent-metric.athivaone.com` to the created ALB.

**Handover Status: READY FOR COMPLETION.**

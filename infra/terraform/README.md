# Terraform Infrastructure Stack

This Terraform configuration provisions the core production infrastructure for PDF Compressor Pro on AWS.

## Resources

The stack creates the following managed services:

- **VPC** with public + private subnets across multiple AZs, NAT gateway, and tagging.
- **Amazon RDS for PostgreSQL** (multi-AZ, encrypted at rest, backups, CloudWatch logs).
- **Amazon RDS for PostgreSQL** (multi-AZ, encrypted at rest, backups, CloudWatch logs, optional read replica).
- **Amazon ElastiCache for Redis** (TLS enabled, auth token requirement, subnet group, SG).
- **S3 Bucket** for storing compressed/uploaded artifacts with versioning + lifecycle rules.
- **AWS Secrets Manager secrets** exposing `DATABASE_URL` and `REDIS_URL` for the app layer.

All resources are tagged with project/environment metadata for cost reporting.

## Usage

1. Copy `terraform.tfvars.example` → `terraform.tfvars` and fill in values for your environment (database credentials, Redis auth token, bucket overrides, etc.).
2. Set AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, optionally `AWS_SESSION_TOKEN`).
3. Initialize Terraform modules:

   ```bash
   terraform init
   ```

4. Review the plan:

   ```bash
   terraform plan
   ```

5. Apply the infrastructure:

   ```bash
   terraform apply
   ```

Outputs include RDS/Redis endpoints (including replica if enabled), bucket name, and Secrets Manager ARNs.

## Application Wiring

After applying, update your application configuration:

- Set `DATABASE_URL` to the secret from `aws secretsmanager get-secret-value --secret-id <.../DATABASE_URL>`.
- Set `REDIS_URL` to the secret from `.../REDIS_URL`.
- Configure S3 credentials in the server `.env` (bucket name and region).
- If using CloudFront/Route53, layer those distributions on top of the created bucket (optional).

### Environment variables (`server/.env.example`)

```
DATABASE_URL=postgresql://<user>:<password>@<endpoint>:5432/<db>
REDIS_URL=rediss://:<token>@<endpoint>:6379
AWS_S3_BUCKET=<bucket-name>
AWS_REGION=<aws-region>
```

Ensure the application container/pods have IAM access (via instance profile or secrets injection) to read these values securely.

## Notes

- NAT gateway incurs hourly and data transfer costs; for staging you can disable it (`enable_nat_gateway = false`).
- Adjust instance sizes (`db_instance_class`, `db_read_replica_instance_class`, `redis_node_type`) for workload requirements.
- Backups + PITR: the module enables automated backups (`db_backup_retention`) and encrypted storage; use `aws rds describe-db-instances --db-instance-identifier <id>` to confirm retention and `aws rds restore-db-instance-to-point-in-time` when running DR drills.
- Readiness: the application exposes `/health` (checks Postgres connectivity) which is wired into Docker health checks and should be referenced by your orchestrator.
- Consider enabling Performance Insights on RDS (set `performance_insights_enabled = true`).
- Add DNS/ACM/CloudFront modules as needed for production domains.

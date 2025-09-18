terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.extra_tags,
  )

  db_ingress_cidrs    = length(var.db_allowed_cidrs) > 0 ? var.db_allowed_cidrs : module.network.private_subnets_cidr_blocks
  redis_ingress_cidrs = length(var.redis_allowed_cidrs) > 0 ? var.redis_allowed_cidrs : module.network.private_subnets_cidr_blocks
}

module "network" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-${var.environment}-vpc"

  cidr = var.vpc_cidr
  azs  = var.availability_zones

  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = local.tags
}

module "db_security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-${var.environment}-db"
  description = "Security group for PostgreSQL"
  vpc_id      = module.network.vpc_id

  ingress_cidr_blocks = local.db_ingress_cidrs
  ingress_rules       = ["postgresql-tcp"]

  egress_rules = ["all-all"]

  tags = local.tags
}

module "redis_security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-${var.environment}-redis"
  description = "Security group for Redis"
  vpc_id      = module.network.vpc_id

  ingress_cidr_blocks = local.redis_ingress_cidrs
  ingress_rules       = ["redis-tcp"]

  egress_rules = ["all-all"]

  tags = local.tags
}

module "database" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.5"

  identifier = "${var.project_name}-${var.environment}-postgres"

  engine               = "postgres"
  engine_version       = var.db_engine_version
  family               = var.db_parameter_group_family
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_storage_gb
  max_allocated_storage = var.db_max_storage_gb
  storage_encrypted    = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  multi_az               = var.db_multi_az
  publicly_accessible    = false
  skip_final_snapshot    = var.db_skip_final_snapshot
  deletion_protection    = var.db_deletion_protection
  backup_retention_period = var.db_backup_retention
  preferred_backup_window = var.db_backup_window
  maintenance_window      = var.db_maintenance_window

  monitoring_interval          = 60
  iam_database_authentication_enabled = true

  vpc_security_group_ids = [module.db_security_group.security_group_id]
  subnet_ids             = module.network.private_subnets

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = local.tags
}

resource "aws_db_instance" "read_replica" {
  count = var.db_enable_read_replica ? 1 : 0

  replicate_source_db = module.database.db_instance_identifier
  instance_class       = var.db_read_replica_instance_class
  publicly_accessible  = false
  auto_minor_version_upgrade = true
  performance_insights_enabled = true
  monitoring_interval         = 60

  tags = local.tags
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-${var.environment}-redis"
  subnet_ids = module.network.private_subnets

  tags = local.tags
}

module "redis" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "~> 4.5"

  cluster_mode_enabled = false

  name                 = "${var.project_name}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = var.redis_engine_version
  node_type            = var.redis_node_type
  number_cache_clusters = var.redis_num_nodes

  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [module.redis_security_group.security_group_id]

  maintenance_window = var.redis_maintenance_window

  parameter_group_name = var.redis_parameter_group

  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = var.redis_auth_token

  tags = local.tags
}

module "storage" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 4.1"

  bucket = var.storage_bucket_name != "" ? var.storage_bucket_name : "${var.project_name}-${var.environment}-files"

  force_destroy                = false
  attach_deny_insecure_transport_policy = true
  block_public_acls            = true
  block_public_policy          = true
  ignore_public_acls           = true
  restrict_public_buckets      = true

  versioning = {
    status = "Enabled"
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "aws:kms"
      }
    }
  }

  lifecycle_rules = [
    {
      id      = "cleanup-old-artifacts"
      enabled = true

      abort_incomplete_multipart_upload_days = 7

      noncurrent_version_expiration = {
        days = 30
      }

      transition = [{
        days          = 30
        storage_class = "STANDARD_IA"
      }]
    }
  ]

  logging = var.storage_logging_bucket != "" ? {
    target_bucket = var.storage_logging_bucket
    target_prefix = "${var.project_name}/${var.environment}/"
  } : null

  tags = local.tags
}

module "secrets" {
  source  = "terraform-aws-modules/secrets-manager/aws"
  version = "~> 1.1"

  secrets = {
    database-url = {
      name        = "${var.project_name}/${var.environment}/DATABASE_URL"
      description = "PostgreSQL connection string"
      secret_string = jsonencode({
        value = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_instance_endpoint}:${module.database.db_instance_port}/${var.db_name}"
      })
      tags = local.tags
    }

    redis-url = {
      name        = "${var.project_name}/${var.environment}/REDIS_URL"
      description = "Redis connection string"
      secret_string = jsonencode({
        value = "rediss://:${var.redis_auth_token}@${module.redis.primary_endpoint_address}:${module.redis.port}"
      })
      tags = local.tags
    }
  }
}

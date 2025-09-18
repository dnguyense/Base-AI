variable "project_name" {
  description = "Name of the project used for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment identifier (e.g. production, staging)."
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy infrastructure."
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones to spread resources across."
  type        = list(string)
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "public_subnets" {
  description = "List of CIDR blocks for public subnets (NAT/ingress)."
  type        = list(string)
}

variable "private_subnets" {
  description = "List of CIDR blocks for private subnets (app/data)."
  type        = list(string)
}

variable "db_name" {
  description = "Name of the Postgres database to create."
  type        = string
  default     = "pdf_compressor"
}

variable "db_username" {
  description = "Master username for Postgres."
  type        = string
}

variable "db_password" {
  description = "Master password for Postgres."
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "Postgres engine version."
  type        = string
  default     = "15.5"
}

variable "db_parameter_group_family" {
  description = "Parameter group family for Postgres."
  type        = string
  default     = "postgres15"
}

variable "db_instance_class" {
  description = "Instance class for Postgres."
  type        = string
  default     = "db.t3.medium"
}

variable "db_storage_gb" {
  description = "Allocated storage (GB) for Postgres."
  type        = number
  default     = 50
}

variable "db_max_storage_gb" {
  description = "Maximum auto-scaling storage (GB) for Postgres."
  type        = number
  default     = 200
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for Postgres."
  type        = bool
  default     = true
}

variable "db_skip_final_snapshot" {
  description = "Skip final snapshot on destroy (useful for non-prod)."
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Enable deletion protection for the database instance."
  type        = bool
  default     = true
}

variable "db_backup_retention" {
  description = "Number of days to retain automated backups."
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "Preferred backup window (UTC)."
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Preferred maintenance window (UTC)."
  type        = string
  default     = "sun:05:00-sun:06:00"
}

variable "db_enable_read_replica" {
  description = "Whether to create a managed read replica for Postgres."
  type        = bool
  default     = false
}

variable "db_read_replica_instance_class" {
  description = "Instance class for the Postgres read replica."
  type        = string
  default     = "db.t3.medium"
}

variable "db_allowed_cidrs" {
  description = "List of CIDR blocks allowed to connect to Postgres."
  type        = list(string)
  default     = []
}

variable "redis_engine_version" {
  description = "Redis engine version."
  type        = string
  default     = "7.1"
}

variable "redis_node_type" {
  description = "Instance type for Redis."
  type        = string
  default     = "cache.t3.small"
}

variable "redis_num_nodes" {
  description = "Number of Redis cache clusters (1 for primary, >1 for replicas)."
  type        = number
  default     = 1
}

variable "redis_parameter_group" {
  description = "Elasticache parameter group name."
  type        = string
  default     = "default.redis7"
}

variable "redis_maintenance_window" {
  description = "Preferred maintenance window for Redis (UTC)."
  type        = string
  default     = "sun:06:00-sun:07:00"
}

variable "redis_allowed_cidrs" {
  description = "List of CIDR blocks allowed to connect to Redis."
  type        = list(string)
  default     = []
}

variable "redis_auth_token" {
  description = "Auth token used when transit encryption is enabled."
  type        = string
  sensitive   = true
}

variable "storage_bucket_name" {
  description = "Optional override for S3 bucket name."
  type        = string
  default     = ""
}

variable "storage_logging_bucket" {
  description = "Optional S3 bucket to receive access logs."
  type        = string
  default     = ""
}

variable "extra_tags" {
  description = "Additional resource tags to merge with defaults."
  type        = map(string)
  default     = {}
}

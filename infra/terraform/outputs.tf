output "vpc_id" {
  description = "Identifier of the created VPC"
  value       = module.network.vpc_id
}

output "private_subnets" {
  description = "List of private subnet IDs"
  value       = module.network.private_subnets
}

output "public_subnets" {
  description = "List of public subnet IDs"
  value       = module.network.public_subnets
}

output "database_endpoint" {
  description = "Endpoint of the PostgreSQL instance"
  value       = module.database.db_instance_endpoint
}

output "database_port" {
  description = "Port of the PostgreSQL instance"
  value       = module.database.db_instance_port
}

output "database_read_replica_endpoint" {
  description = "Endpoint of the read replica (if enabled)"
  value       = try(aws_db_instance.read_replica[0].address, null)
}

output "redis_endpoint" {
  description = "Primary endpoint for the Redis cluster"
  value       = module.redis.primary_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = module.redis.port
}

output "storage_bucket" {
  description = "Name of the S3 bucket used for file storage"
  value       = module.storage.s3_bucket_id
}

output "secrets_manager_arns" {
  description = "ARNs of secrets created for application consumption"
  value       = module.secrets.secret_arns
}

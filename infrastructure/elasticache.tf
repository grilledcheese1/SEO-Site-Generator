resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "seoweboptimizer-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "seoweboptimizer-cache"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.redis_sg.id]
}

resource "aws_secretsmanager_secret" "redis_url" {
  name = "seoweboptimizer/redis-url"
}

resource "aws_secretsmanager_secret_version" "redis_url_version" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = "redis://\${aws_elasticache_cluster.redis.cache_nodes[0].address}:\${aws_elasticache_cluster.redis.cache_nodes[0].port}"
}

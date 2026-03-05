resource "aws_db_instance" "postgres" {
  identifier             = "seoweboptimizer-db"
  allocated_storage      = 20
  max_allocated_storage  = 100
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = "db.t4g.micro"
  db_name                = "seoweboptimizer"
  username               = "dbadmin"
  password               = random_password.db_password.result
  parameter_group_name   = "default.postgres15"
  skip_final_snapshot    = true
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  performance_insights_enabled = true
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Automatically stores DB credential in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "seoweboptimizer/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = aws_db_instance.postgres.username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.postgres.endpoint
    port     = aws_db_instance.postgres.port
    dbInstanceIdentifier = aws_db_instance.postgres.identifier
  })
}

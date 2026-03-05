resource "aws_sqs_queue" "jobs_queue" {
  name                        = "seoweboptimizer-jobs.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  
  # Consumer visibility timeout matches worst-case LLM queue (2 minutes max)
  visibility_timeout_seconds  = 180 
  
  # Enforces Long-Polling max efficiency across consumers
  receive_wait_time_seconds   = 20
}

# Automatically stores the queue URL securely for the ECS Fargate containers
resource "aws_secretsmanager_secret" "sqs_url" {
  name = "seoweboptimizer/sqs-url"
}

resource "aws_secretsmanager_secret_version" "sqs_url_version" {
  secret_id     = aws_secretsmanager_secret.sqs_url.id
  secret_string = aws_sqs_queue.jobs_queue.id
}

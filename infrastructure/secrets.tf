data "aws_iam_policy_document" "secrets_manager_access" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = [
      aws_secretsmanager_secret.db_credentials.arn,
      aws_secretsmanager_secret.redis_url.arn,
      aws_secretsmanager_secret.anthropic_api_key.arn,
      aws_secretsmanager_secret.sqs_url.arn
    ]
  }
}

resource "aws_iam_policy" "ecs_secrets_policy" {
  name        = "seoweboptimizer-ecs-secrets"
  description = "Allows ECS containers to load API keys and DB links at runtime"
  policy      = data.aws_iam_policy_document.secrets_manager_access.json
}

resource "aws_iam_role_policy_attachment" "ecs_attach_secrets" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_policy.arn
}

resource "aws_secretsmanager_secret" "anthropic_api_key" {
  name = "seoweboptimizer/anthropic-api-key"
}

# WARNING: The actual API key value must be set manually into Secrets Manager via AWS CLI or Console.
# Never hardcode it here.

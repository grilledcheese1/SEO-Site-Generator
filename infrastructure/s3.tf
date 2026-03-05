resource "aws_s3_bucket" "outputs" {
  bucket = "seoweboptimizer-outputs"
}

resource "aws_s3_bucket_public_access_block" "outputs_block" {
  bucket = aws_s3_bucket.outputs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "outputs_lifecycle" {
  bucket = aws_s3_bucket.outputs.id

  rule {
    id     = "clean_old_themes"
    status = "Enabled"

    expiration {
      days = 7
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "outputs_cors" {
  bucket = aws_s3_bucket.outputs.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["https://seoweboptimizer.com"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

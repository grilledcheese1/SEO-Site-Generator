type SchemaProps = {
  json: Record<string, unknown>;
};

export default function Schema({ json }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

